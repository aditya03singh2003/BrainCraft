import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/app/api/db/init"
import { auth } from "@clerk/nextjs/server"

// Update a question
export async function PUT(request: NextRequest, { params }: { params: { id: string; questionId: string } }) {
  try {
    const { id: quizId, questionId } = params
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if quiz exists and belongs to the user
    const checkResult = await query(
      "SELECT q.* FROM questions q JOIN quizzes qz ON q.quiz_id = qz.id WHERE q.id = $1 AND qz.creator_id = $2",
      [questionId, userId],
    )

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: "Question not found or unauthorized" }, { status: 404 })
    }

    const { question_text, answers, question_type, points, image_url } = await request.json()

    if (!question_text || !answers || !Array.isArray(answers) || answers.length < 2) {
      return NextResponse.json(
        {
          error: "Question text and at least two answers are required",
        },
        { status: 400 },
      )
    }

    // Check if at least one answer is marked as correct
    const hasCorrectAnswer = answers.some((answer) => answer.is_correct)

    if (!hasCorrectAnswer) {
      return NextResponse.json(
        {
          error: "At least one answer must be marked as correct",
        },
        { status: 400 },
      )
    }

    // Update question
    const questionResult = await query(
      "UPDATE questions SET question_text = $1, question_type = $2, points = $3, image_url = $4 WHERE id = $5 RETURNING *",
      [question_text, question_type || "multiple_choice", points || 1, image_url, questionId],
    )

    // Delete existing answers
    await query("DELETE FROM answers WHERE question_id = $1", [questionId])

    // Insert new answers
    const answerPromises = answers.map((answer) => {
      return query(
        "INSERT INTO answers (question_id, answer_text, is_correct, explanation) VALUES ($1, $2, $3, $4) RETURNING *",
        [questionId, answer.answer_text, answer.is_correct, answer.explanation || null],
      )
    })

    const answerResults = await Promise.all(answerPromises)
    const insertedAnswers = answerResults.map((result) => result.rows[0])

    return NextResponse.json(
      {
        ...questionResult.rows[0],
        answers: insertedAnswers,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error updating question:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete a question
export async function DELETE(request: NextRequest, { params }: { params: { id: string; questionId: string } }) {
  try {
    const { id: quizId, questionId } = params
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if quiz exists and belongs to the user
    const checkResult = await query(
      "SELECT q.* FROM questions q JOIN quizzes qz ON q.quiz_id = qz.id WHERE q.id = $1 AND qz.creator_id = $2",
      [questionId, userId],
    )

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: "Question not found or unauthorized" }, { status: 404 })
    }

    // Delete question (cascade will delete answers)
    await query("DELETE FROM questions WHERE id = $1", [questionId])

    // Reorder remaining questions
    await query(
      `
      WITH ranked AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY question_order) as new_order
        FROM questions
        WHERE quiz_id = $1
      )
      UPDATE questions q
      SET question_order = r.new_order
      FROM ranked r
      WHERE q.id = r.id
    `,
      [quizId],
    )

    return NextResponse.json({ message: "Question deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting question:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
