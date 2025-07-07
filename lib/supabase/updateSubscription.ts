import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function upgradeUserToPro(stripeCustomerId: string) {
  console.log("Upgrading user to pro:", stripeCustomerId)

  try {
    // Find user by Stripe customer ID
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("id, email, subscription_type")
      .eq("stripe_customer_id", stripeCustomerId)
      .single()

    if (fetchError || !user) {
      console.error("User not found for Stripe customer:", stripeCustomerId, fetchError)
      return { success: false, error: "User not found" }
    }

    // Update user to pro subscription
    const { error: updateError } = await supabase
      .from("users")
      .update({
        subscription_type: "pro",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Failed to upgrade user to pro:", updateError)
      return { success: false, error: "Failed to update subscription" }
    }

    console.log("Successfully upgraded user to pro:", user.email)
    return { success: true, user }
  } catch (error) {
    console.error("Error in upgradeUserToPro:", error)
    return { success: false, error: "Internal error" }
  }
}

export async function downgradeUserToFree(stripeCustomerId: string) {
  console.log("Downgrading user to free:", stripeCustomerId)

  try {
    // Find user by Stripe customer ID
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("id, email, subscription_type")
      .eq("stripe_customer_id", stripeCustomerId)
      .single()

    if (fetchError || !user) {
      console.error("User not found for Stripe customer:", stripeCustomerId, fetchError)
      return { success: false, error: "User not found" }
    }

    // Update user to free subscription
    const { error: updateError } = await supabase
      .from("users")
      .update({
        subscription_type: "free",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Failed to downgrade user to free:", updateError)
      return { success: false, error: "Failed to update subscription" }
    }

    console.log("Successfully downgraded user to free:", user.email)
    return { success: true, user }
  } catch (error) {
    console.error("Error in downgradeUserToFree:", error)
    return { success: false, error: "Internal error" }
  }
}

export async function addSingleReportPurchase(email: string) {
  console.log("Adding single report purchase for:", email)

  try {
    // Find user by email
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("id, email, single_reports_purchased, single_reports_used")
      .eq("email", email)
      .single()

    if (fetchError || !user) {
      console.error("User not found for email:", email, fetchError)
      return { success: false, error: "User not found" }
    }

    // Increment single reports purchased
    const { error: updateError } = await supabase
      .from("users")
      .update({
        single_reports_purchased: (user.single_reports_purchased || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Failed to add single report purchase:", updateError)
      return { success: false, error: "Failed to update purchase count" }
    }

    console.log("Successfully added single report purchase for:", email)
    return { success: true, user }
  } catch (error) {
    console.error("Error in addSingleReportPurchase:", error)
    return { success: false, error: "Internal error" }
  }
}

export async function useSingleReport(userId: string) {
  console.log("Using single report for user:", userId)

  try {
    // Get current usage
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("single_reports_purchased, single_reports_used")
      .eq("id", userId)
      .single()

    if (fetchError || !user) {
      console.error("User not found:", userId, fetchError)
      return { success: false, error: "User not found" }
    }

    const purchased = user.single_reports_purchased || 0
    const used = user.single_reports_used || 0

    if (used >= purchased) {
      console.log("No single reports remaining for user:", userId)
      return { success: false, error: "No reports remaining" }
    }

    // Increment usage
    const { error: updateError } = await supabase
      .from("users")
      .update({
        single_reports_used: used + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateError) {
      console.error("Failed to increment single report usage:", updateError)
      return { success: false, error: "Failed to update usage" }
    }

    console.log("Successfully used single report for user:", userId)
    return { success: true, remaining: purchased - used - 1 }
  } catch (error) {
    console.error("Error in useSingleReport:", error)
    return { success: false, error: "Internal error" }
  }
}
