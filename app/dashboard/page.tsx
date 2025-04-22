import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/app/api/db/init"
import DashboardView from "@/components/dashboard/dashboard-view"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/auth")
  }

  // Get recent quizzes created by user
  const recentQuizzesResult = await query(
    "SELECT * FROM quizzes WHERE creator_id = $1 ORDER BY created_at DESC LIMIT 5",
    [session.id],
  )

  // Get recent quiz attempts by user
  const recentAttemptsResult = await query(
    `
    SELECT qa.*, q.title as quiz_title, q.description as quiz_description
    FROM quiz_attempts qa
    JOIN quizzes q ON qa.quiz_id = q.id
    WHERE qa.user_id = $1
    ORDER BY qa.completed_at DESC
    LIMIT 5
  `,
    [session.id],
  )

  // Get user stats
  const statsResult = await query(
    `
    SELECT 
      COALESCE(us.quizzes_created, 0) as quizzes_created,
      COALESCE(us.quizzes_taken, 0) as quizzes_taken,
      COALESCE(us.total_points, 0) as total_points,
      COALESCE(us.average_score, 0) as average_score,
      (SELECT COUNT(*) FROM quizzes WHERE creator_id = $1) as total_quizzes,
      (SELECT COUNT(*) FROM quiz_attempts WHERE user_id = $1) as total_attempts
    FROM user_stats us
    WHERE us.user_id = $1
  `,
    [session.id],
  )

  const stats = statsResult.rows[0] || {
    quizzes_created: 0,
    quizzes_taken: 0,
    total_points: 0,
    average_score: 0,
    total_quizzes: 0,
    total_attempts: 0,
  }

  // Get popular quizzes (not created by user)
  const popularQuizzesResult = await query(
    `
    SELECT q.*, u.username as creator_name, COUNT(qa.id) as attempt_count
    FROM quizzes q
    JOIN users u ON q.creator_id = u.id
    LEFT JOIN quiz_attempts qa ON q.quiz_id = qa.id
    WHERE q.is_published = true AND q.creator_id != $1
    GROUP BY q.id, u.username
    ORDER BY attempt_count DESC
    LIMIT 5
  `,
    [session.id],
  )

  return (
    <DashboardView
      user={session}
      recentQuizzes={recentQuizzesResult.rows}
      recentAttempts={recentAttemptsResult.rows}
      stats={stats}
      popularQuizzes={popularQuizzesResult.rows}
    />
  )
}
