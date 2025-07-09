"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface Page {
  id: string
  title: string
  description: string
  embedUrl: string
  createdAt: string
}

interface DeveloperPageListProps {
  onEditPage: (pageId: string) => void
}

export default function DeveloperPageList({ onEditPage }: DeveloperPageListProps) {
  const [pages, setPages] = useState<Page[]>([])
  const [builtInPages] = useState([
    {
      id: "performance",
      title: "Performance Analytics",
      description: "Main dashboard with Power BI analytics",
      type: "Built-in",
    },
    {
      id: "shipment",
      title: "Shipment Analysis",
      description: "Shipment tracking and analytics",
      type: "Built-in",
    },
  ])

  useEffect(() => {
    loadPages()
  }, [])

  const loadPages = () => {
    const savedPages = JSON.parse(localStorage.getItem("adminPages") || "[]")
    setPages(savedPages)
  }

  const getLayoutStatus = (pageId: string) => {
    const layouts = JSON.parse(localStorage.getItem("pageLayouts") || "{}")
    return layouts[pageId] ? "Modified" : "Default"
  }

  const resetPageLayout = (pageId: string) => {
    if (confirm(`Reset ${pageId} page to default layout?`)) {
      const layouts = JSON.parse(localStorage.getItem("pageLayouts") || "{}")
      delete layouts[pageId]
      localStorage.setItem("pageLayouts", JSON.stringify(layouts))

      // Update last modified time
      localStorage.setItem("lastLayoutUpdate", new Date().toISOString())

      alert("Page layout reset to default!")
    }
  }

  const allPages = [
    ...builtInPages.map((page) => ({ ...page, createdAt: new Date().toISOString() })),
    ...pages.map((page) => ({ ...page, type: "Custom" })),
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h2 className="text-3xl font-bold text-white mb-2">Edit Pages</h2>
        <p className="text-gray-400">Select a page to enter developer edit mode</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allPages.map((page, index) => (
          <motion.div
            key={page.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="glass-morphism rounded-2xl p-6 hover:shadow-lg hover:shadow-cyan-400/20 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">{page.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{page.description}</p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    page.type === "Built-in" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"
                  }`}
                >
                  {page.type}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    getLayoutStatus(page.id) === "Modified"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {getLayoutStatus(page.id)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEditPage(page.id)}
                className="w-full py-2 px-4 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-cyan-400/30 transition-all duration-300"
              >
                🛠️ Enter Edit Mode
              </motion.button>

              {getLayoutStatus(page.id) === "Modified" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => resetPageLayout(page.id)}
                  className="w-full py-2 px-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg font-medium text-white hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
                >
                  🔄 Reset Layout
                </motion.button>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Page ID: {page.id}</span>
                <span>Created: {new Date(page.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {allPages.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-bold text-white mb-2">No Pages Available</h3>
          <p className="text-gray-400">Create pages in the admin panel to edit them here</p>
        </motion.div>
      )}
    </div>
  )
}
