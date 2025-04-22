import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/app/api/db/init"
import AnalyticsView from "@/components/analytics/analytics-view"

export default async function AnalyticsPage() {
  const session = await getSession()

  if (!session) {
    redirect("/auth")
  }

  // Get user stats
  const userStatsResult = await query(`SELECT * FROM user_stats WHERE user_id = $1`, [session.id])

  const userStats = userStatsResult.rows[0] || {
    quizzes_created: 0,
    quizzes_taken: 0,
    total_points: 0,
    average_score: 0,
  }

  // Get quiz creation stats
  const quizCreationResult = await query(
    `SELECT 
      COUNT(*) as total_quizzes,
      SUM(CASE WHEN is_published = true THEN 1 ELSE 0 END) as published_quizzes,
      MAX(created_at) as latest_quiz_date
    FROM quizzes
    WHERE creator_id = $1`,
    [session.id],
  )

  // Get quiz attempt stats
  const quizAttemptResult = await query(
    `SELECT 
      COUNT(*) as total_attempts,
      AVG(score * 100.0 / max_score) as average_percentage,
      MAX(completed_at) as latest_attempt_date
    FROM quiz_attempts
    WHERE user_id = $1`,
    [session.id],
  )

  // Get most popular quizzes created by user
  const popularQuizzesResult = await query(
    `SELECT 
      q.id, q.title, q.description, q.created_at, q.is_published,
      COUNT(qa.id) as attempt_count,
      AVG(qa.score * 100.0 / qa.max_score) as average_score
    FROM quizzes q
    LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
    WHERE q.creator_id = $1
    GROUP BY q.id
    ORDER BY attempt_count DESC
    LIMIT 5`,
    [session.id],
  )

  // Get recent activity
  const recentActivityResult = await query(
    `SELECT 
      'quiz_created' as activity_type,
      q.id as item_id,
      q.title as item_name,
      q.created_at as activity_date
    FROM quizzes q
    WHERE q.creator_id = $1
    
    UNION ALL
    
    SELECT 
      'quiz_attempt' as activity_type,
      qa.quiz_id as item_id,
      q.title as item_name,
      qa.completed_at as activity_date
    FROM quiz_attempts qa
    JOIN quizzes q ON qa.quiz_id = q.id
    WHERE qa.user_id = $1
    
    ORDER BY activity_date DESC
    LIMIT 10`,
    [session.id],
  )

  // Get performance by category
  const categoryPerformanceResult = await query(
    `SELECT 
      q.category,
      COUNT(qa.id) as attempt_count,
      AVG(qa.score * 100.0 / qa.max_score) as average_score
    FROM quiz_attempts qa
    JOIN quizzes q ON qa.quiz_id = q.id
    WHERE qa.user_id = $1 AND q.category IS NOT NULL
    GROUP BY q.category
    ORDER BY average_score DESC`,
    [session.id],
  )

  // Get all quiz attempts
  const attemptsResult = await query(
    `SELECT 
      qa.*, 
      q.title as quiz_title, 
      q.category as quiz_category,
      q.difficulty as quiz_difficulty
    FROM quiz_attempts qa
    JOIN quizzes q ON qa.quiz_id = q.id
    WHERE qa.user_id = $1
    ORDER BY qa.completed_at DESC`,
    [session.id],
  )

  return (
    <AnalyticsView
      userStats={userStats}
      quizCreation={quizCreationResult.rows[0]}
      quizAttempts={quizAttemptResult.rows[0]}
      popularQuizzes={popularQuizzesResult.rows}
      recentActivity={recentActivityResult.rows}
      categoryPerformance={categoryPerformanceResult.rows}
      attempts={attemptsResult.rows}
    />
  )
}
