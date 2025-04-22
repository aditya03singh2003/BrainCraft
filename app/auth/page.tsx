import AuthForm from "@/components/auth/auth-form"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AuthPage() {
  const session = await getSession()

  // If user is already logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  return <AuthForm />
}
