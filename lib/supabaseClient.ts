import { createBrowserClient } from "@supabase/auth-helpers-nextjs"

// Create a singleton Supabase client for the browser
const supabase = createBrowserClient()

export default supabase
