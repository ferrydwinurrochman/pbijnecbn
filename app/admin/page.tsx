"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"
import AnimatedBackground from "../../components/animated-background"
import ManagePages from "../../components/admin/manage-pages"
import ManageUsers from "../../components/admin/manage-users"
import AdminStats from "../../components/admin/admin-stats"
import EnhancedManagePages from "../../components/admin/enhanced-manage-pages"
import EnhancedAdminStats from "../../components/admin/enhanced-admin-stats"

type AdminSection = "dashboard" | "pages" | "enhanced-pages" | "users"

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard")
  const [darkMode, setDarkMode] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is admin
    const userRole = localStorage.getItem("userRole")
    if (userRole !== "admin") {
      router.push("/login")
      return
    }
    setIsAuthenticated(true)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("username")
    router.push("/login")
  }

  const navigateToPowerBI = () => {
    router.push("/dashboard/performance")
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <AnimatedBackground />

      <div className="relative z-10 min-h-screen">
        {/* Navigation Header */}
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="glass-morphism border-b border-gray-700/50 p-4"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-12 h-8 relative">
                <Image src="/images/jne-main-logo.png" alt="JNE Express Logo" fill className="object-contain" />
              </div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
              >
                {darkMode ? (
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </motion.button>

              {/* Power BI Dashboard Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={navigateToPowerBI}
                className="px-4 py-2 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg font-semibold hover:shadow-lg hover:shadow-neon-blue/50 transition-all duration-300"
              >
                Power BI Dashboard
              </motion.button>

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600/20 border border-red-500 rounded-lg hover:bg-red-600/30 transition-colors"
              >
                Logout
              </motion.button>
            </div>
          </div>
        </motion.header>

        <div className="max-w-7xl mx-auto p-6 flex gap-6">
          {/* Sidebar Navigation */}
          <motion.aside
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-64 glass-morphism rounded-2xl p-6 h-fit"
          >
            <nav className="space-y-2">
              {[
                { id: "dashboard", label: "Dashboard", icon: "🏠" },
                { id: "pages", label: "Manage Pages", icon: "📄" },
                { id: "enhanced-pages", label: "Enhanced Pages", icon: "🚀" },
                { id: "users", label: "Manage Users", icon: "👥" },
              ].map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveSection(item.id as AdminSection)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-300 flex items-center space-x-3 ${
                    activeSection === item.id
                      ? "bg-gradient-to-r from-neon-blue to-neon-purple text-white"
                      : "hover:bg-gray-800/50 text-gray-300"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              ))}
            </nav>
          </motion.aside>

          {/* Main Content */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex-1"
          >
            {activeSection === "dashboard" && <AdminStats />}
            {activeSection === "pages" && <ManagePages />}
            {activeSection === "enhanced-pages" && <EnhancedManagePages />}
            {activeSection === "users" && <ManageUsers />}
          </motion.main>
        </div>
      </div>
    </div>
  )
}
