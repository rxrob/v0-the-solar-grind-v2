import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/"

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.exchangeCodeForSession(code)

      if (sessionError) {
        console.error("Session exchange error:", sessionError)
        return NextResponse.redirect(new URL("/login?error=auth_error", requestUrl.origin))
      }

      if (session?.user) {
        // Check if user exists in our users table
        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Error fetching user:", fetchError)
        }

        // Create or update user profile
        if (!existingUser) {
          const { error: insertError } = await supabase.from("users").insert({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || "",
            avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || "",
            subscription_type: "free",
            single_reports_purchased: 0,
            single_reports_used: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (insertError) {
            console.error("Error creating user profile:", insertError)
            // Don't fail the auth flow, just log the error
          }
        } else {
          // Update existing user with latest info
          const { error: updateError } = await supabase
            .from("users")
            .update({
              email: session.user.email,
              full_name:
                session.user.user_metadata?.full_name || session.user.user_metadata?.name || existingUser.full_name,
              avatar_url:
                session.user.user_metadata?.avatar_url ||
                session.user.user_metadata?.picture ||
                existingUser.avatar_url,
              updated_at: new Date().toISOString(),
            })
            .eq("id", session.user.id)

          if (updateError) {
            console.error("Error updating user profile:", updateError)
            // Don't fail the auth flow, just log the error
          }
        }
      }

      // Redirect to the intended page or dashboard
      const redirectUrl = next.startsWith("/") ? next : "/dashboard"
      return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin))
    } catch (error) {
      console.error("Auth callback error:", error)
      return NextResponse.redirect(new URL("/login?error=callback_error", requestUrl.origin))
    }
  }

  // No code provided, redirect to login
  return NextResponse.redirect(new URL("/login?error=no_code", requestUrl.origin))
}
