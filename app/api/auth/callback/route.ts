import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  console.log("🔄 Auth callback received:", { code: !!code, next })

  if (code) {
    const supabase = createClient()

    try {
      console.log("🔐 Exchanging code for session...")
      const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

      if (sessionError) {
        console.error("❌ Session exchange error:", sessionError)
        return NextResponse.redirect(`${origin}/login?error=auth_error`)
      }

      if (!sessionData.user) {
        console.error("❌ No user in session data")
        return NextResponse.redirect(`${origin}/login?error=no_user`)
      }

      console.log("✅ Session exchange successful for user:", sessionData.user.id)

      // Check if user profile exists using maybeSingle()
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", sessionData.user.id)
        .maybeSingle()

      if (fetchError) {
        console.error("❌ Error fetching user profile:", fetchError)
        // Continue anyway - profile will be created by the hook
      }

      if (!existingUser) {
        console.log("👤 Creating new user profile for:", sessionData.user.id)

        const newUserData = {
          id: sessionData.user.id,
          email: sessionData.user.email || "",
          full_name: sessionData.user.user_metadata?.full_name || sessionData.user.user_metadata?.name || null,
          avatar_url: sessionData.user.user_metadata?.avatar_url || sessionData.user.user_metadata?.picture || null,
          subscription_type: "free" as const,
          subscription_status: "active",
          stripe_customer_id: null,
          single_reports_purchased: 1, // Give 1 free advanced report
          single_reports_used: 0,
          pro_trial_used: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const { error: insertError } = await supabase.from("users").insert([newUserData])

        if (insertError) {
          console.error("❌ Error creating user profile:", insertError)
          // Don't fail the auth flow - the hook will handle profile creation
        } else {
          console.log("✅ Successfully created user profile")
        }
      } else {
        console.log("👤 User profile already exists, updating metadata...")

        // Update user metadata if needed
        const updates: any = {
          updated_at: new Date().toISOString(),
        }

        if (sessionData.user.user_metadata?.full_name && !existingUser.full_name) {
          updates.full_name = sessionData.user.user_metadata.full_name
        }

        if (sessionData.user.user_metadata?.avatar_url && !existingUser.avatar_url) {
          updates.avatar_url = sessionData.user.user_metadata.avatar_url
        }

        if (Object.keys(updates).length > 1) {
          // More than just updated_at
          const { error: updateError } = await supabase.from("users").update(updates).eq("id", sessionData.user.id)

          if (updateError) {
            console.error("❌ Error updating user profile:", updateError)
          } else {
            console.log("✅ Successfully updated user profile")
          }
        }
      }

      console.log("🔄 Redirecting to:", next)
      return NextResponse.redirect(`${origin}${next}`)
    } catch (error) {
      console.error("❌ Unexpected error in auth callback:", error)
      return NextResponse.redirect(`${origin}/login?error=callback_error`)
    }
  }

  console.log("❌ No code provided, redirecting to login")
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
