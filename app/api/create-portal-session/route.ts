import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { absoluteUrl } from "@/lib/utils"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database to get stripe_customer_id
    const { data: userData, error } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single()

    if (error || !userData?.stripe_customer_id) {
      return NextResponse.json({ error: "No customer found" }, { status: 404 })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userData.stripe_customer_id,
      return_url: absoluteUrl("/dashboard"),
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error("Error creating portal session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
