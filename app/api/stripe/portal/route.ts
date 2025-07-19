import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"
import { getURL } from "@/lib/utils"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single()

    if (profileError || !profile?.stripe_customer_id) {
      console.error("Stripe customer ID not found for user:", user.id, profileError)
      return new NextResponse(JSON.stringify({ error: { message: "Stripe customer not found." } }), { status: 400 })
    }

    const { url } = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${getURL()}/dashboard`,
    })

    return NextResponse.json({ url })
  } catch (err: any) {
    console.error("Stripe portal session creation error:", err)
    return new NextResponse(JSON.stringify({ error: { message: err.message } }), { status: 500 })
  }
}
