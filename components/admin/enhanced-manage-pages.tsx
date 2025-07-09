"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MainPage } from "../../types/page-types"
import EnhancedPageCreator from "./enhanced-page-creator"
import Toast from "../toast"

export default function EnhancedManagePages() {
  const [pages, setPages] = useState<MainPage[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingPage, setEditingPage] = useState<MainPage | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "error">("success")

  const categories = [
    { id: "analytics", name: "Analytics", color: "#3B82F6", icon: "📊" },
    { id: "reports", name: "Reports", color: "#10B981", icon: "📈" },
    { id: "dashboards", name: "Dashboards", color: "#8B5CF6", icon: "📋" },
    { id: "operations", name: "Operations", color: "#F59E0B", icon: "⚙️" },
    { id: "finance", name: "Finance", color: "#EF4444", icon: "💰" }
  ]

  useEffect(() => {
    loadPages()
  }, [])

  const loadPages = () => {
    const savedPages = JSON.parse(localStorage.getItem("enhancedPages") || "[]")
    setPages(savedPages)
  }

  const savePages = (updatedPages: MainPage[]) => {
    localStorage.setItem("enhancedPages", JSON.stringify(updatedPages))
    setPages(updatedPages)
  }

  const handleSavePage = (page: MainPage) => {
    let updatedPages: MainPage[]
    
    if (editingPage) {
      updatedPages = pages.map(p => p.id === page.id ? page : p)
    } else {
      updatedPages = [...pages, page]
    }
    
    savePages(updatedPages)
    setShowForm(false)
    setEditingPage(null)
    
    setToastType("success")
    setToastMessage(editingPage ? "Page updated successfully!" : "Page created successfully!")
    setShowToast(true)
  }

  const handleEdit = (page: MainPage) => {
    setEditingPage(page)
    setShowForm(true)
  }

  const handleDelete = (pageId: string) => {
    if (confirm("Are you sure you want to delete this page and all its subpages?")) {
      const updatedPages = pages.filter(page => page.id !== pageId)
      savePages(updatedPages)
      
      setToastType("success")
      setToastMessage("Page deleted successfully!")
      setShowToast(true)
    }
  }

  const handleDuplicate = (page: MainPage) => {
    const duplicatedPage: MainPage = {
      ...page,
      id: Date.now().toString(),
      name: `${page.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subPages: page.subPages.map(subPage => ({
        ...subPage,
        id: `${Date.now()}-${Math.random()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
    }
    
    savePages([...pages, duplicatedPage])
    
    setToastType("success")
    setToastMessage("Page duplicated successfully!")
    setShowToast(true)
  }

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "" || page.classification === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || { name: "Uncategorized", color: "#6B7280", icon: "📄" }
  }

  if (showForm) {
    return (
      <EnhancedPageCreator
        onSave={handleSavePage}
        editingPage={editingPage}
        onCancel={() => {
          setShowForm(false)
          setEditingPage(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-3xl font-bold text-white mb-2">Enhanced Page Management</h2>
          <p className="text-gray-400">Manage main pages with Power BI and Spreadsheet subpages</p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg font-semibold hover:shadow-lg hover:shadow-neon-blue/50 transition-all duration-300"
        >
          Create New Page
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
          />
        </div>
        
        <div className="md:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-morphism rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{pages.length}</div>
          <div className="text-sm text-gray-400">Total Pages</div>
        </div>
        <div className="glass-morphism rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{pages.length * 2}</div>
          <div className="text-sm text-gray-400">Total SubPages</div>
        </div>
        <div className="glass-morphism rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{pages.filter(p => p.classification).length}</div>
          <div className="text-sm text-gray-400">Categorized</div>
        </div>
        <div className="glass-morphism rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{Math.max(0, 15 - pages.length)}</div>
          <div className="text-sm text-gray-400">Remaining Slots</div>
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredPages.map((page, index) => {
            const categoryInfo = getCategoryInfo(page.classification)
            
            return (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="glass-morphism rounded-2xl p-6 hover:shadow-lg hover:shadow-neon-blue/20 transition-all duration-300"
              >
                {/* Page Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{page.name}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{page.description}</p>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: `${categoryInfo.color}20`, 
                        color: categoryInfo.color 
                      }}
                    >
                      {categoryInfo.icon} {categoryInfo.name}
                    </span>
                  </div>
                </div>

                {/* SubPages Preview */}
                <div className="space-y-2 mb-4">
                  <div className="text-xs font-medium text-gray-300 mb-2">SubPages:</div>
                  {page.subPages.map((subPage, idx) => (
                    <div key={subPage.id} className="flex items-center space-x-2 text-xs">
                      <span className={`w-2 h-2 rounded-full ${
                        subPage.type === 'powerbi' ? 'bg-blue-400' : 'bg-green-400'
                      }`}></span>
                      <span className="text-gray-300">{subPage.name}</span>
                      <span className={`px-1 py-0.5 rounded text-xs ${
                        subPage.embedUrl ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {subPage.embedUrl ? 'Configured' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Badges Preview */}
                <div className="flex space-x-2 mb-4">
                  {page.powerbiBadgeUrl && (
                    <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center">
                      <span className="text-xs">📊</span>
                    </div>
                  )}
                  {page.spreadsheetBadgeUrl && (
                    <div className="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center">
                      <span className="text-xs">📊</span>
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="text-xs text-gray-500 mb-4">
                  <div>Created: {new Date(page.createdAt).toLocaleDateString()}</div>
                  <div>Updated: {new Date(page.updatedAt).toLocaleDateString()}</div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEdit(page)}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Edit
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDuplicate(page)}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    📋
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(page.id)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    🗑️
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredPages.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-bold text-white mb-2">
            {searchTerm || selectedCategory ? "No pages match your filters" : "No pages created yet"}
          </h3>
          <p className="text-gray-400 mb-4">
            {searchTerm || selectedCategory 
              ? "Try adjusting your search or category filter" 
              : "Create your first enhanced page with Power BI and Spreadsheet subpages"
            }
          </p>
          {!searchTerm && !selectedCategory && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg font-semibold hover:shadow-lg hover:shadow-neon-blue/50 transition-all duration-300"
            >
              Create First Page
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setShowToast(false)} 
          duration={3000} 
        />
      )}
    </div>
  )
}