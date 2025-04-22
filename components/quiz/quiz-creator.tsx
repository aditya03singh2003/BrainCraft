"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  FileQuestion,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard/dashboard-layout"

export default function QuizCreator() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [quizId, setQuizId] = useState<number | null>(null)

  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    category: "general",
    difficulty: "medium",
    time_limit: 0,
    is_published: false,
  })

  const [questions, setQuestions] = useState<any[]>([
    {
      question_text: "",
      question_type: "multiple_choice",
      points: 1,
      image_url: "",
      answers: [
        { answer_text: "", is_correct: false, explanation: "" },
        { answer_text: "", is_correct: false, explanation: "" },
        { answer_text: "", is_correct: false, explanation: "" },
        { answer_text: "", is_correct: false, explanation: "" },
      ],
    },
  ])

  const handleQuizDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setQuizData({
      ...quizData,
      [name]: value,
    })
  }

  const handleSwitchChange = (checked: boolean) => {
    setQuizData({
      ...quizData,
      is_published: checked,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setQuizData({
      ...quizData,
      [name]: value,
    })
  }

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    }
    setQuestions(updatedQuestions)
  }

  const handleAnswerChange = (questionIndex: number, answerIndex: number, field: string, value: any) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].answers[answerIndex] = {
      ...updatedQuestions[questionIndex].answers[answerIndex],
      [field]: value,
    }
    setQuestions(updatedQuestions)
  }

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        question_type: "multiple_choice",
        points: 1,
        image_url: "",
        answers: [
          { answer_text: "", is_correct: false, explanation: "" },
          { answer_text: "", is_correct: false, explanation: "" },
          { answer_text: "", is_correct: false, explanation: "" },
          { answer_text: "", is_correct: false, explanation: "" },
        ],
      },
    ])
  }

  const handleRemoveQuestion = (index: number) => {
    if (questions.length > 1) {
      const updatedQuestions = [...questions]
      updatedQuestions.splice(index, 1)
      setQuestions(updatedQuestions)
    }
  }

  const handleAddAnswer = (questionIndex: number) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].answers.push({
      answer_text: "",
      is_correct: false,
      explanation: "",
    })
    setQuestions(updatedQuestions)
  }

  const handleRemoveAnswer = (questionIndex: number, answerIndex: number) => {
    if (questions[questionIndex].answers.length > 2) {
      const updatedQuestions = [...questions]
      updatedQuestions[questionIndex].answers.splice(answerIndex, 1)
      setQuestions(updatedQuestions)
    }
  }

  const validateQuizData = () => {
    if (!quizData.title.trim()) {
      setError("Quiz title is required")
      return false
    }
    return true
  }

  const validateQuestions = () => {
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]

      if (!question.question_text.trim()) {
        setError(`Question ${i + 1} text is required`)
        return false
      }

      const hasCorrectAnswer = question.answers.some((answer: any) => answer.is_correct)
      if (!hasCorrectAnswer) {
        setError(`Question ${i + 1} must have at least one correct answer`)
        return false
      }

      for (let j = 0; j < question.answers.length; j++) {
        if (!question.answers[j].answer_text.trim()) {
          setError(`Answer ${j + 1} for Question ${i + 1} is required`)
          return false
        }
      }
    }

    return true
  }

  const handleCreateQuiz = async () => {
    setError("")
    setSuccess("")

    if (!validateQuizData()) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quizData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create quiz")
      }

      setQuizId(data.id)
      setSuccess("Quiz created successfully! Now add your questions.")
      setStep(2)
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddQuestions = async () => {
    setError("")
    setSuccess("")

    if (!validateQuestions()) return

    setIsLoading(true)

    try {
      // Add questions one by one
      for (const question of questions) {
        const response = await fetch(`/api/quizzes/${quizId}/questions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(question),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to add question")
        }
      }

      setSuccess("Quiz created successfully!")

      // Update quiz with published status if needed
      if (quizData.is_published) {
        await fetch(`/api/quizzes/${quizId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...quizData,
            is_published: true,
          }),
        })
      }

      // Redirect to quiz details page
      setTimeout(() => {
        router.push(`/dashboard/quizzes/${quizId}`)
      }, 1500)
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step === 1) {
      await handleCreateQuiz()
    } else {
      await handleAddQuestions()
    }
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

  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-gradient">Create New Quiz</h1>
            <p className="text-muted-foreground">Design your quiz in just a few steps</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/dashboard")} className="animated-border">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </motion.div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className="flex space-x-2">
              <motion.div
                animate={step === 1 ? { scale: [1, 1.1, 1], backgroundColor: "#3b82f6" } : {}}
                transition={{ duration: 0.5 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 1 ? "bg-primary" : "bg-muted"
                }`}
              >
                <FileQuestion className="h-4 w-4" />
              </motion.div>
              <div className="h-0.5 w-12 mt-4 bg-muted" />
              <motion.div
                animate={step === 2 ? { scale: [1, 1.1, 1], backgroundColor: "#3b82f6" } : {}}
                transition={{ duration: 0.5 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 2 ? "bg-primary" : "bg-muted"
                }`}
              >
                <Brain className="h-4 w-4" />
              </motion.div>
            </div>
            <div className="text-sm text-muted-foreground">Step {step} of 2</div>
          </div>
          <div className="flex">
            <div className={`flex-1 text-center ${step === 1 ? "text-primary" : "text-muted-foreground"}`}>
              Quiz Details
            </div>
            <div className={`flex-1 text-center ${step === 2 ? "text-primary" : "text-muted-foreground"}`}>
              Questions
            </div>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <Alert variant="destructive" className="border-red-500/50 bg-red-900/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <Alert className="border-green-500/50 bg-green-900/20 text-green-400">
              <Check className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="glass-effect card-hover border-cyan-500/20">
                  <CardHeader>
                    <CardTitle>Quiz Information</CardTitle>
                    <CardDescription>Enter the basic details for your quiz</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="title">Quiz Title</Label>
                      <Input
                        id="title"
                        name="title"
                        value={quizData.title}
                        onChange={handleQuizDataChange}
                        placeholder="Enter a catchy title for your quiz"
                        className="bg-black/30 border-white/10"
                      />
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={quizData.description}
                        onChange={handleQuizDataChange}
                        placeholder="Describe what your quiz is about"
                        className="bg-black/30 border-white/10 min-h-[100px]"
                      />
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div variants={itemVariants} className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={quizData.category}
                          onValueChange={(value) => handleSelectChange("category", value)}
                        >
                          <SelectTrigger className="bg-black/30 border-white/10">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
                            <SelectItem value="general">General Knowledge</SelectItem>
                            <SelectItem value="science">Science</SelectItem>
                            <SelectItem value="history">History</SelectItem>
                            <SelectItem value="geography">Geography</SelectItem>
                            <SelectItem value="entertainment">Entertainment</SelectItem>
                            <SelectItem value="sports">Sports</SelectItem>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="language">Language</SelectItem>
                            <SelectItem value="mathematics">Mathematics</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </motion.div>

                      <motion.div variants={itemVariants} className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select
                          value={quizData.difficulty}
                          onValueChange={(value) => handleSelectChange("difficulty", value)}
                        >
                          <SelectTrigger className="bg-black/30 border-white/10">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div variants={itemVariants} className="space-y-2">
                        <Label htmlFor="time_limit">Time Limit (minutes, 0 for no limit)</Label>
                        <Input
                          id="time_limit"
                          name="time_limit"
                          type="number"
                          min="0"
                          value={quizData.time_limit}
                          onChange={handleQuizDataChange}
                          className="bg-black/30 border-white/10"
                        />
                      </motion.div>

                      <motion.div variants={itemVariants} className="flex items-center justify-between space-y-0 pt-6">
                        <div className="space-y-0.5">
                          <Label htmlFor="is_published">Publish Quiz</Label>
                          <p className="text-sm text-muted-foreground">Make this quiz available to others</p>
                        </div>
                        <Switch
                          id="is_published"
                          checked={quizData.is_published}
                          onCheckedChange={handleSwitchChange}
                        />
                      </motion.div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/dashboard")}
                      className="animated-border"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: 20 }}
              >
                <Card className="glass-effect card-hover border-purple-500/20 mb-6">
                  <CardHeader>
                    <CardTitle>Add Questions</CardTitle>
                    <CardDescription>Create questions and answers for your quiz</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {questions.map((question, qIndex) => (
                        <motion.div
                          key={qIndex}
                          variants={fadeVariants}
                          className="p-4 rounded-lg glass-effect border border-white/10 space-y-4"
                        >
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Question {qIndex + 1}</h3>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveQuestion(qIndex)}
                              disabled={questions.length <= 1}
                              className="text-red-500 hover:text-red-400 hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor={`question-${qIndex}`}>Question Text</Label>
                              <Textarea
                                id={`question-${qIndex}`}
                                value={question.question_text}
                                onChange={(e) => handleQuestionChange(qIndex, "question_text", e.target.value)}
                                placeholder="Enter your question"
                                className="bg-black/30 border-white/10"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`question-type-${qIndex}`}>Question Type</Label>
                                <Select
                                  value={question.question_type}
                                  onValueChange={(value) => handleQuestionChange(qIndex, "question_type", value)}
                                >
                                  <SelectTrigger id={`question-type-${qIndex}`} className="bg-black/30 border-white/10">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
                                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                    <SelectItem value="true_false">True/False</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`points-${qIndex}`}>Points</Label>
                                <Input
                                  id={`points-${qIndex}`}
                                  type="number"
                                  min="1"
                                  value={question.points}
                                  onChange={(e) =>
                                    handleQuestionChange(qIndex, "points", Number.parseInt(e.target.value))
                                  }
                                  className="bg-black/30 border-white/10"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`image-url-${qIndex}`}>Image URL (optional)</Label>
                              <Input
                                id={`image-url-${qIndex}`}
                                value={question.image_url || ""}
                                onChange={(e) => handleQuestionChange(qIndex, "image_url", e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="bg-black/30 border-white/10"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <Label>Answers</Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddAnswer(qIndex)}
                                  className="text-xs h-8"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Answer
                                </Button>
                              </div>

                              <div className="space-y-3">
                                {question.answers.map((answer, aIndex) => (
                                  <div key={aIndex} className="flex gap-2 items-start">
                                    <div className="flex-grow space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Input
                                          value={answer.answer_text}
                                          onChange={(e) =>
                                            handleAnswerChange(qIndex, aIndex, "answer_text", e.target.value)
                                          }
                                          placeholder={`Answer ${aIndex + 1}`}
                                          className="bg-black/30 border-white/10"
                                        />
                                        <div className="flex items-center space-x-2">
                                          <Switch
                                            id={`correct-${qIndex}-${aIndex}`}
                                            checked={answer.is_correct}
                                            onCheckedChange={(checked) =>
                                              handleAnswerChange(qIndex, aIndex, "is_correct", checked)
                                            }
                                          />
                                          <Label htmlFor={`correct-${qIndex}-${aIndex}`} className="text-xs">
                                            Correct
                                          </Label>
                                        </div>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleRemoveAnswer(qIndex, aIndex)}
                                          disabled={question.answers.length <= 2}
                                          className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-900/20"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      <Input
                                        value={answer.explanation || ""}
                                        onChange={(e) =>
                                          handleAnswerChange(qIndex, aIndex, "explanation", e.target.value)
                                        }
                                        placeholder="Explanation (optional)"
                                        className="bg-black/30 border-white/10"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div>
                      <Button type="button" variant="outline" onClick={handleAddQuestion} className="animated-border">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Question
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setStep(1)} className="animated-border">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Quiz
                          </>
                        )}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </DashboardLayout>
  )
}
