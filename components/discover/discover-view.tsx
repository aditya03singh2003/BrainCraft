"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Flame, Search, Sparkles, Star, Users } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard/dashboard-layout"

interface DiscoverViewProps {
  popularQuizzes: any[]
  quizzesByCategory: any[]
  recentQuizzes: any[]
}

export default function DiscoverView({ popularQuizzes, quizzesByCategory, recentQuizzes }: DiscoverViewProps) {
  const [activeTab, setActiveTab] = useState("popular")
  const [searchTerm, setSearchTerm] = useState("")

  // Filter quizzes based on search
  const filteredPopularQuizzes = popularQuizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      quiz.creator_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredRecentQuizzes = recentQuizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      quiz.creator_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredCategories = quizzesByCategory
    .map((category) => ({
      ...category,
      quizzes: category.quizzes.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          quiz.creator_name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((category) => category.quizzes.length > 0)

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
          <h1 className="text-3xl font-bold text-gradient">Discover Quizzes</h1>
          <p className="text-muted-foreground">Explore and take quizzes created by the community</p>
        </motion.div>

        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-black/30 border-white/10"
          />
        </div>

        <Tabs defaultValue="popular" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 md:w-[400px] glass-effect">
            <TabsTrigger
              value="popular"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-600/20"
            >
              <Flame className="mr-2 h-4 w-4" />
              Popular
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-600/20"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger
              value="recent"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-600/20"
            >
              <Clock className="mr-2 h-4 w-4" />
              Recent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="popular">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredPopularQuizzes.length > 0 ? (
                filteredPopularQuizzes.map((quiz, index) => (
                  <motion.div key={quiz.id} variants={itemVariants}>
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
                        <CardTitle className="line-clamp-1">{quiz.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {quiz.description || "No description provided"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center text-sm">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage
                                src={quiz.creator_avatar || "/placeholder.svg?height=24&width=24"}
                                alt={quiz.creator_name}
                              />
                              <AvatarFallback className="text-xs bg-gradient-to-r from-cyan-500 to-purple-600">
                                {quiz.creator_name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>By {quiz.creator_name}</span>
                          </div>

                          <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                            <div className="flex items-center">
                              <Users className="mr-1 h-4 w-4" />
                              <span>{quiz.attempt_count || 0} attempts</span>
                            </div>
                            {quiz.average_score && (
                              <div className="flex items-center">
                                <Star className="mr-1 h-4 w-4 text-amber-400" />
                                <span>{Math.round(quiz.average_score)}% avg</span>
                              </div>
                            )}
                          </div>

                          {quiz.category && (
                            <Badge variant="outline" className="w-fit mt-2">
                              {quiz.category.charAt(0).toUpperCase() + quiz.category.slice(1)}
                            </Badge>
                          )}
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
                  <Flame className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-bold mb-2">No quizzes found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm ? "Try adjusting your search" : "No popular quizzes available yet"}
                  </p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="categories">
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-10">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category, categoryIndex) => (
                  <motion.div key={category.category} variants={itemVariants} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold capitalize">
                        {category.category.charAt(0).toUpperCase() + category.category.slice(1)}
                      </h2>
                      <Button asChild variant="outline" className="animated-border">
                        <Link href={`/dashboard/discover?category=${category.category}`}>View All</Link>
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.quizzes.map((quiz, quizIndex) => (
                        <motion.div
                          key={quiz.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: quizIndex * 0.1 + categoryIndex * 0.2 }}
                        >
                          <Card className="glass-effect card-hover h-full flex flex-col">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <Badge variant="outline" className="mb-2 capitalize">
                                  {category.category}
                                </Badge>
                                {quiz.difficulty && (
                                  <Badge variant="outline" className="mb-2 capitalize">
                                    {quiz.difficulty}
                                  </Badge>
                                )}
                              </div>
                              <CardTitle className="line-clamp-1">{quiz.title}</CardTitle>
                              <CardDescription className="line-clamp-2">
                                {quiz.description || "No description provided"}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                              <div className="flex items-center text-sm">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarImage
                                    src={quiz.creator_avatar || "/placeholder.svg?height=24&width=24"}
                                    alt={quiz.creator_name}
                                  />
                                  <AvatarFallback className="text-xs bg-gradient-to-r from-cyan-500 to-purple-600">
                                    {quiz.creator_name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span>By {quiz.creator_name}</span>
                              </div>
                            </CardContent>
                            <CardFooter className="pt-2">
                              <Button asChild className="w-full bg-gradient-to-r from-cyan-500 to-purple-600">
                                <Link href={`/dashboard/quizzes/${quiz.id}/take`}>Take Quiz</Link>
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-bold mb-2">No categories found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm ? "Try adjusting your search" : "No categorized quizzes available yet"}
                  </p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="recent">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredRecentQuizzes.length > 0 ? (
                filteredRecentQuizzes.map((quiz, index) => (
                  <motion.div key={quiz.id} variants={itemVariants}>
                    <Card className="glass-effect card-hover h-full flex flex-col">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <Badge className="mb-2 bg-gradient-to-r from-cyan-500 to-blue-600">New</Badge>
                          <div className="text-xs text-muted-foreground">
                            {new Date(quiz.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <CardTitle className="line-clamp-1">{quiz.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {quiz.description || "No description provided"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center text-sm">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage
                                src={quiz.creator_avatar || "/placeholder.svg?height=24&width=24"}
                                alt={quiz.creator_name}
                              />
                              <AvatarFallback className="text-xs bg-gradient-to-r from-cyan-500 to-purple-600">
                                {quiz.creator_name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>By {quiz.creator_name}</span>
                          </div>

                          {quiz.category && (
                            <Badge variant="outline" className="w-fit mt-2">
                              {quiz.category.charAt(0).toUpperCase() + quiz.category.slice(1)}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2">
                        <Button asChild className="w-full bg-gradient-to-r from-cyan-500 to-blue-600">
                          <Link href={`/dashboard/quizzes/${quiz.id}/take`}>Take Quiz</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-bold mb-2">No recent quizzes found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm ? "Try adjusting your search" : "No recently added quizzes available yet"}
                  </p>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
