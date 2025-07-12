import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { CookieOptions } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: "", ...options })
        },
      },
    },
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard")

  if (isProtectedRoute && !session) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/login"
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

// Ensure the middleware is only called for relevant paths.
export const config = {
  matcher: [
    "/dashboard/:path*",
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/callback (Supabase auth callback)
     */
    "/((?!_next/static|_next/image|favicon.ico|auth/callback).*)",
  ],
}
