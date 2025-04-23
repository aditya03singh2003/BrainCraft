import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/app/api/db/init"
import DiscoverView from "@/components/discover/discover-view"

export default async function DiscoverPage() {
  const session = await getSession()

  if (!session) {
    redirect("/auth")
  }

  // Get popular quizzes (not created by user)
  const popularQuizzesResult = await query(
    `
    SELECT 
      q.*, 
      u.username as creator_name, 
      u.avatar_url as creator_avatar,
      COUNT(qa.id) as attempt_count,
      AVG(qa.score * 100.0 / qa.max_score) as average_score
    FROM quizzes q
    JOIN users u ON q.creator_id = u
    LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
    WHERE q.is_published = true AND q.creator_id != $1
    GROUP BY q.id, u.username, u.avatar_url
    ORDER BY attempt_count DESC
    LIMIT 20
  `,
    [session.id],
  )

  // Get quizzes by category
  const categoriesResult = await query(`
    SELECT 
      q.category,
      COUNT(*) as quiz_count
    FROM quizzes q
    WHERE q.is_published = true AND q.category IS NOT NULL
    GROUP BY q.category
    ORDER BY quiz_count DESC
  `)

  // Get quizzes for each category
  const quizzesByCategory = await Promise.all(
    categoriesResult.rows.map(async (category) => {
      const quizzesResult = await query(
        `
        SELECT 
          q.*, 
          u.username as creator_name, 
          u.avatar_url as creator_avatar,
          COUNT(qa.id) as attempt_count,
          AVG(qa.score * 100.0 / qa.max_score) as average_score
        FROM quizzes q
        JOIN users u ON q.creator_id = u
        LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
        WHERE q.is_published = true AND q.category = $1
        GROUP BY q.id, u.username, u.avatar_url
        ORDER BY attempt_count DESC
        LIMIT 6
      `,
        [category.category],
      )

      return {
        category: category.category,
        quizzes: quizzesResult.rows,
      }
    }),
  )

  // Get recently added quizzes
  const recentQuizzesResult = await query(
    `
    SELECT 
      q.*, 
      u.username as creator_name, 
      u.avatar_url as creator_avatar
    FROM quizzes q
    JOIN users u ON q.creator_id = u
    WHERE q.is_published = true AND q.creator_id != $1
    ORDER BY q.created_at DESC
    LIMIT 10
  `,
    [session.id],
  )

  return (
    <DiscoverView
      popularQuizzes={popularQuizzesResult.rows}
      quizzesByCategory={quizzesByCategory}
      recentQuizzes={recentQuizzesResult.rows}
    />
  )
}
