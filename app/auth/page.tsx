import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"

export default function AuthPage() {
  const { userId } = auth()

  // If user is already logged in, redirect to dashboard
  if (userId) {
    redirect("/dashboard")
  }

  // Clerk will handle the auth UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div className="w-full max-w-md">{/* Clerk will inject the auth UI here */}</div>
    </div>
  )
}
