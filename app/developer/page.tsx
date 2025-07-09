"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"
import AnimatedBackground from "../../components/animated-background"
import DeveloperPageList from "../../components/developer/developer-page-list"
import DeveloperStats from "../../components/developer/developer-stats"
import EnhancedAdminStats from "../../components/admin/enhanced-admin-stats"

type DeveloperSection = "dashboard" | "pages" | "enhanced" | "templates"

export default function DeveloperDashboard() {
  const [activeSection, setActiveSection] = useState<DeveloperSection>("dashboard")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userRole = localStorage.getItem("userRole")
    if (userRole !== "developer") {
      router.push("/login")
      return
    }
    setIsAuthenticated(true)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("username")
    localStorage.removeItem("userId")
    router.push("/login")
  }

  const navigateToPage = (pageId: string) => {
    router.push(`/dashboard/${pageId}?dev=true`)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
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
              <div>
                <h1 className="text-2xl font-bold text-white">Developer Console</h1>
                <p className="text-sm text-cyan-400">Full Design & Editing Control</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-bold">
                DEVELOPER MODE
              </div>

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
                { id: "pages", label: "Edit Pages", icon: "📄" },
                { id: "enhanced", label: "Enhanced Pages", icon: "🚀" },
                { id: "templates", label: "Templates", icon: "🎨" },
              ].map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveSection(item.id as DeveloperSection)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-300 flex items-center space-x-3 ${
                    activeSection === item.id
                      ? "bg-gradient-to-r from-cyan-400 to-purple-500 text-white"
                      : "hover:bg-gray-800/50 text-gray-300"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              ))}
            </nav>

            <div className="mt-8 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
              <h3 className="text-sm font-bold text-purple-400 mb-2">Developer Tools</h3>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• Drag & Drop Elements</li>
                <li>• Live Style Editor</li>
                <li>• Component Library</li>
                <li>• Layout Templates</li>
              </ul>
            </div>
          </motion.aside>

          {/* Main Content */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex-1"
          >
            {activeSection === "dashboard" && <DeveloperStats />}
            {activeSection === "pages" && <DeveloperPageList onEditPage={navigateToPage} />}
            {activeSection === "enhanced" && <EnhancedAdminStats />}
            {activeSection === "templates" && (
              <div className="glass-morphism rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4">🎨</div>
                <h2 className="text-2xl font-bold text-white mb-4">Page Templates</h2>
                <p className="text-gray-400">Template system coming soon...</p>
              </div>
            )}
          </motion.main>
        </div>
      </div>
    </div>
  )
}
