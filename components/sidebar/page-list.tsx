"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"

interface Page {
  id: string
  title: string
  description: string
  embedUrl?: string
  type: "system" | "custom" | "powerbi"
  createdAt: string
  isEditable?: boolean
}

interface PageListProps {
  pages: Page[]
  userRole: "admin" | "developer"
  onPageClick: (page: Page) => void
  onAddPage: () => void
  onSaveToDatabase: (action: string, data: any) => void
  currentPath: string
}

export default function PageList({
  pages,
  userRole,
  onPageClick,
  onAddPage,
  onSaveToDatabase,
  currentPath,
}: PageListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<"all" | "system" | "custom" | "powerbi">("all")

  const filteredPages = pages.filter((page) => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || page.type === selectedType
    return matchesSearch && matchesType
  })

  const getPageIcon = (type: string) => {
    switch (type) {
      case "system":
        return "⚙️"
      case "powerbi":
        return "📊"
      case "custom":
        return "📄"
      default:
        return "📄"
    }
  }

  const getPageStatus = (page: Page) => {
    const layouts = JSON.parse(localStorage.getItem("pageLayouts") || "{}")
    return layouts[page.id] ? "Modified" : "Default"
  }

  const isCurrentPage = (page: Page) => {
    if (page.type === "system") {
      return currentPath === `/${page.id}`
    }
    return currentPath === `/dashboard/${page.id}`
  }

  const handleDeletePage = (page: Page, e: React.MouseEvent) => {
    e.stopPropagation()

    if (page.type === "system" || page.type === "powerbi") {
      alert("Cannot delete system or built-in pages")
      return
    }

    if (confirm(`Delete "${page.title}"? This action cannot be undone.`)) {
      // Remove from localStorage
      const existingPages = JSON.parse(localStorage.getItem("adminPages") || "[]")
      const updatedPages = existingPages.filter((p: any) => p.id !== page.id)
      localStorage.setItem("adminPages", JSON.stringify(updatedPages))

      // Remove layout data
      const layouts = JSON.parse(localStorage.getItem("pageLayouts") || "{}")
      delete layouts[page.id]
      localStorage.setItem("pageLayouts", JSON.stringify(layouts))

      // Auto-save
      onSaveToDatabase("page_deleted", { pageId: page.id, title: page.title })

      // Reload page
      window.location.reload()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="p-4 space-y-4"
    >
      {/* Search and Filter */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Search pages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 text-sm"
        />

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as any)}
          className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white text-sm"
        >
          <option value="all">All Pages</option>
          {userRole === "developer" && <option value="system">System Pages</option>}
          <option value="powerbi">Dashboard Pages</option>
          <option value="custom">Custom Pages</option>
        </select>
      </div>

      {/* Add Page Button */}
      {userRole === "developer" && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddPage}
          className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <span>➕</span>
          <span>Add New Page</span>
        </motion.button>
      )}

      {/* Page List */}
      <div className="space-y-2">
        {filteredPages.map((page, index) => (
          <motion.div
            key={page.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => onPageClick(page)}
            className={`p-3 rounded-lg border transition-all duration-300 cursor-pointer group ${
              isCurrentPage(page)
                ? "bg-cyan-400/20 border-cyan-400 shadow-lg shadow-cyan-400/20"
                : "bg-gray-800/30 border-gray-700 hover:bg-gray-700/50 hover:border-gray-600"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-lg">{getPageIcon(page.type)}</span>
                  <h3 className="font-semibold text-white text-sm truncate">{page.title}</h3>
                  {page.isEditable && userRole === "developer" && (
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Editable</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-2 line-clamp-2">{page.description}</p>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      page.type === "system"
                        ? "bg-blue-500/20 text-blue-400"
                        : page.type === "powerbi"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-purple-500/20 text-purple-400"
                    }`}
                  >
                    {page.type}
                  </span>
                  {userRole === "developer" && (
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        getPageStatus(page) === "Modified"
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {getPageStatus(page)}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {page.isEditable && userRole === "developer" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onPageClick(page)
                    }}
                    className="p-1 hover:bg-cyan-400/20 rounded text-cyan-400 hover:text-cyan-300 transition-colors"
                    title="Edit Page"
                  >
                    ✏️
                  </button>
                )}
                {page.type === "custom" && userRole === "developer" && (
                  <button
                    onClick={(e) => handleDeletePage(page, e)}
                    className="p-1 hover:bg-red-400/20 rounded text-red-400 hover:text-red-300 transition-colors"
                    title="Delete Page"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredPages.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-gray-400 text-sm">No pages found</p>
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="text-cyan-400 text-sm hover:underline mt-2">
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Page Statistics */}
      <div className="mt-6 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
        <h4 className="text-sm font-semibold text-white mb-2">Page Statistics</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-gray-400">
            Total: <span className="text-white font-medium">{pages.length}</span>
          </div>
          <div className="text-gray-400">
            Custom: <span className="text-white font-medium">{pages.filter((p) => p.type === "custom").length}</span>
          </div>
          {userRole === "developer" && (
            <>
              <div className="text-gray-400">
                System:{" "}
                <span className="text-white font-medium">{pages.filter((p) => p.type === "system").length}</span>
              </div>
              <div className="text-gray-400">
                Modified:{" "}
                <span className="text-white font-medium">
                  {pages.filter((p) => getPageStatus(p) === "Modified").length}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
