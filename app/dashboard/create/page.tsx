import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import QuizCreator from "@/components/quiz/quiz-creator"

export default async function CreateQuizPage() {
  const session = await getSession()

  if (!session) {
    redirect("/auth")
  }

  return <QuizCreator />
}
