"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Brain, ChevronRight, FileQuestion, Rocket, Sparkles, Users } from "lucide-react"

export default function HomeContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 p-1">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            BrainCraft
          </span>
        </div>
        <div className="flex gap-4">
          <Button asChild variant="outline" className="animated-border">
            <Link href="/auth">Login</Link>
          </Button>
          <Button
            asChild
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
          >
            <Link href="/auth?tab=register">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            Create, Share, and Master Knowledge with Interactive Quizzes
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-300 mb-8"
          >
            BrainCraft is the ultimate platform for creating engaging quizzes, testing your knowledge, and tracking your
            progress.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
            >
              <Link href="/auth?tab=register">
                Get Started Free
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="animated-border">
              <Link href="/auth">Login to Your Account</Link>
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-effect card-hover p-6 rounded-lg border border-white/10"
          >
            <div className="rounded-full bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 p-3 w-fit mb-4">
              <FileQuestion className="h-8 w-8 text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Create Engaging Quizzes</h2>
            <p className="text-gray-300">
              Design custom quizzes with multiple question types, images, and detailed explanations.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-effect card-hover p-6 rounded-lg border border-white/10"
          >
            <div className="rounded-full bg-gradient-to-r from-purple-500/20 to-purple-500/10 p-3 w-fit mb-4">
              <Users className="h-8 w-8 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Share with Others</h2>
            <p className="text-gray-300">
              Publish your quizzes for friends, students, or colleagues to test their knowledge.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="glass-effect card-hover p-6 rounded-lg border border-white/10"
          >
            <div className="rounded-full bg-gradient-to-r from-pink-500/20 to-pink-500/10 p-3 w-fit mb-4">
              <Rocket className="h-8 w-8 text-pink-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Track Your Progress</h2>
            <p className="text-gray-300">
              Analyze performance with detailed analytics and insights to improve your knowledge.
            </p>
          </motion.div>
        </div>

        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 p-3 mb-6"
          >
            <Sparkles className="h-8 w-8 text-cyan-400" />
          </motion.div>
          <h2 className="text-3xl font-bold mb-4">Ready to boost your knowledge?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are creating, sharing, and mastering knowledge with BrainCraft.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
          >
            <Link href="/auth?tab=register">
              Get Started Today
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 p-1">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              BrainCraft
            </span>
          </div>
          <div className="text-sm text-gray-400">© {new Date().getFullYear()} BrainCraft. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
