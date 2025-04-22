import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/app/api/db/init"
import { getSession } from "@/lib/auth"

// Get a specific quiz
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const quizId = params.id
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get quiz details
    const quizResult = await query("SELECT * FROM quizzes WHERE id = $1", [quizId])

    if (quizResult.rows.length === 0) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    const quiz = quizResult.rows[0]

    // Get questions for this quiz
    const questionsResult = await query("SELECT * FROM questions WHERE quiz_id = $1 ORDER BY question_order", [quizId])

    const questions = await Promise.all(
      questionsResult.rows.map(async (question) => {
        // Get answers for this question
        const answersResult = await query("SELECT * FROM answers WHERE question_id = $1", [question.id])

        return {
          ...question,
          answers: answersResult.rows,
        }
      }),
    )

    return NextResponse.json(
      {
        ...quiz,
        questions,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching quiz:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Update a quiz
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const quizId = params.id
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, is_published } = await request.json()

    // Check if quiz exists and belongs to the user
    const checkResult = await query("SELECT * FROM quizzes WHERE id = $1 AND creator_id = $2", [quizId, session.id])

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: "Quiz not found or unauthorized" }, { status: 404 })
    }

    // Update quiz
    const result = await query(
      "UPDATE quizzes SET title = $1, description = $2, is_published = $3 WHERE id = $4 RETURNING *",
      [title, description, is_published, quizId],
    )

    return NextResponse.json(result.rows[0], { status: 200 })
  } catch (error) {
    console.error("Error updating quiz:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete a quiz
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const quizId = params.id
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if quiz exists and belongs to the user
    const checkResult = await query("SELECT * FROM quizzes WHERE id = $1 AND creator_id = $2", [quizId, session.id])

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: "Quiz not found or unauthorized" }, { status: 404 })
    }

    // Delete quiz (cascade will delete questions and answers)
    await query("DELETE FROM quizzes WHERE id = $1", [quizId])

    return NextResponse.json({ message: "Quiz deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting quiz:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
