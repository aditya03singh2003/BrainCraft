import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { query } from "@/app/api/db/init"

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json()

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json({ error: "Username, email, and password are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await query("SELECT * FROM users WHERE email = $1", [email])
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const result = await query(
      "INSERT INTO users (username, email, password_hash, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, username, email, role",
      [username, email, hashedPassword, "user"],
    )

    // Create initial user stats
    await query(
      "INSERT INTO user_stats (user_id, quizzes_created, quizzes_taken, total_points, average_score) VALUES ($1, 0, 0, 0, 0)",
      [result.rows[0].id],
    )

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: result.rows[0],
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
