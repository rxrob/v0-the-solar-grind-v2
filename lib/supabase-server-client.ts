import { createServerClient as createSupabaseClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function getSupabaseClient() {
  const cookieStore = await cookies()

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set(name, value, options)
      },
      remove(name: string, options: any) {
        cookieStore.set(name, "", options)
      },
    },
  })
}

// Test connection function
export async function testSupabaseConnection() {
  try {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      console.error("Supabase connection test failed:", error)
      return { success: false, error: error.message }
    }

    return { success: true, message: "Supabase connection successful" }
  } catch (error) {
    console.error("Supabase connection test error:", error)
    return { success: false, error: "Failed to connect to Supabase" }
  }
}
