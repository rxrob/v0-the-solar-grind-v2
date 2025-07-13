import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Create a singleton instance to prevent re-initialization
let supabaseInstance: ReturnType<typeof createClientComponentClient> | null = null

function createSupabaseBrowserClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient()
  }
  return supabaseInstance
}

// Export the singleton instance
export const supabase = createSupabaseBrowserClient()

// Export for compatibility
export default supabase
