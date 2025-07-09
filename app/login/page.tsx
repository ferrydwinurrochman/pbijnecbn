"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"
import AnimatedBackground from "../../components/animated-background"

interface User {
  id: string
  name: string
  email: string
  password: string
  role: "admin" | "viewer" | "developer"
  assignedPages?: string[]
  createdAt: string
}

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const getRedirectPath = (user: User) => {
    if (user.role === "admin") {
      return "/admin"
    }
    if (user.role === "developer") {
      return "/developer"
    }

    if (user.assignedPages && user.assignedPages.length > 0) {
      return `/dashboard/${user.assignedPages[0]}`
    }

    return "/dashboard/performance"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      // Check for developer credentials first
      if (username === "developer" && password === "jnecbn18") {
        localStorage.setItem("userRole", "developer")
        localStorage.setItem("username", "developer")
        localStorage.setItem("userId", "developer")
        router.push("/developer")
        return
      }

      const users: User[] = JSON.parse(localStorage.getItem("adminUsers") || "[]")
      const user =
        users.find((u: User) => u.email === username && u.password === password) ||
        users.find((u: User) => u.name.toLowerCase() === username.toLowerCase() && u.password === password)

      if (user) {
        localStorage.setItem("userRole", user.role)
        localStorage.setItem("username", user.name)
        localStorage.setItem("userId", user.id)

        const redirectPath = getRedirectPath(user)
        router.push(redirectPath)
      } else if (username === "admin" && password === "admin") {
        localStorage.setItem("userRole", "admin")
        localStorage.setItem("username", "admin")
        localStorage.setItem("userId", "default-admin")
        router.push("/admin")
      } else {
        setError("Invalid username or password")
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An error occurred during login")
      setIsLoading(false)
    }
  }

  const handleRegister = () => {
    router.push("/register")
  }

  const handleForgotPassword = () => {
    router.push("/forgot-password")
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="glass-morphism p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10"
      >
        {/* JNE Express Main Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="text-center mb-8"
        >
          <div className="w-32 h-20 mx-auto mb-6 relative">
            <Image src="/images/jne-main-logo.png" alt="JNE Express Logo" fill className="object-contain" priority />
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
            <label className="block text-sm font-medium text-gray-300 mb-2">Username / Email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full modern-input"
              placeholder="Enter your username or email"
              required
            />
          </motion.div>

          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full modern-input"
              placeholder="Enter your password"
              required
            />
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm text-center bg-red-900/20 border border-red-500/50 rounded-lg p-3"
            >
              {error}
            </motion.div>
          )}

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="relative"
          >
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed modern-gradient-button"
            >
              <span className="relative z-10">
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Authenticating...
                  </div>
                ) : (
                  "Access Dashboard"
                )}
              </span>
            </motion.button>
          </motion.div>
        </form>

        {/* New Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-6 space-y-3"
        >
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRegister}
              className="flex-1 py-2 px-4 font-bold text-white modern-gradient-button transition-all duration-300"
            >
              Register
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleForgotPassword}
              className="flex-1 py-2 px-4 font-medium text-white transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #f59e0b 0%, rgba(255, 255, 255, 0.1) 100%)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.2)"
              }}
            >
              Forgot Password
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="mt-6 text-center"
        >
          <div className="w-48 h-12 mx-auto mb-2 relative">
            <Image src="/images/jne-tagline-logo.png" alt="JNE Express Tagline" fill className="object-contain" />
          </div>
          <p className="text-gray-400 text-xs">Secure access to your command center</p>
        </motion.div>
      </motion.div>
    </div>
  )
}
