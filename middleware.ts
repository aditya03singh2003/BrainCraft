import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

// Paths that require authentication
const protectedPaths = [
  "/dashboard",
  "/dashboard/create",
  "/dashboard/quizzes",
  "/dashboard/analytics",
  "/dashboard/profile",
]

// Paths that should redirect to dashboard if already authenticated
const authPaths = ["/auth"]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Get token from cookie
  const token = request.cookies.get("auth_token")?.value

  // Check if path requires authentication
  const isProtectedPath = protectedPaths.some((pp) => path.startsWith(pp))
  const isAuthPath = authPaths.some((ap) => path.startsWith(ap))

  // If no token and trying to access protected path
  if (!token && isProtectedPath) {
    const url = new URL("/auth", request.url)
    url.searchParams.set("from", path)
    return NextResponse.redirect(url)
  }

  // If has token and trying to access auth path
  if (token && isAuthPath) {
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || "braincraft_secure_jwt_secret_key_change_in_production",
      )
      await jwtVerify(token, secret)
      return NextResponse.redirect(new URL("/dashboard", request.url))
    } catch (error) {
      // Invalid token, continue to auth page
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth"],
}
