import { createBrowserClient } from "@supabase/ssr"

export const createClient = () =>
  createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export const getCurrentUser = async () => {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error("Error getting user:", error)
    return { user: null, error }
  }

  return { user, error: null }
}

export const signOut = async () => {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Error signing out:", error)
    return { error }
  }

  return { error: null }
}
