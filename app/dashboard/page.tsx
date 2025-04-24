import { redirect } from "next/navigation"
import { auth, currentUser } from "@clerk/nextjs/server"
import { query } from "@/app/api/db/init"
import DashboardView from "@/components/dashboard/dashboard-view"

export default async function DashboardPage() {
  const { userId } = auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  // Check if user exists in our database, if not create them
  const userCheck = await query("SELECT * FROM users WHERE id = $1", [userId])

  if (userCheck.rows.length === 0) {
    // Create user in our database
    await query("INSERT INTO users (id, username, email, avatar_url, created_at) VALUES ($1, $2, $3, $4, NOW())", [
      userId,
      user.username || `${user.firstName || ""}${user.lastName || ""}`,
      user.emailAddresses[0]?.emailAddress,
      user.imageUrl,
    ])

    // Create initial user stats
    await query(
      "INSERT INTO user_stats (user_id, quizzes_created, quizzes_taken, total_points, average_score) VALUES ($1, 0, 0, 0, 0)",
      [userId],
    )
  }

  // Get recent quizzes created by user
  const recentQuizzesResult = await query(
    "SELECT * FROM quizzes WHERE creator_id = $1 ORDER BY created_at DESC LIMIT 5",
    [userId],
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
    [userId],
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
    [userId],
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
    LEFT JOIN quiz_attempts qa ON q.id = qa.id
    WHERE q.is_published = true AND q.creator_id != $1
    GROUP BY q.id, u.username
    ORDER BY attempt_count DESC
    LIMIT 5
  `,
    [userId],
  )

  // Create a session object compatible with our components
  const session = {
    id: userId,
    username: user.username || user.firstName || "User",
    email: user.emailAddresses[0]?.emailAddress || "",
    role: "user",
  }

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
