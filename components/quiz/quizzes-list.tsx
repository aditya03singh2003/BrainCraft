"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Clock, Edit3, Eye, FileQuestion, Filter, Loader2, Plus, Search, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard/dashboard-layout"

interface QuizzesListProps {
  quizzes: any[]
}

export default function QuizzesList({ quizzes: initialQuizzes }: QuizzesListProps) {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState(initialQuizzes)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [quizToDelete, setQuizToDelete] = useState<any>(null)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleStatusFilter = (value: string) => {
    setFilterStatus(value)
  }

  const handleCategoryFilter = (value: string) => {
    setFilterCategory(value)
  }

  const handleDeleteClick = (quiz: any) => {
    setQuizToDelete(quiz)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!quizToDelete) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/quizzes/${quizToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete quiz")
      }

      // Remove the deleted quiz from the state
      setQuizzes(quizzes.filter((quiz) => quiz.id !== quizToDelete.id))
      setDeleteDialogOpen(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Filter quizzes based on search term and filters
  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "published" && quiz.is_published) ||
      (filterStatus === "draft" && !quiz.is_published)

    const matchesCategory = filterCategory === "all" || quiz.category === filterCategory

    return matchesSearch && matchesStatus && matchesCategory
  })

  // Get unique categories from quizzes
  const categories = Array.from(new Set(quizzes.map((quiz) => quiz.category))).filter(Boolean)

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
            <h1 className="text-3xl font-bold text-gradient">My Quizzes</h1>
            <p className="text-muted-foreground">Manage all your created quizzes</p>
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

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 bg-black/30 border-white/10"
            />
          </div>

          <div className="flex gap-2">
            <div className="w-40">
              <Select value={filterStatus} onValueChange={handleStatusFilter}>
                <SelectTrigger className="bg-black/30 border-white/10">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {categories.length > 0 && (
              <div className="w-40">
                <Select value={filterCategory} onValueChange={handleCategoryFilter}>
                  <SelectTrigger className="bg-black/30 border-white/10">
                    <div className="flex items-center">
                      <FileQuestion className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Category" />
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
        </div>

        {error && (
          <Alert variant="destructive" className="border-red-500/50 bg-red-900/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredQuizzes.length > 0 ? (
            filteredQuizzes.map((quiz) => (
              <motion.div key={quiz.id} variants={itemVariants}>
                <Card className="glass-effect card-hover h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge variant={quiz.is_published ? "default" : "outline"} className="mb-2">
                        {quiz.is_published ? "Published" : "Draft"}
                      </Badge>
                      <div className="flex space-x-1">
                        <motion.div variants={iconVariants} whileHover="hover">
                          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                            <Link href={`/dashboard/quizzes/${quiz.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </motion.div>
                        <motion.div variants={iconVariants} whileHover="hover">
                          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                            <Link href={`/dashboard/quizzes/${quiz.id}/edit`}>
                              <Edit3 className="h-4 w-4" />
                            </Link>
                          </Button>
                        </motion.div>
                        <motion.div variants={iconVariants} whileHover="hover">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(quiz)}
                            className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                    <CardTitle className="line-clamp-1">{quiz.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {quiz.description || "No description provided"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex flex-col gap-2">
                      {quiz.category && (
                        <Badge variant="outline" className="w-fit">
                          {quiz.category.charAt(0).toUpperCase() + quiz.category.slice(1)}
                        </Badge>
                      )}
                      {quiz.difficulty && (
                        <Badge variant="outline" className="w-fit">
                          {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                        </Badge>
                      )}
                      <div className="flex items-center text-sm text-muted-foreground mt-2">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>{new Date(quiz.created_at).toLocaleDateString()}</span>
                      </div>
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
              <h3 className="text-xl font-bold mb-2">No quizzes found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || filterStatus !== "all" || filterCategory !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first quiz to get started"}
              </p>
              <Button asChild className="bg-gradient-to-r from-cyan-500 to-purple-600">
                <Link href="/dashboard/create">Create New Quiz</Link>
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-black/90 backdrop-blur-xl border-white/10">
          <DialogHeader>
            <DialogTitle>Delete Quiz</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{quizToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
