import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtected =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/pro-calculator") ||
    request.nextUrl.pathname.startsWith("/billing")

  if (isProtected && !user) {
    console.log("[MIDDLEWARE]", request.nextUrl.pathname, "- User: Not found")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  console.log("[MIDDLEWARE]", request.nextUrl.pathname, "- User:", user?.id ?? "Not found")
  return supabaseResponse
}

export const config = {
  matcher: ["/dashboard/:path*", "/pro-calculator/:path*", "/billing/:path*"],
}
