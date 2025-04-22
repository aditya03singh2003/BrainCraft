"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { UserSession } from "@/lib/auth"
import Link from "next/link"
import {
  Activity,
  Award,
  BookOpen,
  Brain,
  Clock,
  Edit3,
  FileQuestion,
  Flame,
  Lightbulb,
  Plus,
  Rocket,
  Sparkles,
  Star,
  Trophy,
  Users,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard/dashboard-layout"

interface DashboardViewProps {
  user: UserSession
  recentQuizzes: any[]
  recentAttempts: any[]
  stats: any
  popularQuizzes: any[]
}

export default function DashboardView({
  user,
  recentQuizzes,
  recentAttempts,
  stats,
  popularQuizzes,
}: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState("overview")

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

  const iconVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.2, rotate: 5, transition: { duration: 0.3, type: "spring" } },
  }

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [0.8, 1, 0.8],
      transition: { repeat: Number.POSITIVE_INFINITY, duration: 2 },
    },
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gradient">Welcome back, {user.username}!</h1>
            <p className="text-muted-foreground">Here's what's happening with your quizzes today.</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              asChild
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
            >
              <Link href="/dashboard/create">
                <Plus className="mr-2 h-4 w-4 animate-pulse" />
                Create New Quiz
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 md:w-[400px] glass-effect">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-600/20"
            >
              <Activity className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="my-quizzes"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-600/20"
            >
              <FileQuestion className="mr-2 h-4 w-4" />
              My Quizzes
            </TabsTrigger>
            <TabsTrigger
              value="discover"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-600/20"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Discover
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <motion.div variants={itemVariants}>
                <Card className="glass-effect card-hover border-cyan-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <motion.div
                        variants={iconVariants}
                        whileHover="hover"
                        className="mr-2 p-2 rounded-full bg-cyan-500/10"
                      >
                        <BookOpen className="h-4 w-4 text-cyan-400" />
                      </motion.div>
                      Quizzes Created
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_quizzes}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.quizzes_created > 0 ? `+${stats.quizzes_created} this month` : "No new quizzes this month"}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="glass-effect card-hover border-purple-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <motion.div
                        variants={iconVariants}
                        whileHover="hover"
                        className="mr-2 p-2 rounded-full bg-purple-500/10"
                      >
                        <Brain className="h-4 w-4 text-purple-400" />
                      </motion.div>
                      Quizzes Taken
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_attempts}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.quizzes_taken > 0 ? `+${stats.quizzes_taken} this month` : "No quizzes taken this month"}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="glass-effect card-hover border-pink-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <motion.div
                        variants={iconVariants}
                        whileHover="hover"
                        className="mr-2 p-2 rounded-full bg-pink-500/10"
                      >
                        <Trophy className="h-4 w-4 text-pink-400" />
                      </motion.div>
                      Total Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_points}</div>
                    <p className="text-xs text-muted-foreground">Lifetime points earned</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="glass-effect card-hover border-amber-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <motion.div
                        variants={iconVariants}
                        whileHover="hover"
                        className="mr-2 p-2 rounded-full bg-amber-500/10"
                      >
                        <Star className="h-4 w-4 text-amber-400" />
                      </motion.div>
                      Average Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Math.round(stats.average_score)}%</div>
                    <Progress value={stats.average_score} className="h-2 mt-2" />
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div variants={itemVariants}>
                <Card className="glass-effect card-hover h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lightbulb className="mr-2 h-5 w-5 text-cyan-400 animate-pulse" />
                      Recent Quizzes
                    </CardTitle>
                    <CardDescription>Your recently created quizzes</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentQuizzes.length > 0 ? (
                      recentQuizzes.map((quiz, index) => (
                        <motion.div
                          key={quiz.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-lg glass-effect animated-border"
                        >
                          <div className="flex items-center">
                            <motion.div
                              variants={iconVariants}
                              whileHover="hover"
                              className="mr-3 p-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10"
                            >
                              <FileQuestion className="h-5 w-5 text-cyan-400" />
                            </motion.div>
                            <div>
                              <p className="font-medium">{quiz.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(quiz.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant={quiz.is_published ? "default" : "outline"}>
                            {quiz.is_published ? "Published" : "Draft"}
                          </Badge>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No quizzes created yet</p>
                        <Button asChild className="mt-4 bg-gradient-to-r from-cyan-500 to-purple-600">
                          <Link href="/dashboard/create">Create your first quiz</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                  {recentQuizzes.length > 0 && (
                    <CardFooter>
                      <Button asChild variant="outline" className="w-full animated-border">
                        <Link href="/dashboard/quizzes">View all quizzes</Link>
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="glass-effect card-hover h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="mr-2 h-5 w-5 text-purple-400 animate-pulse" />
                      Recent Attempts
                    </CardTitle>
                    <CardDescription>Your recent quiz attempts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentAttempts.length > 0 ? (
                      recentAttempts.map((attempt, index) => (
                        <motion.div
                          key={attempt.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-lg glass-effect animated-border"
                        >
                          <div className="flex items-center">
                            <motion.div
                              variants={iconVariants}
                              whileHover="hover"
                              className="mr-3 p-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10"
                            >
                              <Award className="h-5 w-5 text-purple-400" />
                            </motion.div>
                            <div>
                              <p className="font-medium">{attempt.quiz_title}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(attempt.completed_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{Math.round((attempt.score / attempt.max_score) * 100)}%</p>
                            <p className="text-xs text-muted-foreground">
                              {attempt.score}/{attempt.max_score} points
                            </p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No quiz attempts yet</p>
                        <Button asChild className="mt-4 bg-gradient-to-r from-purple-500 to-pink-600">
                          <Link href="/dashboard/discover">Discover quizzes</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                  {recentAttempts.length > 0 && (
                    <CardFooter>
                      <Button asChild variant="outline" className="w-full animated-border">
                        <Link href="/dashboard/analytics">View all attempts</Link>
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="my-quizzes">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Quizzes</h2>
                <Button asChild className="bg-gradient-to-r from-cyan-500 to-purple-600">
                  <Link href="/dashboard/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Quiz
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentQuizzes.length > 0 ? (
                  recentQuizzes.map((quiz, index) => (
                    <motion.div
                      key={quiz.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="glass-effect card-hover h-full flex flex-col">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <Badge variant={quiz.is_published ? "default" : "outline"} className="mb-2">
                              {quiz.is_published ? "Published" : "Draft"}
                            </Badge>
                            <motion.div variants={iconVariants} whileHover="hover">
                              <Button variant="ghost" size="icon" asChild>
                                <Link href={`/dashboard/quizzes/${quiz.id}/edit`}>
                                  <Edit3 className="h-4 w-4" />
                                </Link>
                              </Button>
                            </motion.div>
                          </div>
                          <CardTitle>{quiz.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {quiz.description || "No description provided"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-1 h-4 w-4" />
                            <span>{new Date(quiz.created_at).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-2">
                          <Button asChild variant="outline" className="w-full animated-border">
                            <Link href={`/dashboard/quizzes/${quiz.id}`}>View Details</Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <FileQuestion className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-bold mb-2">No quizzes yet</h3>
                    <p className="text-muted-foreground mb-6">Create your first quiz to get started</p>
                    <Button asChild className="bg-gradient-to-r from-cyan-500 to-purple-600">
                      <Link href="/dashboard/create">Create New Quiz</Link>
                    </Button>
                  </div>
                )}
              </div>

              {recentQuizzes.length > 0 && (
                <div className="flex justify-center mt-6">
                  <Button asChild variant="outline" className="animated-border">
                    <Link href="/dashboard/quizzes">View All Quizzes</Link>
                  </Button>
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="discover">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Discover Quizzes</h2>
                <Button asChild variant="outline">
                  <Link href="/dashboard/discover">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Browse All
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularQuizzes.length > 0 ? (
                  popularQuizzes.map((quiz, index) => (
                    <motion.div
                      key={quiz.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="glass-effect card-hover h-full flex flex-col">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <Badge className="mb-2 bg-gradient-to-r from-amber-500 to-orange-600">Popular</Badge>
                            <motion.div
                              variants={pulseVariants}
                              animate="pulse"
                              className="flex items-center text-amber-400"
                            >
                              <Flame className="h-4 w-4 mr-1" />
                              <span className="text-xs font-bold">{quiz.attempt_count || 0}</span>
                            </motion.div>
                          </div>
                          <CardTitle>{quiz.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {quiz.description || "No description provided"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="mr-1 h-4 w-4" />
                            <span>By {quiz.creator_name}</span>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-2">
                          <Button asChild className="w-full bg-gradient-to-r from-amber-500 to-orange-600">
                            <Link href={`/dashboard/quizzes/${quiz.id}/take`}>Take Quiz</Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <Rocket className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-bold mb-2">No popular quizzes yet</h3>
                    <p className="text-muted-foreground mb-6">Be the first to create trending content!</p>
                    <Button asChild className="bg-gradient-to-r from-cyan-500 to-purple-600">
                      <Link href="/dashboard/create">Create New Quiz</Link>
                    </Button>
                  </div>
                )}
              </div>

              {popularQuizzes.length > 0 && (
                <div className="flex justify-center mt-6">
                  <Button asChild variant="outline" className="animated-border">
                    <Link href="/dashboard/discover">Discover More Quizzes</Link>
                  </Button>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
