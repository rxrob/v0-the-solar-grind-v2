import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // This `response` object is used to set cookies on the client.
  const response = NextResponse.next({
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
        set(name: string, value: string, options) {
          // If the cookie is set, update the request and response cookies.
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options) {
          // If the cookie is removed, update the request and response cookies.
          request.cookies.delete(name)
          response.cookies.delete(name)
        },
      },
    },
  )

  // Refresh the session if it's expired.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define protected routes that require authentication.
  const protectedRoutes = ["/dashboard", "/pro-calculator", "/reports", "/billing"]
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // If the user is not authenticated and is trying to access a protected route,
  // redirect them to the login page.
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If the user is authenticated and tries to access login or signup,
  // redirect them to the dashboard.
  if (user && (request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/signup"))) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Return the response, which may have updated cookies.
  return response
}

// Configure the middleware to run on specific paths.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes)
     * - .*\\.(?:svg|png|jpg|jpeg|gif|webp)$ (image files)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
