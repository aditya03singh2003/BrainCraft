import { NextResponse } from "next/server"
import pool from "@/lib/db"

// This route will be used to handle Clerk webhook events
// For now, we'll just set up a basic structure
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Handle user creation event
    if (body.type === "user.created") {
      const { id, email_addresses, username } = body.data

      // Insert the new user into our database
      await pool.query("INSERT INTO users (id, email, username, created_at) VALUES ($1, $2, $3, NOW())", [
        id,
        email_addresses[0]?.email_address,
        username || email_addresses[0]?.email_address.split("@")[0],
      ])

      return NextResponse.json({ success: true })
    }

    // Handle other events as needed

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error handling Clerk webhook:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
