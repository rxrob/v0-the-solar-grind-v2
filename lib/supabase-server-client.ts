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

export async function getServerUser() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Error getting user:", error)
      return { user: null, error: error.message }
    }

    return { user, error: null }
  } catch (error) {
    console.error("Server user fetch error:", error)
    return {
      user: null,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getUserSubscriptionStatus(userId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from("users")
      .select("subscription_status, subscription_type, trial_ends_at")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error getting subscription status:", error)
      return {
        subscription_status: "free",
        subscription_type: "free",
        trial_ends_at: null,
      }
    }

    return data
  } catch (error) {
    console.error("Subscription status fetch error:", error)
    return {
      subscription_status: "free",
      subscription_type: "free",
      trial_ends_at: null,
    }
  }
}
