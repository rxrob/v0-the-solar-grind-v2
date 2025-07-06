import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function upgradeUserToPro(stripeCustomerId: string) {
  try {
    console.log("Upgrading user to pro for Stripe customer:", stripeCustomerId)

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, subscription_type")
      .eq("stripe_customer_id", stripeCustomerId)
      .single()

    if (error || !user) {
      console.error("User not found for Stripe customer ID:", stripeCustomerId, error)
      return { success: false, error: "User not found" }
    }

    console.log("Found user:", user.email, "Current subscription:", user.subscription_type)

    const { error: updateError } = await supabase
      .from("users")
      .update({
        subscription_type: "pro",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Failed to upgrade user to pro:", updateError)
      return { success: false, error: updateError.message }
    }

    console.log("Successfully upgraded user to pro:", user.email)
    return { success: true, user }
  } catch (error) {
    console.error("Error in upgradeUserToPro:", error)
    return { success: false, error: "Internal server error" }
  }
}

export async function downgradeUserFromPro(stripeCustomerId: string) {
  try {
    console.log("Downgrading user from pro for Stripe customer:", stripeCustomerId)

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, subscription_type")
      .eq("stripe_customer_id", stripeCustomerId)
      .single()

    if (error || !user) {
      console.error("User not found for Stripe customer ID:", stripeCustomerId, error)
      return { success: false, error: "User not found" }
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({
        subscription_type: "free",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Failed to downgrade user from pro:", updateError)
      return { success: false, error: updateError.message }
    }

    console.log("Successfully downgraded user from pro:", user.email)
    return { success: true, user }
  } catch (error) {
    console.error("Error in downgradeUserFromPro:", error)
    return { success: false, error: "Internal server error" }
  }
}

export async function addSingleReport(email: string) {
  try {
    console.log("Adding single report for user:", email)

    const { data: user, error } = await supabase
      .from("users")
      .select("id, single_reports_purchased")
      .eq("email", email)
      .single()

    if (error || !user) {
      console.error("User not found for email:", email, error)
      return { success: false, error: "User not found" }
    }

    const newCount = (user.single_reports_purchased || 0) + 1

    const { error: updateError } = await supabase
      .from("users")
      .update({
        single_reports_purchased: newCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Failed to add single report:", updateError)
      return { success: false, error: updateError.message }
    }

    console.log("Successfully added single report for user:", email, "New count:", newCount)
    return { success: true, user: { ...user, single_reports_purchased: newCount } }
  } catch (error) {
    console.error("Error in addSingleReport:", error)
    return { success: false, error: "Internal server error" }
  }
}

export async function useSingleReport(userId: string) {
  try {
    console.log("Using single report for user:", userId)

    const { data: user, error } = await supabase
      .from("users")
      .select("id, single_reports_purchased, single_reports_used")
      .eq("id", userId)
      .single()

    if (error || !user) {
      console.error("User not found for ID:", userId, error)
      return { success: false, error: "User not found" }
    }

    const purchased = user.single_reports_purchased || 0
    const used = user.single_reports_used || 0

    if (used >= purchased) {
      console.log("User has no unused single reports:", userId)
      return { success: false, error: "No unused reports available" }
    }

    const newUsedCount = used + 1

    const { error: updateError } = await supabase
      .from("users")
      .update({
        single_reports_used: newUsedCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Failed to use single report:", updateError)
      return { success: false, error: updateError.message }
    }

    console.log("Successfully used single report for user:", userId, "Used count:", newUsedCount)
    return { success: true, user: { ...user, single_reports_used: newUsedCount } }
  } catch (error) {
    console.error("Error in useSingleReport:", error)
    return { success: false, error: "Internal server error" }
  }
}
