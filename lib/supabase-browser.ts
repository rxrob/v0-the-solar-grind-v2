// This file is a shim to redirect imports to the correct location.
import { createClient as createBrowserClient } from "./supabase/client"
import type { User } from "@supabase/supabase-js"

export const createClient = createBrowserClient

export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient()
  const { data } = await supabase.auth.getUser()
  return data.user
}
