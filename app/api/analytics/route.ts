import { NextResponse } from "next/server"
import { query } from "@/app/api/db/init"
import { auth } from "@clerk/nextjs/server"

export async function GET() {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user stats
    const userStatsResult = await query(`SELECT * FROM user_stats WHERE user_id = $1`, [userId])

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
      [userId],
    )

    // Get quiz attempt stats
    const quizAttemptResult = await query(
      `SELECT 
        COUNT(*) as total_attempts,
        AVG(score * 100.0 / max_score) as average_percentage,
        MAX(completed_at) as latest_attempt_date
      FROM quiz_attempts
      WHERE user_id = $1`,
      [userId],
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
      [userId],
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
      [userId],
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
      [userId],
    )

    return NextResponse.json(
      {
        user_stats: userStats,
        quiz_creation: quizCreationResult.rows[0],
        quiz_attempts: quizAttemptResult.rows[0],
        popular_quizzes: popularQuizzesResult.rows,
        recent_activity: recentActivityResult.rows,
        category_performance: categoryPerformanceResult.rows,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
