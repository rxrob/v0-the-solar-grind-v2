import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
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
  })
}

export async function createAdminSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
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
  })
}

export async function getUserFromSession() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return { success: false, user: null, error: error?.message || "No user found" }
    }

    // Get additional user data from our users table
    const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (userError) {
      console.error("Error fetching user data:", userError)
      return {
        success: true,
        user: {
          ...user,
          subscription_type: "free",
          calculations_used: 0,
          monthly_calculation_limit: 3,
        },
      }
    }

    return {
      success: true,
      user: {
        ...user,
        ...userData,
      },
    }
  } catch (error) {
    console.error("Get user from session error:", error)
    return {
      success: false,
      user: null,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function updateUserSubscription(userId: string, subscriptionData: any) {
  try {
    const supabase = await createAdminSupabaseClient()

    const { data, error } = await supabase
      .from("users")
      .update({
        ...subscriptionData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating user subscription:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Update user subscription error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update subscription",
    }
  }
}
