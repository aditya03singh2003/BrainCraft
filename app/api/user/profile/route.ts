import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/app/api/db/init"
import { clerkClient } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"

// Get user profile
export async function GET() {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user data from our database
    const userResult = await query(
      "SELECT id, username, email, role, avatar_url, created_at FROM users WHERE id = $1",
      [userId],
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get user stats
    const statsResult = await query("SELECT * FROM user_stats WHERE user_id = $1", [userId])

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
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { username, email, avatar_url } = await request.json()

    // Verify current user exists
    const userResult = await query("SELECT * FROM users WHERE id = $1", [userId])

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userResult.rows[0]

    // Update profile fields if provided
    if (username || email || avatar_url) {
      // Check if email is already taken
      if (email && email !== user.email) {
        const emailCheckResult = await query("SELECT * FROM users WHERE email = $1 AND id != $2", [email, userId])

        if (emailCheckResult.rows.length > 0) {
          return NextResponse.json({ error: "Email is already in use" }, { status: 409 })
        }

        // Update email in Clerk
        try {
          await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
              email: email,
            },
          })
        } catch (error) {
          console.error("Error updating Clerk user email:", error)
        }
      }

      // Check if username is already taken
      if (username && username !== user.username) {
        const usernameCheckResult = await query("SELECT * FROM users WHERE username = $1 AND id != $2", [
          username,
          userId,
        ])

        if (usernameCheckResult.rows.length > 0) {
          return NextResponse.json({ error: "Username is already in use" }, { status: 409 })
        }

        // Update username in Clerk
        try {
          await clerkClient.users.updateUser(userId, {
            username: username,
          })
        } catch (error) {
          console.error("Error updating Clerk username:", error)
        }
      }

      // Update profile in our database
      await query(
        "UPDATE users SET username = COALESCE($1, username), email = COALESCE($2, email), avatar_url = COALESCE($3, avatar_url) WHERE id = $4",
        [username || null, email || null, avatar_url || null, userId],
      )
    }

    // Get updated user data
    const updatedUserResult = await query(
      "SELECT id, username, email, role, avatar_url, created_at FROM users WHERE id = $1",
      [userId],
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
