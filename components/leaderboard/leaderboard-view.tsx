"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Award, Crown, Filter, Medal, Search, Trophy } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import type { UserSession } from "@/lib/auth"

interface LeaderboardViewProps {
  globalLeaderboard: any[]
  quizLeaderboards: any[]
  userRank: number | null
  currentUser: UserSession
}

export default function LeaderboardView({
  globalLeaderboard,
  quizLeaderboards,
  userRank,
  currentUser,
}: LeaderboardViewProps) {
  const [activeTab, setActiveTab] = useState("global")
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(
    quizLeaderboards.length > 0 ? quizLeaderboards[0].quiz_id.toString() : null,
  )

  // Get unique categories from quizzes
  const categories = Array.from(new Set(quizLeaderboards.map((quiz) => quiz.category).filter(Boolean)))

  // Filter quizzes based on search and category
  const filteredQuizzes = quizLeaderboards.filter((quiz) => {
    const matchesSearch = quiz.quiz_title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || quiz.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Filter global leaderboard based on search
  const filteredGlobalLeaderboard = globalLeaderboard.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Get the selected quiz leaderboard
  const selectedQuizData = quizLeaderboards.find((quiz) => quiz.quiz_id.toString() === selectedQuiz)

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

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-5 w-5 text-yellow-400" />
    if (index === 1) return <Medal className="h-5 w-5 text-gray-300" />
    if (index === 2) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="font-bold text-muted-foreground">{index + 1}</span>
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-gradient">Leaderboards</h1>
          <p className="text-muted-foreground">See who's leading the pack in quiz mastery</p>
        </motion.div>

        {userRank && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass-effect card-hover border-amber-500/20">
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20">
                      <Trophy className="h-8 w-8 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Your Global Rank</h2>
                      <p className="text-muted-foreground">Keep taking quizzes to improve your position!</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-4xl font-bold text-gradient">#{userRank}</div>
                    <div className="text-sm text-muted-foreground">out of {globalLeaderboard.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Tabs defaultValue="global" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 md:w-[400px] glass-effect">
            <TabsTrigger
              value="global"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-600/20"
            >
              <Trophy className="mr-2 h-4 w-4" />
              Global Leaderboard
            </TabsTrigger>
            <TabsTrigger
              value="quizzes"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-600/20"
            >
              <Award className="mr-2 h-4 w-4" />
              Quiz Leaderboards
            </TabsTrigger>
          </TabsList>

          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={activeTab === "global" ? "Search users..." : "Search quizzes..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black/30 border-white/10"
            />
          </div>

          <TabsContent value="global">
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
              <Card className="glass-effect card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="mr-2 h-5 w-5 text-amber-400" />
                    Global Leaderboard
                  </CardTitle>
                  <CardDescription>Top performers across all quizzes</CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredGlobalLeaderboard.length > 0 ? (
                    <div className="rounded-md border border-white/10 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-black/40">
                          <TableRow>
                            <TableHead className="w-16">Rank</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead className="text-right">Quizzes Taken</TableHead>
                            <TableHead className="text-right">Quizzes Created</TableHead>
                            <TableHead className="text-right">Avg. Score</TableHead>
                            <TableHead className="text-right">Total Points</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredGlobalLeaderboard.map((user, index) => (
                            <TableRow
                              key={user.id}
                              className={`hover:bg-white/5 ${user.id === currentUser.id ? "bg-cyan-900/20 border-l-2 border-l-cyan-500" : ""}`}
                            >
                              <TableCell className="font-medium">
                                <div className="flex justify-center items-center">{getRankIcon(index)}</div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage
                                      src={user.avatar_url || "/placeholder.svg?height=32&width=32"}
                                      alt={user.username}
                                    />
                                    <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-600">
                                      {user.username.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{user.username}</span>
                                  {user.id === currentUser.id && (
                                    <Badge variant="outline" className="ml-2">
                                      You
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">{user.quizzes_taken || 0}</TableCell>
                              <TableCell className="text-right">{user.quizzes_created || 0}</TableCell>
                              <TableCell className="text-right">{Math.round(user.average_score || 0)}%</TableCell>
                              <TableCell className="text-right font-bold">{user.total_points || 0}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-xl font-bold mb-2">No users found</h3>
                      <p className="text-muted-foreground mb-6">
                        {searchTerm ? "Try adjusting your search" : "No users have taken quizzes yet"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="quizzes">
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                {categories.length > 0 && (
                  <div className="w-full md:w-64">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="bg-black/30 border-white/10">
                        <div className="flex items-center">
                          <Filter className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Filter by category" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredQuizzes.length > 0 ? (
                  filteredQuizzes.map((quiz) => (
                    <motion.div key={quiz.quiz_id} variants={itemVariants}>
                      <Card
                        className={`glass-effect card-hover h-full cursor-pointer ${selectedQuiz === quiz.quiz_id.toString() ? "border-cyan-500/50 bg-cyan-900/10" : ""}`}
                        onClick={() => setSelectedQuiz(quiz.quiz_id.toString())}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            {quiz.category && (
                              <Badge variant="outline" className="mb-2">
                                {quiz.category.charAt(0).toUpperCase() + quiz.category.slice(1)}
                              </Badge>
                            )}
                            {quiz.difficulty && (
                              <Badge variant="outline" className="mb-2">
                                {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="line-clamp-1">{quiz.quiz_title}</CardTitle>
                          <CardDescription>
                            {quiz.attempts.length} {quiz.attempts.length === 1 ? "participant" : "participants"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {quiz.attempts.slice(0, 3).map((attempt, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {getRankIcon(index)}
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                      src={attempt.avatar_url || "/placeholder.svg?height=24&width=24"}
                                      alt={attempt.username}
                                    />
                                    <AvatarFallback className="text-xs bg-gradient-to-r from-cyan-500 to-purple-600">
                                      {attempt.username.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-medium truncate max-w-[120px]">
                                    {attempt.username}
                                    {attempt.user_id === currentUser.id && " (You)"}
                                  </span>
                                </div>
                                <span className="font-bold">{Math.round(attempt.percentage)}%</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-bold mb-2">No quizzes found</h3>
                    <p className="text-muted-foreground mb-6">
                      {searchTerm || categoryFilter !== "all"
                        ? "Try adjusting your search or filters"
                        : "No quizzes have been attempted yet"}
                    </p>
                    <Button asChild className="bg-gradient-to-r from-cyan-500 to-purple-600">
                      <Link href="/dashboard/discover">Discover Quizzes</Link>
                    </Button>
                  </div>
                )}
              </div>

              {selectedQuizData && (
                <Card className="glass-effect card-hover mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Trophy className="mr-2 h-5 w-5 text-amber-400" />
                      {selectedQuizData.quiz_title} - Leaderboard
                    </CardTitle>
                    <CardDescription>
                      {selectedQuizData.category &&
                        `Category: ${selectedQuizData.category.charAt(0).toUpperCase() + selectedQuizData.category.slice(1)}`}
                      {selectedQuizData.difficulty &&
                        ` • Difficulty: ${selectedQuizData.difficulty.charAt(0).toUpperCase() + selectedQuizData.difficulty.slice(1)}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border border-white/10 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-black/40">
                          <TableRow>
                            <TableHead className="w-16">Rank</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead className="text-right">Score</TableHead>
                            <TableHead className="text-right">Percentage</TableHead>
                            <TableHead className="text-right">Time Taken</TableHead>
                            <TableHead className="text-right">Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedQuizData.attempts.map((attempt, index) => (
                            <TableRow
                              key={index}
                              className={`hover:bg-white/5 ${attempt.user_id === currentUser.id ? "bg-cyan-900/20 border-l-2 border-l-cyan-500" : ""}`}
                            >
                              <TableCell className="font-medium">
                                <div className="flex justify-center items-center">{getRankIcon(index)}</div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage
                                      src={attempt.avatar_url || "/placeholder.svg?height=32&width=32"}
                                      alt={attempt.username}
                                    />
                                    <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-600">
                                      {attempt.username.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{attempt.username}</span>
                                  {attempt.user_id === currentUser.id && (
                                    <Badge variant="outline" className="ml-2">
                                      You
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {attempt.score}/{attempt.max_score}
                              </TableCell>
                              <TableCell className="text-right font-bold">{Math.round(attempt.percentage)}%</TableCell>
                              <TableCell className="text-right">
                                {attempt.time_taken
                                  ? `${Math.floor(attempt.time_taken / 60)}m ${attempt.time_taken % 60}s`
                                  : "N/A"}
                              </TableCell>
                              <TableCell className="text-right">
                                {new Date(attempt.completed_at).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
