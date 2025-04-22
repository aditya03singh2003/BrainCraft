"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Check, Key, Loader2, LogOut, Mail, User, UserCircle } from "lucide-react"
import DashboardLayout from "@/components/dashboard/dashboard-layout"

interface ProfileViewProps {
  user: any
  stats: any
}

export default function ProfileView({ user, stats }: ProfileViewProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [profileData, setProfileData] = useState({
    username: user.username,
    email: user.email,
    avatar_url: user.avatar_url || "",
  })

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData({
      ...profileData,
      [name]: value,
    })
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData({
      ...passwordData,
      [name]: value,
    })
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile")
      }

      setSuccess("Profile updated successfully")
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError("New passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password")
      }

      setSuccess("Password updated successfully")
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

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
      <div className="p-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-gradient">Your Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-1 space-y-6"
          >
            <motion.div variants={itemVariants}>
              <Card className="glass-effect card-hover">
                <CardContent className="pt-6 flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4 border-2 border-primary">
                    <AvatarImage src={user.avatar_url || "/placeholder.svg?height=96&width=96"} alt={user.username} />
                    <AvatarFallback className="text-2xl bg-gradient-to-r from-cyan-500 to-purple-600">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{user.username}</h2>
                  <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
                  <Badge variant="outline" className="mb-4">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>

                  <div className="w-full space-y-3 mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Member since</span>
                      <span>{new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Quizzes created</span>
                      <span>{stats.quizzes_created || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Quizzes taken</span>
                      <span>{stats.quizzes_taken || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total points</span>
                      <span>{stats.total_points || 0}</span>
                    </div>
                  </div>

                  <Button variant="destructive" className="w-full mt-6" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-2 space-y-6"
          >
            <motion.div variants={itemVariants}>
              <Card className="glass-effect card-hover">
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Update your profile information and password</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger
                        value="profile"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-600/20"
                      >
                        <UserCircle className="mr-2 h-4 w-4" />
                        Profile
                      </TabsTrigger>
                      <TabsTrigger
                        value="password"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-600/20"
                      >
                        <Key className="mr-2 h-4 w-4" />
                        Password
                      </TabsTrigger>
                    </TabsList>

                    {error && (
                      <Alert variant="destructive" className="mb-6 border-red-500/50 bg-red-900/20">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert className="mb-6 border-green-500/50 bg-green-900/20 text-green-400">
                        <Check className="h-4 w-4" />
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}

                    <TabsContent value="profile">
                      <form onSubmit={handleProfileSubmit} className="space-y-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="username">
                              <User className="inline-block mr-2 h-4 w-4" />
                              Username
                            </Label>
                            <Input
                              id="username"
                              name="username"
                              value={profileData.username}
                              onChange={handleProfileChange}
                              className="bg-black/30 border-white/10"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">
                              <Mail className="inline-block mr-2 h-4 w-4" />
                              Email
                            </Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={profileData.email}
                              onChange={handleProfileChange}
                              className="bg-black/30 border-white/10"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="avatar_url">Avatar URL</Label>
                            <Input
                              id="avatar_url"
                              name="avatar_url"
                              value={profileData.avatar_url}
                              onChange={handleProfileChange}
                              placeholder="https://example.com/avatar.jpg"
                              className="bg-black/30 border-white/10"
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="password">
                      <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="current_password">Current Password</Label>
                            <Input
                              id="current_password"
                              name="current_password"
                              type="password"
                              value={passwordData.current_password}
                              onChange={handlePasswordChange}
                              className="bg-black/30 border-white/10"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="new_password">New Password</Label>
                            <Input
                              id="new_password"
                              name="new_password"
                              type="password"
                              value={passwordData.new_password}
                              onChange={handlePasswordChange}
                              className="bg-black/30 border-white/10"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirm_password">Confirm New Password</Label>
                            <Input
                              id="confirm_password"
                              name="confirm_password"
                              type="password"
                              value={passwordData.confirm_password}
                              onChange={handlePasswordChange}
                              className="bg-black/30 border-white/10"
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Key className="mr-2 h-4 w-4" />
                              Update Password
                            </>
                          )}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}
