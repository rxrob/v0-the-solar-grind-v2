import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const createSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}

export const createServiceSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export const isSupabaseAvailable = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

export const supabase = createSupabaseClient()
