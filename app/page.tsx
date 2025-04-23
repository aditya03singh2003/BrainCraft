import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import HomeContent from "@/components/home/home-content"

export default function HomePage() {
  const { userId } = auth()

  // If user is already logged in, redirect to dashboard
  if (userId) {
    redirect("/dashboard")
  }

  return <HomeContent />
}
