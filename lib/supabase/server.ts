import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export function createClient() {
  return createServerComponentClient({ cookies })
}

export function createSupabaseServerClient() {
  return createServerComponentClient({ cookies })
}

export function createSupabaseServiceClient() {
  return createRouteHandlerClient({ cookies })
}
