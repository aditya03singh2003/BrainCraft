import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/app/api/db/init"
import ProfileView from "@/components/profile/profile-view"

export default async function ProfilePage() {
  const session = await getSession()

  if (!session) {
    redirect("/auth")
  }

  // Get user data (excluding password)
  const userResult = await query("SELECT id, username, email, role, avatar_url, created_at FROM users WHERE id = $1", [
    session.id,
  ])

  if (userResult.rows.length === 0) {
    redirect("/auth")
  }

  // Get user stats
  const statsResult = await query("SELECT * FROM user_stats WHERE user_id = $1", [session.id])

  const stats = statsResult.rows[0] || {
    quizzes_created: 0,
    quizzes_taken: 0,
    total_points: 0,
    average_score: 0,
  }

  return <ProfileView user={userResult.rows[0]} stats={stats} />
}
