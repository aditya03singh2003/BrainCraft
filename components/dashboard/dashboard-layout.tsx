"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Activity,
  BarChart3,
  Brain,
  FileQuestion,
  Home,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Sparkles,
  User,
} from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
      router.push("/auth")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Animation variants
  const sidebarItemVariants = {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    hover: { x: 5, transition: { duration: 0.2 } },
  }

  const iconVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.2, rotate: 5, transition: { duration: 0.3, type: "spring" } },
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/quizzes", label: "My Quizzes", icon: FileQuestion },
    { href: "/dashboard/create", label: "Create Quiz", icon: Plus },
    { href: "/dashboard/discover", label: "Discover", icon: Sparkles },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/profile", label: "Profile", icon: User },
  ]

  if (!isMounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      {/* Mobile Header */}
      <header
        className={`sticky top-0 z-50 w-full border-b border-white/10 ${isScrolled ? "bg-black/80 backdrop-blur-md" : "bg-transparent"} transition-all duration-300`}
      >
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-black/90 backdrop-blur-xl border-white/10">
                <div className="flex flex-col h-full">
                  <div className="py-4">
                    <Link href="/dashboard" className="flex items-center gap-2 px-2">
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 p-1"
                      >
                        <Brain className="h-6 w-6 text-white" />
                      </motion.div>
                      <span className="font-bold text-xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                        BrainCraft
                      </span>
                    </Link>
                  </div>
                  <nav className="space-y-2 py-4">
                    {navItems.map((item) => {
                      const isActive = pathname === item.href
                      const Icon = item.icon

                      return (
                        <motion.div
                          key={item.href}
                          variants={sidebarItemVariants}
                          initial="initial"
                          animate="animate"
                          whileHover="hover"
                        >
                          <Link
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                              isActive
                                ? "bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-white"
                                : "text-muted-foreground hover:text-white"
                            }`}
                          >
                            <motion.div
                              variants={iconVariants}
                              whileHover="hover"
                              className={`${isActive ? "text-cyan-400" : ""}`}
                            >
                              <Icon className="h-5 w-5" />
                            </motion.div>
                            {item.label}
                          </Link>
                        </motion.div>
                      )
                    })}
                  </nav>
                  <div className="mt-auto pb-4">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-muted-foreground hover:text-white"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 p-1"
              >
                <Brain className="h-5 w-5 text-white" />
              </motion.div>
              <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                BrainCraft
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-full max-w-[200px] md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search..."
                className="w-full rounded-full bg-black/20 border border-white/10 pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8 border border-white/20">
                    <AvatarImage src="/placeholder-user.jpg" alt="User" />
                    <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white">
                      U
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-black/90 backdrop-blur-xl border-white/10">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/analytics" className="cursor-pointer">
                    <Activity className="mr-2 h-4 w-4" />
                    Analytics
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar and Main Content */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex h-screen w-64 flex-col fixed inset-y-0 z-10">
          <div className="flex flex-col h-full overflow-y-auto bg-black/40 backdrop-blur-xl border-r border-white/10">
            <div className="flex h-16 items-center gap-2 px-4 border-b border-white/10">
              <Link href="/dashboard" className="flex items-center gap-2">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 p-1"
                >
                  <Brain className="h-6 w-6 text-white" />
                </motion.div>
                <span className="font-bold text-xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  BrainCraft
                </span>
              </Link>
            </div>
            <nav className="flex-1 space-y-2 p-4">
              <AnimatePresence>
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon

                  return (
                    <motion.div
                      key={item.href}
                      variants={sidebarItemVariants}
                      initial="initial"
                      animate="animate"
                      whileHover="hover"
                      transition={{ delay: navItems.indexOf(item) * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-white"
                            : "text-muted-foreground hover:text-white"
                        }`}
                      >
                        <motion.div
                          variants={iconVariants}
                          whileHover="hover"
                          className={`${isActive ? "text-cyan-400" : ""}`}
                        >
                          <Icon className="h-5 w-5" />
                        </motion.div>
                        {item.label}
                      </Link>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </nav>
            <div className="p-4 border-t border-white/10">
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-white"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-screen"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
