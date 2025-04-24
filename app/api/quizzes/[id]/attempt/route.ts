import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/app/api/db/init"
import { auth } from "@clerk/nextjs/server"

// Start a new quiz attempt
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const quizId = params.id
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if quiz exists and is published
    const quizResult = await query("SELECT * FROM quizzes WHERE id = $1 AND is_published = true", [quizId])

    if (quizResult.rows.length === 0) {
      return NextResponse.json({ error: "Quiz not found or not published" }, { status: 404 })
    }

    // Create a new attempt
    const attemptResult = await query(
      "INSERT INTO quiz_attempts (quiz_id, user_id, score, max_score, started_at) VALUES ($1, $2, 0, 0, NOW()) RETURNING *",
      [quizId, userId],
    )

    // Get questions for this quiz (without correct answers)
    const questionsResult = await query(
      `
      SELECT q.id, q.question_text, q.question_order, q.question_type, q.points, q.image_url
      FROM questions q
      WHERE q.quiz_id = $1
      ORDER BY q.question_order
    `,
      [quizId],
    )

    // Get answers for each question (without marking which is correct)
    const questions = await Promise.all(
      questionsResult.rows.map(async (question) => {
        const answersResult = await query(
          `
          SELECT id, answer_text
          FROM answers
          WHERE question_id = $1
          ORDER BY RANDOM()
        `,
          [question.id],
        )

        return {
          ...question,
          answers: answersResult.rows,
        }
      }),
    )

    // Calculate max possible score
    const maxScore = questions.reduce((total, q) => total + (q.points || 1), 0)

    // Update max score in attempt
    await query("UPDATE quiz_attempts SET max_score = $1 WHERE id = $2", [maxScore, attemptResult.rows[0].id])

    return NextResponse.json(
      {
        attempt_id: attemptResult.rows[0].id,
        quiz: quizResult.rows[0],
        questions,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error starting quiz attempt:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Submit quiz attempt
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const quizId = params.id
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { attempt_id, answers, time_taken } = await request.json()

    if (!attempt_id || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid submission data" }, { status: 400 })
    }

    // Verify this attempt belongs to the user
    const attemptResult = await query("SELECT * FROM quiz_attempts WHERE id = $1 AND user_id = $2 AND quiz_id = $3", [
      attempt_id,
      userId,
      quizId,
    ])

    if (attemptResult.rows.length === 0) {
      return NextResponse.json({ error: "Attempt not found or unauthorized" }, { status: 404 })
    }

    // Process each answer
    let totalScore = 0

    for (const answer of answers) {
      // Get the correct answer for this question
      const correctAnswerResult = await query(
        "SELECT a.id, q.points FROM answers a JOIN questions q ON a.question_id = q.id WHERE a.question_id = $1 AND a.is_correct = true",
        [answer.question_id],
      )

      if (correctAnswerResult.rows.length === 0) continue

      const isCorrect = correctAnswerResult.rows.some((row) => row.id === answer.answer_id)
      const points = isCorrect ? correctAnswerResult.rows[0].points || 1 : 0

      // Add to total score
      totalScore += points

      // Record user's answer
      await query("INSERT INTO user_answers (attempt_id, question_id, answer_id, is_correct) VALUES ($1, $2, $3, $4)", [
        attempt_id,
        answer.question_id,
        answer.answer_id,
        isCorrect,
      ])
    }

    // Update the attempt with final score
    await query("UPDATE quiz_attempts SET score = $1, time_taken = $2, completed_at = NOW() WHERE id = $3", [
      totalScore,
      time_taken,
      attempt_id,
    ])

    // Update user stats
    await query(
      `
      INSERT INTO user_stats (user_id, quizzes_taken, total_points, last_activity)
      VALUES ($1, 1, $2, NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        quizzes_taken = user_stats.quizzes_taken + 1,
        total_points = user_stats.total_points + $2,
        average_score = (user_stats.total_points + $2) / (user_stats.quizzes_taken + 1),
        last_activity = NOW()
    `,
      [userId, totalScore],
    )

    // Get correct answers for feedback
    const questionsWithAnswers = await Promise.all(
      answers.map(async (answer) => {
        const questionResult = await query("SELECT * FROM questions WHERE id = $1", [answer.question_id])

        const answersResult = await query("SELECT * FROM answers WHERE question_id = $1", [answer.question_id])

        const userAnswerResult = await query("SELECT * FROM user_answers WHERE attempt_id = $1 AND question_id = $2", [
          attempt_id,
          answer.question_id,
        ])

        return {
          question: questionResult.rows[0],
          answers: answersResult.rows,
          user_answer: userAnswerResult.rows[0],
        }
      }),
    )

    return NextResponse.json(
      {
        score: totalScore,
        max_score: attemptResult.rows[0].max_score,
        percentage: Math.round((totalScore / attemptResult.rows[0].max_score) * 100),
        questions: questionsWithAnswers,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error submitting quiz attempt:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Get attempt history for a quiz
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const quizId = params.id
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all attempts for this quiz by this user
    const attemptsResult = await query(
      `
      SELECT qa.*, q.title as quiz_title
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.quiz_id = $1 AND qa.user_id = $2
      ORDER BY qa.completed_at DESC
    `,
      [quizId, userId],
    )

    return NextResponse.json(attemptsResult.rows, { status: 200 })
  } catch (error) {
    console.error("Error fetching quiz attempts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
