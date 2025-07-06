import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function createServerClient() {
  const cookieStore = await cookies()
  return createPagesServerClient({ cookies: () => cookieStore })
}

// Test connection function
export async function testSupabaseConnection() {
  try {
    const supabase = await createServerClient()
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
