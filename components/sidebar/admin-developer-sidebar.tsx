"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, usePathname } from "next/navigation"
import PageList from "./page-list"
import UserManagement from "./user-management"
import RegistrationRequests from "./registration-requests"

interface Page {
  id: string
  title: string
  description: string
  embedUrl?: string
  type: "system" | "custom" | "powerbi"
  createdAt: string
  isEditable?: boolean
}

interface SidebarProps {
  userRole: "admin" | "developer"
  isVisible: boolean
  onToggle: () => void
}

export default function AdminDeveloperSidebar({ userRole, isVisible, onToggle }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<"pages" | "users" | "requests">("pages")
  const [pages, setPages] = useState<Page[]>([])
  const [pendingRequests, setPendingRequests] = useState(0)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    loadPages()
    loadPendingRequests()
  }, [])

  const loadPages = () => {
    // System pages (always available for developers)
    const systemPages: Page[] = [
      {
        id: "login",
        title: "Login Page",
        description: "User authentication page",
        type: "system",
        createdAt: new Date().toISOString(),
        isEditable: userRole === "developer",
      },
      {
        id: "register",
        title: "Register Page",
        description: "User registration page",
        type: "system",
        createdAt: new Date().toISOString(),
        isEditable: userRole === "developer",
      },
      {
        id: "forgot-password",
        title: "Forgot Password",
        description: "Password recovery page",
        type: "system",
        createdAt: new Date().toISOString(),
        isEditable: userRole === "developer",
      },
      {
        id: "admin",
        title: "Admin Dashboard",
        description: "Administrative control panel",
        type: "system",
        createdAt: new Date().toISOString(),
        isEditable: userRole === "developer",
      },
      {
        id: "developer",
        title: "Developer Console",
        description: "Development tools and controls",
        type: "system",
        createdAt: new Date().toISOString(),
        isEditable: userRole === "developer",
      },
    ]

    // Built-in dashboard pages
    const builtInPages: Page[] = [
      {
        id: "performance",
        title: "Performance Analytics",
        description: "Main dashboard with Power BI analytics",
        type: "powerbi",
        embedUrl:
          "https://app.powerbi.com/reportEmbed?reportId=21a0a736-2f97-48bd-af4d-9f6897139ff7&autoAuth=true&ctid=827ea450-686d-49d6-8fd8-801e6e5da931",
        createdAt: new Date().toISOString(),
        isEditable: true,
      },
      {
        id: "shipment",
        title: "Shipment Analysis",
        description: "Shipment tracking and analytics",
        type: "powerbi",
        createdAt: new Date().toISOString(),
        isEditable: true,
      },
    ]

    // Custom pages from admin
    const customPages: Page[] = JSON.parse(localStorage.getItem("adminPages") || "[]").map((page: any) => ({
      ...page,
      type: "custom",
      isEditable: true,
    }))

    let allPages: Page[] = []

    if (userRole === "developer") {
      // Developers see everything
      allPages = [...systemPages, ...builtInPages, ...customPages]
    } else if (userRole === "admin") {
      // Admins see dashboard and custom pages
      allPages = [...builtInPages, ...customPages]
    }

    setPages(allPages)
  }

  const loadPendingRequests = () => {
    const pending = JSON.parse(localStorage.getItem("pendingRegistrations") || "[]")
    setPendingRequests(pending.filter((req: any) => req.status === "pending").length)
  }

  const handlePageClick = (page: Page) => {
    let url = ""

    switch (page.type) {
      case "system":
        url = `/${page.id}`
        break
      case "powerbi":
      case "custom":
        url = `/dashboard/${page.id}`
        if (userRole === "developer") {
          url += "?dev=true"
        }
        break
    }

    if (url) {
      router.push(url)
    }
  }

  const handleAddPage = () => {
    const title = prompt("Enter page title:")
    if (!title) return

    const description = prompt("Enter page description:")
    if (!description) return

    const newPage: Page = {
      id: Date.now().toString(),
      title,
      description,
      embedUrl: "",
      type: "custom",
      createdAt: new Date().toISOString(),
      isEditable: true,
    }

    // Save to localStorage
    const existingPages = JSON.parse(localStorage.getItem("adminPages") || "[]")
    const updatedPages = [...existingPages, newPage]
    localStorage.setItem("adminPages", JSON.stringify(updatedPages))

    // Auto-save notification
    saveToDatabase("page_created", { page: newPage })

    // Reload pages
    loadPages()

    // Navigate to new page
    router.push(`/dashboard/${newPage.id}${userRole === "developer" ? "?dev=true" : ""}`)
  }

  const saveToDatabase = (action: string, data: any) => {
    // Simulate real-time database save
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

    // Show auto-save indicator
    const indicator = document.getElementById("auto-save-indicator")
    if (indicator) {
      indicator.textContent = "✅ Auto-saved"
      indicator.className = "text-green-400 text-xs"
      setTimeout(() => {
        indicator.textContent = "💾 Auto-save enabled"
        indicator.className = "text-gray-400 text-xs"
      }, 2000)
    }
  }

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onToggle}
      />

      {/* Sidebar */}
      <motion.div
        initial={{ x: -400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -400, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed left-0 top-0 h-full w-96 glass-morphism border-r border-gray-700/50 z-50 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                {userRole === "developer" ? "🛠️ Developer Panel" : "👑 Admin Panel"}
              </h2>
              <p className="text-sm text-gray-400">
                {userRole === "developer" ? "Full system access & editing" : "User & page management"}
              </p>
            </div>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Auto-save indicator */}
          <div className="flex items-center justify-between">
            <div id="auto-save-indicator" className="text-gray-400 text-xs">
              💾 Auto-save enabled
            </div>
            <div className="text-xs text-gray-500">
              {userRole === "developer" ? "Visual Editor Active" : "Management Mode"}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700/50">
          <button
            onClick={() => setActiveTab("pages")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "pages"
                ? "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/10"
                : "text-gray-400 hover:text-white"
            }`}
          >
            📄 Pages ({pages.length})
          </button>
          {userRole === "admin" && (
            <>
              <button
                onClick={() => setActiveTab("users")}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === "users"
                    ? "text-purple-400 border-b-2 border-purple-400 bg-purple-400/10"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                👥 Users
              </button>
              <button
                onClick={() => setActiveTab("requests")}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${
                  activeTab === "requests"
                    ? "text-orange-400 border-b-2 border-orange-400 bg-orange-400/10"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                📋 Requests
                {pendingRequests > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingRequests}
                  </span>
                )}
              </button>
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === "pages" && (
              <PageList
                key="pages"
                pages={pages}
                userRole={userRole}
                onPageClick={handlePageClick}
                onAddPage={handleAddPage}
                onSaveToDatabase={saveToDatabase}
                currentPath={pathname}
              />
            )}
            {activeTab === "users" && userRole === "admin" && (
              <UserManagement key="users" onSaveToDatabase={saveToDatabase} />
            )}
            {activeTab === "requests" && userRole === "admin" && (
              <RegistrationRequests
                key="requests"
                onSaveToDatabase={saveToDatabase}
                onRequestsUpdate={loadPendingRequests}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  )
}
