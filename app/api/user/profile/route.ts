import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/app/api/db/init"
import { getSession } from "@/lib/auth"
import bcrypt from "bcryptjs"

// Get user profile
export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user data (excluding password)
    const userResult = await query(
      "SELECT id, username, email, role, avatar_url, created_at FROM users WHERE id = $1",
      [session.id],
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get user stats
    const statsResult = await query("SELECT * FROM user_stats WHERE user_id = $1", [session.id])

    const stats = statsResult.rows[0] || {
      quizzes_created: 0,
      quizzes_taken: 0,
      total_points: 0,
      average_score: 0,
    }

    return NextResponse.json(
      {
        ...userResult.rows[0],
        stats,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { username, email, current_password, new_password, avatar_url } = await request.json()

    // Verify current user exists
    const userResult = await query("SELECT * FROM users WHERE id = $1", [session.id])

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userResult.rows[0]

    // If changing password, verify current password
    if (new_password) {
      if (!current_password) {
        return NextResponse.json({ error: "Current password is required" }, { status: 400 })
      }

      const isPasswordValid = await bcrypt.compare(current_password, user.password_hash)
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 })
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(new_password, salt)

      // Update user with new password
      await query("UPDATE users SET password_hash = $1 WHERE id = $2", [hashedPassword, session.id])
    }

    // Update other profile fields if provided
    if (username || email || avatar_url) {
      // Check if email is already taken
      if (email && email !== user.email) {
        const emailCheckResult = await query("SELECT * FROM users WHERE email = $1 AND id != $2", [email, session.id])

        if (emailCheckResult.rows.length > 0) {
          return NextResponse.json({ error: "Email is already in use" }, { status: 409 })
        }
      }

      // Check if username is already taken
      if (username && username !== user.username) {
        const usernameCheckResult = await query("SELECT * FROM users WHERE username = $1 AND id != $2", [
          username,
          session.id,
        ])

        if (usernameCheckResult.rows.length > 0) {
          return NextResponse.json({ error: "Username is already in use" }, { status: 409 })
        }
      }

      // Update profile
      await query(
        "UPDATE users SET username = COALESCE($1, username), email = COALESCE($2, email), avatar_url = COALESCE($3, avatar_url) WHERE id = $4",
        [username || null, email || null, avatar_url || null, session.id],
      )
    }

    // Get updated user data
    const updatedUserResult = await query(
      "SELECT id, username, email, role, avatar_url, created_at FROM users WHERE id = $1",
      [session.id],
    )

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: updatedUserResult.rows[0],
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
