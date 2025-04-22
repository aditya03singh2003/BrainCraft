import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/app/api/db/init"
import QuizzesList from "@/components/quiz/quizzes-list"

export default async function QuizzesPage() {
  const session = await getSession()

  if (!session) {
    redirect("/auth")
  }

  // Get all quizzes created by user
  const quizzesResult = await query("SELECT * FROM quizzes WHERE creator_id = $1 ORDER BY created_at DESC", [
    session.id,
  ])

  return <QuizzesList quizzes={quizzesResult.rows} />
}
