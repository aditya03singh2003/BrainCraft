import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/app/api/db/init"
import LeaderboardView from "@/components/leaderboard/leaderboard-view"

export default async function LeaderboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/auth")
  }

  // Get global leaderboard (top users by points)
  const globalLeaderboardResult = await query(`
    SELECT 
      u.id, 
      u.username, 
      u.avatar_url,
      us.total_points,
      us.quizzes_taken,
      us.average_score,
      COUNT(DISTINCT q.id) as quizzes_created
    FROM users u
    LEFT JOIN user_stats us ON u.id = us.user_id
    LEFT JOIN quizzes q ON u.id = q.creator_id
    GROUP BY u.id, u.username, u.avatar_url, us.total_points, us.quizzes_taken, us.average_score
    ORDER BY us.total_points DESC NULLS LAST
    LIMIT 50
  `)

  // Get quiz-specific leaderboards (top performers for each quiz)
  const quizLeaderboardsResult = await query(`
    SELECT 
      q.id as quiz_id,
      q.title as quiz_title,
      q.category,
      q.difficulty,
      u.id as user_id,
      u.username,
      u.avatar_url,
      qa.score,
      qa.max_score,
      (qa.score * 100.0 / qa.max_score) as percentage,
      qa.time_taken,
      qa.completed_at
    FROM quizzes q
    JOIN quiz_attempts qa ON q.id = qa.quiz_id
    JOIN users u ON qa.user_id = u.id
    WHERE q.is_published = true
    ORDER BY q.id, percentage DESC, qa.time_taken ASC
  `)

  // Process quiz leaderboards to group by quiz
  const quizLeaderboards = quizLeaderboardsResult.rows.reduce((acc, row) => {
    if (!acc[row.quiz_id]) {
      acc[row.quiz_id] = {
        quiz_id: row.quiz_id,
        quiz_title: row.quiz_title,
        category: row.category,
        difficulty: row.difficulty,
        attempts: [],
      }
    }

    // Only add this attempt if we don't already have one from this user
    // (to keep only the best attempt per user)
    const existingUserAttempt = acc[row.quiz_id].attempts.find((a) => a.user_id === row.user_id)
    if (!existingUserAttempt) {
      acc[row.quiz_id].attempts.push({
        user_id: row.user_id,
        username: row.username,
        avatar_url: row.avatar_url,
        score: row.score,
        max_score: row.max_score,
        percentage: row.percentage,
        time_taken: row.time_taken,
        completed_at: row.completed_at,
      })
    }

    return acc
  }, {})

  // Get user's rank
  const userRankResult = await query(
    `
    WITH user_ranks AS (
      SELECT 
        user_id, 
        RANK() OVER (ORDER BY total_points DESC NULLS LAST) as rank
      FROM user_stats
    )
    SELECT rank FROM user_ranks WHERE user_id = $1
  `,
    [session.id],
  )

  const userRank = userRankResult.rows.length > 0 ? userRankResult.rows[0].rank : null

  return (
    <LeaderboardView
      globalLeaderboard={globalLeaderboardResult.rows}
      quizLeaderboards={Object.values(quizLeaderboards)}
      userRank={userRank}
      currentUser={session}
    />
  )
}
