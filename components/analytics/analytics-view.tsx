"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Activity,
  Award,
  BarChart3,
  BookOpen,
  Brain,
  Calendar,
  ChevronUp,
  Clock,
  FileQuestion,
  Flame,
  LineChart,
  Medal,
  Star,
  Trophy,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard/dashboard-layout"

interface AnalyticsViewProps {
  userStats: any
  quizCreation: any
  quizAttempts: any
  popularQuizzes: any[]
  recentActivity: any[]
  categoryPerformance: any[]
  attempts: any[]
}

export default function AnalyticsView({
  userStats,
  quizCreation,
  quizAttempts,
  popularQuizzes,
  recentActivity,
  categoryPerformance,
  attempts,
}: AnalyticsViewProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [timeFilter, setTimeFilter] = useState("all")

  // Filter attempts based on time filter
  const filteredAttempts = attempts.filter((attempt) => {
    if (timeFilter === "all") return true

    const attemptDate = new Date(attempt.completed_at)
    const now = new Date()

    if (timeFilter === "week") {
      const weekAgo = new Date()
      weekAgo.setDate(now.getDate() - 7)
      return attemptDate >= weekAgo
    }

    if (timeFilter === "month") {
      const monthAgo = new Date()
      monthAgo.setMonth(now.getMonth() - 1)
      return attemptDate >= monthAgo
    }

    if (timeFilter === "year") {
      const yearAgo = new Date()
      yearAgo.setFullYear(now.getFullYear() - 1)
      return attemptDate >= yearAgo
    }

    return true
  })

  // Calculate average score for filtered attempts
  const averageScore =
    filteredAttempts.length > 0
      ? Math.round(
          filteredAttempts.reduce((sum, attempt) => sum + (attempt.score / attempt.max_score) * 100, 0) /
            filteredAttempts.length,
        )
      : 0

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
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-gradient">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your quiz performance and statistics</p>
        </motion.div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 md:w-[400px] glass-effect">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-600/20"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="attempts"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-600/20"
            >
              <Activity className="mr-2 h-4 w-4" />
              Attempts
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-600/20"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
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
                    <div className="text-2xl font-bold">{quizCreation?.total_quizzes || 0}</div>
                    <p className="text-xs text-muted-foreground">{quizCreation?.published_quizzes || 0} published</p>
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
                    <div className="text-2xl font-bold">{quizAttempts?.total_attempts || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {quizAttempts?.latest_attempt_date
                        ? `Last attempt: ${new Date(quizAttempts.latest_attempt_date).toLocaleDateString()}`
                        : "No attempts yet"}
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
                    <div className="text-2xl font-bold">{userStats?.total_points || 0}</div>
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
                    <div className="text-2xl font-bold">{Math.round(quizAttempts?.average_percentage || 0)}%</div>
                    <Progress value={quizAttempts?.average_percentage || 0} className="h-2 mt-2" />
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <motion.div variants={itemVariants}>
                <Card className="glass-effect card-hover h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Flame className="mr-2 h-5 w-5 text-orange-400 animate-pulse" />
                      Popular Quizzes
                    </CardTitle>
                    <CardDescription>Your most attempted quizzes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {popularQuizzes.length > 0 ? (
                      <div className="space-y-4">
                        {popularQuizzes.map((quiz, index) => (
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
                                className="mr-3 p-2 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10"
                              >
                                <FileQuestion className="h-5 w-5 text-orange-400" />
                              </motion.div>
                              <div>
                                <p className="font-medium">{quiz.title}</p>
                                <p className="text-xs text-muted-foreground">{quiz.attempt_count || 0} attempts</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{Math.round(quiz.average_score || 0)}%</p>
                              <p className="text-xs text-muted-foreground">Avg. score</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No quiz data available yet</p>
                        <Button asChild className="mt-4 bg-gradient-to-r from-cyan-500 to-purple-600">
                          <Link href="/dashboard/create">Create a quiz</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="glass-effect card-hover h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="mr-2 h-5 w-5 text-cyan-400 animate-pulse" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>Your latest quiz activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentActivity.length > 0 ? (
                      <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-3 rounded-lg glass-effect animated-border"
                          >
                            <div className="flex items-center">
                              <motion.div
                                variants={iconVariants}
                                whileHover="hover"
                                className={`mr-3 p-2 rounded-full ${
                                  activity.activity_type === "quiz_created"
                                    ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/10"
                                    : "bg-gradient-to-r from-purple-500/10 to-pink-500/10"
                                }`}
                              >
                                {activity.activity_type === "quiz_created" ? (
                                  <FileQuestion className="h-5 w-5 text-cyan-400" />
                                ) : (
                                  <Brain className="h-5 w-5 text-purple-400" />
                                )}
                              </motion.div>
                              <div>
                                <p className="font-medium line-clamp-1">{activity.item_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {activity.activity_type === "quiz_created" ? "Created" : "Attempted"} on{" "}
                                  {new Date(activity.activity_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No recent activity</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {categoryPerformance.length > 0 && (
              <motion.div variants={itemVariants} className="mt-6">
                <Card className="glass-effect card-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <LineChart className="mr-2 h-5 w-5 text-purple-400 animate-pulse" />
                      Performance by Category
                    </CardTitle>
                    <CardDescription>Your quiz performance across different categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categoryPerformance.map((category, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Badge variant="outline" className="mr-2">
                                {category.category.charAt(0).toUpperCase() + category.category.slice(1)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">{category.attempt_count} attempts</span>
                            </div>
                            <span className="font-bold">{Math.round(category.average_score)}%</span>
                          </div>
                          <Progress value={category.average_score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="attempts">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Quiz Attempts</h2>
                  <p className="text-muted-foreground">Track all your quiz attempts and scores</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-[180px] bg-black/30 border-white/10">
                      <Calendar className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter by time" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="glass-effect card-hover">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <motion.div
                        variants={iconVariants}
                        whileHover="hover"
                        className="mr-2 p-2 rounded-full bg-cyan-500/10"
                      >
                        <Brain className="h-4 w-4 text-cyan-400" />
                      </motion.div>
                      Total Attempts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{filteredAttempts.length}</div>
                  </CardContent>
                </Card>

                <Card className="glass-effect card-hover">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <motion.div
                        variants={iconVariants}
                        whileHover="hover"
                        className="mr-2 p-2 rounded-full bg-purple-500/10"
                      >
                        <Award className="h-4 w-4 text-purple-400" />
                      </motion.div>
                      Average Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{averageScore}%</div>
                    <Progress value={averageScore} className="h-2 mt-2" />
                  </CardContent>
                </Card>

                <Card className="glass-effect card-hover">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <motion.div
                        variants={iconVariants}
                        whileHover="hover"
                        className="mr-2 p-2 rounded-full bg-pink-500/10"
                      >
                        <Medal className="h-4 w-4 text-pink-400" />
                      </motion.div>
                      Best Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {filteredAttempts.length > 0
                        ? Math.round(Math.max(...filteredAttempts.map((a) => (a.score / a.max_score) * 100)))
                        : 0}
                      %
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="glass-effect card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-cyan-400" />
                    Attempt History
                  </CardTitle>
                  <CardDescription>
                    {timeFilter === "all" ? "All your quiz attempts" : `Quiz attempts from the last ${timeFilter}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredAttempts.length > 0 ? (
                    <div className="rounded-md border border-white/10 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-black/40">
                          <TableRow>
                            <TableHead>Quiz</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Difficulty</TableHead>
                            <TableHead className="text-right">Score</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAttempts.map((attempt, index) => (
                            <TableRow key={attempt.id} className="hover:bg-white/5">
                              <TableCell className="font-medium">{attempt.quiz_title}</TableCell>
                              <TableCell>{new Date(attempt.completed_at).toLocaleDateString()}</TableCell>
                              <TableCell>
                                {attempt.quiz_category
                                  ? attempt.quiz_category.charAt(0).toUpperCase() + attempt.quiz_category.slice(1)
                                  : "N/A"}
                              </TableCell>
                              <TableCell>
                                {attempt.quiz_difficulty
                                  ? attempt.quiz_difficulty.charAt(0).toUpperCase() + attempt.quiz_difficulty.slice(1)
                                  : "N/A"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge
                                  className={`${
                                    (attempt.score / attempt.max_score) >= 0.8
                                      ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                      : attempt.score / attempt.max_score >= 0.6
                                        ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                                        : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                  }`}
                                >
                                  {attempt.score}/{attempt.max_score} (
                                  {Math.round((attempt.score / attempt.max_score) * 100)}%)
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-xl font-bold mb-2">No attempts found</h3>
                      <p className="text-muted-foreground mb-6">
                        {timeFilter !== "all"
                          ? `Try selecting a different time period`
                          : `You haven't taken any quizzes yet`}
                      </p>
                      <Button asChild className="bg-gradient-to-r from-cyan-500 to-purple-600">
                        <Link href="/dashboard/discover">Discover Quizzes</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Performance Analysis</h2>
                <p className="text-muted-foreground">Detailed breakdown of your quiz performance</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-effect card-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5 text-cyan-400" />
                      Performance by Category
                    </CardTitle>
                    <CardDescription>How you perform across different quiz categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {categoryPerformance.length > 0 ? (
                      <div className="space-y-6">
                        {categoryPerformance.map((category, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">
                                  {category.category.charAt(0).toUpperCase() + category.category.slice(1)}
                                </h4>
                                <p className="text-xs text-muted-foreground">{category.attempt_count} attempts</p>
                              </div>
                              <div className="flex items-center">
                                <ChevronUp
                                  className={`h-4 w-4 mr-1 ${
                                    category.average_score >= 80
                                      ? "text-green-400"
                                      : category.average_score >= 60
                                        ? "text-amber-400"
                                        : "text-red-400"
                                  }`}
                                />
                                <span className="font-bold">{Math.round(category.average_score)}%</span>
                              </div>
                            </div>
                            <Progress
                              value={category.average_score}
                              className={`h-2 ${
                                category.average_score >= 80
                                  ? "bg-green-900/20"
                                  : category.average_score >= 60
                                    ? "bg-amber-900/20"
                                    : "bg-red-900/20"
                              }`}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No category data available yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass-effect card-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-purple-400" />
                      Time Analysis
                    </CardTitle>
                    <CardDescription>How quickly you complete quizzes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {filteredAttempts.filter((a) => a.time_taken).length > 0 ? (
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium mb-2">Average Completion Time</h4>
                          <div className="text-3xl font-bold">
                            {Math.floor(
                              filteredAttempts.reduce((sum, a) => sum + (a.time_taken || 0), 0) /
                                filteredAttempts.filter((a) => a.time_taken).length /
                                60,
                            )}{" "}
                            min
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Based on {filteredAttempts.filter((a) => a.time_taken).length} timed attempts
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Time vs. Score Correlation</h4>
                          <div className="space-y-2">
                            {[
                              { label: "Quick (<2 min)", time: 120, count: 0, score: 0 },
                              { label: "Average (2-5 min)", time: 300, count: 0, score: 0 },
                              { label: "Thorough (>5 min)", time: Number.POSITIVE_INFINITY, count: 0, score: 0 },
                            ].map((timeRange, i) => {
                              const attemptsInRange = filteredAttempts.filter(
                                (a) =>
                                  a.time_taken &&
                                  (i === 0
                                    ? a.time_taken < timeRange.time
                                    : i === 1
                                      ? a.time_taken >= 120 && a.time_taken < timeRange.time
                                      : a.time_taken >= 300),
                              )

                              const avgScore =
                                attemptsInRange.length > 0
                                  ? attemptsInRange.reduce((sum, a) => sum + (a.score / a.max_score) * 100, 0) /
                                    attemptsInRange.length
                                  : 0

                              return (
                                <div key={i} className="flex justify-between items-center">
                                  <div className="flex items-center">
                                    <div
                                      className={`w-3 h-3 rounded-full mr-2 ${
                                        i === 0 ? "bg-cyan-400" : i === 1 ? "bg-purple-400" : "bg-pink-400"
                                      }`}
                                    />
                                    <span>{timeRange.label}</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="text-sm text-muted-foreground">
                                      {attemptsInRange.length} attempts
                                    </span>
                                    <span className="font-bold">{Math.round(avgScore)}%</span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No time data available yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="glass-effect card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="mr-2 h-5 w-5 text-amber-400" />
                    Achievement Summary
                  </CardTitle>
                  <CardDescription>Your quiz-taking milestones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col items-center p-4 rounded-lg glass-effect text-center">
                      <motion.div
                        variants={pulseVariants}
                        animate="pulse"
                        className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-3"
                      >
                        <Brain className="h-8 w-8 text-cyan-400" />
                      </motion.div>
                      <h3 className="text-xl font-bold">{attempts.length}</h3>
                      <p className="text-muted-foreground">Total Quizzes Completed</p>
                    </div>

                    <div className="flex flex-col items-center p-4 rounded-lg glass-effect text-center">
                      <motion.div
                        variants={pulseVariants}
                        animate="pulse"
                        className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-3"
                      >
                        <Award className="h-8 w-8 text-purple-400" />
                      </motion.div>
                      <h3 className="text-xl font-bold">
                        {attempts.length > 0
                          ? Math.round(Math.max(...attempts.map((a) => (a.score / a.max_score) * 100)))
                          : 0}
                        %
                      </h3>
                      <p className="text-muted-foreground">Highest Score Achieved</p>
                    </div>

                    <div className="flex flex-col items-center p-4 rounded-lg glass-effect text-center">
                      <motion.div
                        variants={pulseVariants}
                        animate="pulse"
                        className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-3"
                      >
                        <Star className="h-8 w-8 text-amber-400" />
                      </motion.div>
                      <h3 className="text-xl font-bold">{userStats?.total_points || 0}</h3>
                      <p className="text-muted-foreground">Total Points Earned</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
