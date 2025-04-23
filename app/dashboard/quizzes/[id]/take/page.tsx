import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/app/api/db/init"
import QuizTaker from "@/components/quiz/quiz-taker"

export default async function TakeQuizPage({ params }: { params: { id: string } }) {
  const session = await getSession()

  if (!session) {
    redirect("/auth")
  }

  const quizId = params.id

  // Check if quiz exists and is published
  const quizResult = await query("SELECT * FROM quizzes WHERE id = $1 AND is_published = true", [quizId])

  if (quizResult.rows.length === 0) {
    redirect("/dashboard/discover")
  }

  // Get quiz creator info
  const creatorResult = await query("SELECT id, username, avatar_url FROM users WHERE id = $1", [
    quizResult.rows[0].creator_id,
  ])

  // Get previous attempts by this user
  const attemptsResult = await query(
    "SELECT * FROM quiz_attempts WHERE quiz_id = $1 AND user_id = $2 ORDER BY completed_at DESC",
    [quizId, session.id],
  )

  return (
    <QuizTaker
      quiz={quizResult.rows[0]}
      creator={creatorResult.rows[0]}
      previousAttempts={attemptsResult.rows}
      currentUser={session}
    />
  )
}
