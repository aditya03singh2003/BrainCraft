import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/app/api/db/init"
import { auth } from "@clerk/nextjs/server"

// Create a new quiz
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, category, difficulty, time_limit, is_published } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const result = await query(
      "INSERT INTO quizzes (title, description, creator_id, category, difficulty, time_limit, is_published) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [title, description, userId, category, difficulty, time_limit, is_published],
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("Error creating quiz:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Get all quizzes for the current user
export async function GET() {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await query("SELECT * FROM quizzes WHERE creator_id = $1 ORDER BY created_at DESC", [userId])

    return NextResponse.json(result.rows, { status: 200 })
  } catch (error) {
    console.error("Error fetching quizzes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
