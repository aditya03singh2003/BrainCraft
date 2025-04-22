import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export interface UserSession {
  id: number
  username: string
  email: string
  role: string
}

// Get JWT secret from environment or use a default (in production, always use environment variable)
const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET || "braincraft_secure_jwt_secret_key_change_in_production"
  return new TextEncoder().encode(secret)
}

// Create a JWT token
export async function createToken(payload: any) {
  const secret = getJWTSecret()

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Token expires in 7 days
    .sign(secret)
}

// Get the current user session
export async function getSession(): Promise<UserSession | null> {
  const cookieStore = cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    return null
  }

  try {
    const secret = getJWTSecret()
    const { payload } = await jwtVerify(token, secret)

    return {
      id: payload.id as number,
      username: payload.username as string,
      email: payload.email as string,
      role: payload.role as string,
    }
  } catch (error) {
    console.error("Session verification error:", error)
    return null
  }
}

// Middleware to require authentication
export async function requireAuth(request: NextRequest) {
  const cookieStore = cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/auth", request.url))
  }

  try {
    const secret = getJWTSecret()
    await jwtVerify(token, secret)
    return null // Auth successful, continue
  } catch (error) {
    console.error("Auth middleware error:", error)
    return NextResponse.redirect(new URL("/auth", request.url))
  }
}
