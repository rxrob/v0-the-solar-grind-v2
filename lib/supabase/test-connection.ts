import { createClient } from "./server"

export async function testServerConnection() {
  const supabase = createClient()
  try {
    const { error } = await supabase.from("users").select("id").limit(1)
    if (error) {
      // Don't throw the error, but return a failure state
      // This allows the API route to report the error message
      return { success: false, error: error.message }
    }
    return { success: true, error: null }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
