"use client"

import type React from "react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"
import AnimatedBackground from "./animated-background"
import DeveloperToolbar from "./developer/developer-toolbar"
import AdminDeveloperSidebar from "./sidebar/admin-developer-sidebar"
import VisualPageEditor from "./developer/visual-page-editor"

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
}

interface Page {
  id: string
  title: string
  description: string
  embedUrl: string
  createdAt: string
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [userPages, setUserPages] = useState<Page[]>([])
  const [userRole, setUserRole] = useState<string>("")
  const [isDeveloperMode, setIsDeveloperMode] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; element: HTMLElement } | null>(null)
  const [sidebarVisible, setSidebarVisible] = useState(false)

  const saveToDatabase = (action: string, data: any) => {
    const timestamp = new Date().toISOString()
    const saveLog = JSON.parse(localStorage.getItem("autoSaveLog") || "[]")
    saveLog.push({
      timestamp,
      action,
      data,
      user: localStorage.getItem("username"),
      role: userRole,
    })
    localStorage.setItem("autoSaveLog", JSON.stringify(saveLog))
    localStorage.setItem("lastAutoSave", timestamp)
  }

  useEffect(() => {
    const role = localStorage.getItem("userRole") || ""
    const userId = localStorage.getItem("userId") || ""
    const isDev = new URLSearchParams(window.location.search).get("dev") === "true"

    setUserRole(role)
    setIsDeveloperMode(role === "developer" && isDev)

    if (role === "viewer" && userId) {
      try {
        const users = JSON.parse(localStorage.getItem("adminUsers") || "[]")
        const user = users.find((u: any) => u.id === userId)

        if (user && user.assignedPages) {
          const allPages = JSON.parse(localStorage.getItem("adminPages") || "[]")
          const assignedPages = allPages.filter((page: Page) => user.assignedPages.includes(page.id))
          setUserPages(assignedPages)
        }
      } catch (error) {
        console.error("Error loading user pages:", error)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("username")
    localStorage.removeItem("userId")
    router.push("/login")
  }

  const navigateToAdmin = () => {
    router.push("/admin")
  }

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode)
    document.body.classList.toggle("edit-mode", !isEditMode)
  }

  const handleAddElement = (type: "button" | "card" | "shape") => {
    console.log(`Adding ${type} element`)
    // Implementation for adding elements
  }

  const handleSaveLayout = () => {
    console.log("Saving layout...")
    localStorage.setItem("lastLayoutUpdate", new Date().toISOString())
    alert("Layout saved successfully!")
  }

  const handleUndo = () => {
    console.log("Undo action")
  }

  const handleRedo = () => {
    console.log("Redo action")
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      <div className="relative z-10">
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="glass-morphism border-b border-gray-700/50 p-4"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-8 relative">
                <Image src="/images/jne-main-logo.png" alt="JNE Express Logo" fill className="object-contain" />
              </div>
              <h1 className="text-2xl font-bold text-white">{title}</h1>
            </div>

            <div className="flex items-center space-x-4">
              {userRole === "admin" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={navigateToAdmin}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Admin Panel
                </motion.button>
              )}

              {(userRole === "admin" || userRole === "developer") && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSidebarVisible(!sidebarVisible)}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  {sidebarVisible ? "Hide Panel" : "Show Panel"}
                </motion.button>
              )}

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

        <main className="max-w-7xl mx-auto p-6">{children}</main>

        <motion.nav
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="fixed bottom-0 left-0 right-0 glass-morphism border-t border-gray-700/50 p-4"
        >
          <div className="max-w-7xl mx-auto flex justify-center space-x-4 overflow-x-auto">
            {userRole === "viewer" && userPages.length > 0 ? (
              userPages.map((page) => (
                <motion.button
                  key={page.id}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => router.push(`/dashboard/${page.id}`)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap ${
                    pathname === `/dashboard/${page.id}`
                      ? "bg-gradient-to-r from-cyan-400 to-purple-500 shadow-lg"
                      : "bg-gray-800/50 hover:bg-gray-700/50"
                  }`}
                >
                  {page.title}
                </motion.button>
              ))
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => router.push("/dashboard/performance")}
                  className={`px-6 py-3 font-semibold transition-all duration-300 ${
                    pathname === "/dashboard/performance"
                      ? "shadow-lg"
                      : ""
                  }`}
                  style={{
                    background: pathname === "/dashboard/performance" 
                      ? "linear-gradient(135deg, #0f2027 0%, rgba(255, 255, 255, 0.15) 100%)"
                      : "linear-gradient(135deg, #374151 0%, rgba(255, 255, 255, 0.05) 100%)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.2)"
                  }}
                >
                  Performance Dashboard
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => router.push("/dashboard/shipment")}
                  className={`px-6 py-3 font-semibold transition-all duration-300 ${
                    pathname === "/dashboard/shipment"
                      ? "shadow-lg"
                      : ""
                  }`}
                  style={{
                    background: pathname === "/dashboard/shipment" 
                      ? "linear-gradient(135deg, #0f2027 0%, rgba(255, 255, 255, 0.15) 100%)"
                      : "linear-gradient(135deg, #374151 0%, rgba(255, 255, 255, 0.05) 100%)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.2)"
                  }}
                >
                  Shipment Analysis
                </motion.button>
              </>
            )}
          </div>
        </motion.nav>
        {isDeveloperMode && (
          <DeveloperToolbar
            isEditMode={isEditMode}
            onToggleEditMode={handleToggleEditMode}
            onAddElement={handleAddElement}
            onSaveLayout={handleSaveLayout}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={false}
            canRedo={false}
          />
        )}
        {/* Admin/Developer Sidebar */}
        {(userRole === "admin" || userRole === "developer") && (
          <AdminDeveloperSidebar
            userRole={userRole as "admin" | "developer"}
            isVisible={sidebarVisible}
            onToggle={() => setSidebarVisible(!sidebarVisible)}
          />
        )}

        {/* Visual Page Editor for Developers */}
        {userRole === "developer" && isDeveloperMode && (
          <VisualPageEditor
            pageId={pathname.split("/").pop() || ""}
            isEditMode={isEditMode}
            onSaveToDatabase={saveToDatabase}
          />
        )}
      </div>
    </div>
  )
}