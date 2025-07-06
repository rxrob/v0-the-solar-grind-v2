import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
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

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
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

export async function testServerConnection() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      console.error("Server connection test failed:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Server connection test error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
