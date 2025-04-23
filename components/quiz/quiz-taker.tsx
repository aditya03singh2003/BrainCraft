"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  Trophy,
  XCircle,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import type { UserSession } from "@/lib/auth"

interface QuizTakerProps {
  quiz: any
  creator: any
  previousAttempts: any[]
  currentUser: UserSession
}

export default function QuizTaker({ quiz, creator, previousAttempts, currentUser }: QuizTakerProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [quizState, setQuizState] = useState<"intro" | "taking" | "results">("intro")

  const [quizData, setQuizData] = useState<any>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<any[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)

  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [timeTaken, setTimeTaken] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)

  // Start the quiz
  const startQuiz = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/quizzes/${quiz.id}/attempt`, {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to start quiz")
      }

      const data = await response.json()
      setQuizData(data)
      setAnswers(new Array(data.questions.length).fill(null))
      setQuizState("taking")

      // Set timer if quiz has time limit
      if (quiz.time_limit) {
        setTimeLeft(quiz.time_limit * 60)
      }

      setStartTime(new Date())
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle answer selection
  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId)
  }

  // Move to next question
  const nextQuestion = () => {
    if (selectedAnswer) {
      // Save answer
      const newAnswers = [...answers]
      newAnswers[currentQuestion] = {
        question_id: quizData.questions[currentQuestion].id,
        answer_id: selectedAnswer,
      }
      setAnswers(newAnswers)

      // Move to next question or submit if last
      if (currentQuestion < quizData.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
      } else {
        submitQuiz(newAnswers)
      }
    }
  }

  // Move to previous question
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelectedAnswer(answers[currentQuestion - 1]?.answer_id || null)
    }
  }

  // Submit the quiz
  const submitQuiz = async (finalAnswers: any[]) => {
    setIsLoading(true)
    setError("")

    try {
      // Calculate time taken
      const endTime = new Date()
      const totalTimeTaken = startTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 0

      const response = await fetch(`/api/quizzes/${quiz.id}/attempt`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attempt_id: quizData.attempt_id,
          answers: finalAnswers.filter(Boolean),
          time_taken: totalTimeTaken,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to submit quiz")
      }

      const data = await response.json()
      setResults(data)
      setQuizState("results")
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (quizState === "taking" && timeLeft !== null) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer)
            // Auto-submit when time runs out
            submitQuiz(answers)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    // Track time taken
    if (quizState === "taking") {
      timer = setInterval(() => {
        setTimeTaken((prev) => prev + 1)
      }, 1000)
    }

    return () => clearInterval(timer)
  }, [quizState, timeLeft])

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gradient">{quiz.title}</h1>
              <p className="text-muted-foreground">{quiz.description}</p>
            </div>
            <Button variant="outline" onClick={() => router.push("/dashboard/discover")} className="animated-border">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Discover
            </Button>
          </div>
        </motion.div>

        {error && (
          <Alert variant="destructive" className="mb-6 border-red-500/50 bg-red-900/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AnimatePresence mode="wait">
          {quizState === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card className="glass-effect card-hover h-full">
                    <CardHeader>
                      <CardTitle>Quiz Information</CardTitle>
                      <CardDescription>Get ready to test your knowledge</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {quiz.category && (
                          <Badge variant="outline" className="capitalize">
                            {quiz.category}
                          </Badge>
                        )}
                        {quiz.difficulty && (
                          <Badge variant="outline" className="capitalize">
                            {quiz.difficulty}
                          </Badge>
                        )}
                        {quiz.time_limit && (
                          <Badge variant="outline">
                            <Clock className="mr-1 h-4 w-4" />
                            {quiz.time_limit} min
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-semibold">Description</h3>
                        <p>{quiz.description || "No description provided."}</p>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-semibold">Created by</h3>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage
                              src={creator.avatar_url || "/placeholder.svg?height=32&width=32"}
                              alt={creator.username}
                            />
                            <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-600">
                              {creator.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{creator.username}</span>
                        </div>
                      </div>

                      {quiz.time_limit && (
                        <div className="space-y-2">
                          <h3 className="font-semibold">Time Limit</h3>
                          <p>You have {quiz.time_limit} minutes to complete this quiz.</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button
                        onClick={startQuiz}
                        className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            Start Quiz
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>

                <div>
                  <Card className="glass-effect card-hover h-full">
                    <CardHeader>
                      <CardTitle>Previous Attempts</CardTitle>
                      <CardDescription>Your history with this quiz</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {previousAttempts.length > 0 ? (
                        <div className="space-y-4">
                          {previousAttempts.map((attempt, index) => (
                            <div key={attempt.id} className="p-3 rounded-lg glass-effect animated-border">
                              <div className="flex justify-between items-center mb-2">
                                <Badge variant="outline">{new Date(attempt.completed_at).toLocaleDateString()}</Badge>
                                <span className="font-bold">
                                  {Math.round((attempt.score / attempt.max_score) * 100)}%
                                </span>
                              </div>
                              <Progress value={(attempt.score / attempt.max_score) * 100} className="h-2" />
                              <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                                <span>
                                  Score: {attempt.score}/{attempt.max_score}
                                </span>
                                {attempt.time_taken && (
                                  <span>
                                    Time: {Math.floor(attempt.time_taken / 60)}m {attempt.time_taken % 60}s
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Award className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">No previous attempts</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {quizState === "taking" && quizData && (
            <motion.div
              key="taking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="glass-effect card-hover">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>
                        Question {currentQuestion + 1} of {quizData.questions.length}
                      </CardTitle>
                      <CardDescription>
                        {quizData.questions[currentQuestion].question_type === "multiple_choice"
                          ? "Select the best answer"
                          : "True or False"}
                      </CardDescription>
                    </div>
                    {timeLeft !== null && (
                      <div
                        className={`text-xl font-mono font-bold ${timeLeft < 60 ? "text-red-500 animate-pulse" : ""}`}
                      >
                        <Clock className="inline-block mr-2 h-5 w-5" />
                        {formatTime(timeLeft)}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Progress value={((currentQuestion + 1) / quizData.questions.length) * 100} className="h-2" />

                  <div className="py-4">
                    <h3 className="text-xl font-semibold mb-4">{quizData.questions[currentQuestion].question_text}</h3>

                    {quizData.questions[currentQuestion].image_url && (
                      <div className="mb-6 flex justify-center">
                        <img
                          src={quizData.questions[currentQuestion].image_url || "/placeholder.svg"}
                          alt="Question"
                          className="max-h-64 rounded-lg object-contain"
                        />
                      </div>
                    )}

                    <RadioGroup value={selectedAnswer || ""} onValueChange={handleAnswerSelect} className="space-y-3">
                      {quizData.questions[currentQuestion].answers.map((answer: any) => (
                        <div key={answer.id} className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={answer.id.toString()}
                            id={`answer-${answer.id}`}
                            className="border-white/20"
                          />
                          <Label
                            htmlFor={`answer-${answer.id}`}
                            className="flex-grow p-3 rounded-lg glass-effect cursor-pointer hover:bg-white/5"
                          >
                            {answer.answer_text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={prevQuestion}
                    disabled={currentQuestion === 0}
                    className="animated-border"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    onClick={nextQuestion}
                    disabled={!selectedAnswer || isLoading}
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : currentQuestion === quizData.questions.length - 1 ? (
                      <>
                        Submit Quiz
                        <Check className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {quizState === "results" && results && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <Card className="glass-effect card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="mr-2 h-5 w-5 text-amber-400" />
                    Quiz Results
                  </CardTitle>
                  <CardDescription>See how well you did</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-4">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-gradient mb-2">{results.percentage}%</div>
                      <p className="text-muted-foreground">Your Score</p>
                    </div>

                    <div className="h-16 w-0.5 bg-white/10 hidden md:block" />

                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2">
                        {results.score} / {results.max_score}
                      </div>
                      <p className="text-muted-foreground">Points</p>
                    </div>

                    <div className="h-16 w-0.5 bg-white/10 hidden md:block" />

                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2">{formatTime(timeTaken)}</div>
                      <p className="text-muted-foreground">Time Taken</p>
                    </div>
                  </div>

                  <div className="space-y-6 pt-4">
                    <h3 className="text-xl font-semibold">Question Review</h3>

                    {results.questions.map((item: any, index: number) => (
                      <div key={index} className="p-4 rounded-lg glass-effect space-y-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">
                            Question {index + 1}: {item.question.question_text}
                          </h4>
                          {item.user_answer.is_correct ? (
                            <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">
                              <CheckCircle2 className="mr-1 h-4 w-4" />
                              Correct
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30">
                              <XCircle className="mr-1 h-4 w-4" />
                              Incorrect
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-2">
                          {item.answers.map((answer: any) => (
                            <div
                              key={answer.id}
                              className={`p-3 rounded-lg ${
                                answer.id === item.user_answer.answer_id && answer.is_correct
                                  ? "bg-green-500/20 border border-green-500/50"
                                  : answer.id === item.user_answer.answer_id
                                    ? "bg-red-500/20 border border-red-500/50"
                                    : answer.is_correct
                                      ? "bg-green-500/10 border border-green-500/30"
                                      : "bg-black/20 border border-white/10"
                              }`}
                            >
                              <div className="flex justify-between">
                                <span>{answer.answer_text}</span>
                                {answer.is_correct && <CheckCircle2 className="h-5 w-5 text-green-400" />}
                                {answer.id === item.user_answer.answer_id && !answer.is_correct && (
                                  <XCircle className="h-5 w-5 text-red-400" />
                                )}
                              </div>

                              {answer.explanation && answer.is_correct && (
                                <div className="mt-2 text-sm text-muted-foreground">
                                  <span className="font-semibold">Explanation:</span> {answer.explanation}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard/discover")}
                    className="w-full sm:w-auto animated-border"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Discover
                  </Button>
                  <Button
                    onClick={() => router.push("/dashboard/leaderboard")}
                    className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600"
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    View Leaderboard
                  </Button>
                  <Button
                    onClick={() => {
                      setQuizState("intro")
                      setCurrentQuestion(0)
                      setSelectedAnswer(null)
                      setAnswers([])
                      setResults(null)
                      setTimeTaken(0)
                    }}
                    className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-purple-600"
                  >
                    <Award className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
