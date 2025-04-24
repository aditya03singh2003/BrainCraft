import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/app/api/db/init"
import { auth } from "@clerk/nextjs/server"

// Add a question to a quiz
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const quizId = params.id
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if quiz exists and belongs to the user
    const checkResult = await query("SELECT * FROM quizzes WHERE id = $1 AND creator_id = $2", [quizId, userId])

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: "Quiz not found or unauthorized" }, { status: 404 })
    }

    const { question_text, answers } = await request.json()

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

    // Get the next question order
    const orderResult = await query(
      "SELECT COALESCE(MAX(question_order), 0) + 1 as next_order FROM questions WHERE quiz_id = $1",
      [quizId],
    )

    const questionOrder = orderResult.rows[0].next_order

    // Insert question
    const questionResult = await query(
      "INSERT INTO questions (quiz_id, question_text, question_order) VALUES ($1, $2, $3) RETURNING *",
      [quizId, question_text, questionOrder],
    )

    const questionId = questionResult.rows[0].id

    // Insert answers
    const answerPromises = answers.map((answer) => {
      return query("INSERT INTO answers (question_id, answer_text, is_correct) VALUES ($1, $2, $3) RETURNING *", [
        questionId,
        answer.answer_text,
        answer.is_correct,
      ])
    })

    const answerResults = await Promise.all(answerPromises)
    const insertedAnswers = answerResults.map((result) => result.rows[0])

    return NextResponse.json(
      {
        ...questionResult.rows[0],
        answers: insertedAnswers,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error adding question:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Get all questions for a quiz
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const quizId = params.id
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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

    return NextResponse.json(questions, { status: 200 })
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
