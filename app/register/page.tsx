"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"
import AnimatedBackground from "../../components/animated-background"
import Toast from "../../components/toast"

interface PendingRegistration {
  id: string
  username: string
  phoneNumber: string
  password: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "error">("success")
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError("Username is required")
      return false
    }
    if (!formData.phoneNumber.trim()) {
      setError("Phone number is required")
      return false
    }
    if (formData.phoneNumber.length < 10) {
      setError("Phone number must be at least 10 digits")
      return false
    }
    if (!formData.password) {
      setError("Password is required")
      return false
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Check if username already exists
      const existingUsers = JSON.parse(localStorage.getItem("adminUsers") || "[]")
      const pendingRegistrations = JSON.parse(localStorage.getItem("pendingRegistrations") || "[]")

      const usernameExists =
        existingUsers.some((user: any) => user.name.toLowerCase() === formData.username.toLowerCase()) ||
        pendingRegistrations.some((reg: any) => reg.username.toLowerCase() === formData.username.toLowerCase())

      if (usernameExists) {
        setError("Username already exists")
        setIsLoading(false)
        return
      }

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Create pending registration
      const newRegistration: PendingRegistration = {
        id: Date.now().toString(),
        username: formData.username,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        status: "pending",
        createdAt: new Date().toISOString(),
      }

      // Save to pending registrations
      const updatedPendingRegistrations = [...pendingRegistrations, newRegistration]
      localStorage.setItem("pendingRegistrations", JSON.stringify(updatedPendingRegistrations))

      // Show success message
      setToastType("success")
      setToastMessage("Registration request submitted successfully! Please wait for admin approval.")
      setShowToast(true)

      // Reset form
      setFormData({
        username: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
      })

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err) {
      console.error("Registration error:", err)
      setError("An error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    router.push("/login")
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
        {/* Header */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-16 mx-auto mb-4 relative">
            <Image src="/images/jne-main-logo.png" alt="JNE Express Logo" fill className="object-contain" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">User Registration</h2>
          <p className="text-gray-400 text-sm">Create your account and wait for approval</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full modern-input"
              placeholder="Enter your username"
              required
            />
          </motion.div>

          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="w-full modern-input"
              placeholder="Enter your phone number"
              required
            />
          </motion.div>

          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full modern-input"
              placeholder="Enter your password"
              required
            />
          </motion.div>

          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
            <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full modern-input"
              placeholder="Confirm your password"
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
            className="space-y-3"
          >
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 font-bold text-white modern-gradient-button transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting Request...
                  </div>
                ) : (
                  "Submit Registration"
                )}
              </span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackToLogin}
              className="w-full py-3 font-semibold text-white transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #4b5563 0%, rgba(255, 255, 255, 0.1) 100%)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.2)"
              }}
            >
              Back to Login
            </motion.button>
          </motion.div>
        </form>
      </motion.div>

      {/* Toast Notification */}
      {showToast && (
        <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} duration={5000} />
      )}
    </div>
  )
}
