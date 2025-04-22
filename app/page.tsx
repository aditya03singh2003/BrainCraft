import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import HomeContent from "@/components/home/home-content"

export default async function HomePage() {
  const session = await getSession()

  // If user is already logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  return <HomeContent />
}
