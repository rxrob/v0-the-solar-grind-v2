import { createClient } from "@/lib/supabase/server"
import { getURL } from "@/lib/utils"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(getURL(next))
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(getURL("/auth/auth-code-error"))
}
