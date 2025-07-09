"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Page {
  id: string
  title: string
  description: string
  embedUrl: string
  createdAt: string
}

export default function ManagePages() {
  const [pages, setPages] = useState<Page[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    embedUrl: "",
  })

  useEffect(() => {
    loadPages()
  }, [])

  const loadPages = () => {
    const savedPages = JSON.parse(localStorage.getItem("adminPages") || "[]")
    setPages(savedPages)
  }

  const savePages = (updatedPages: Page[]) => {
    localStorage.setItem("adminPages", JSON.stringify(updatedPages))
    setPages(updatedPages)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingPage) {
      // Update existing page
      const updatedPages = pages.map((page) => (page.id === editingPage.id ? { ...page, ...formData } : page))
      savePages(updatedPages)
    } else {
      // Add new page
      const newPage: Page = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      }
      savePages([...pages, newPage])
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({ title: "", description: "", embedUrl: "" })
    setShowForm(false)
    setEditingPage(null)
  }

  const handleEdit = (page: Page) => {
    setEditingPage(page)
    setFormData({
      title: page.title,
      description: page.description,
      embedUrl: page.embedUrl,
    })
    setShowForm(true)
  }

  const handleDelete = (pageId: string) => {
    if (confirm("Are you sure you want to delete this page?")) {
      const updatedPages = pages.filter((page) => page.id !== pageId)
      savePages(updatedPages)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <h2 className="text-3xl font-bold text-white mb-2">Manage Pages</h2>
          <p className="text-gray-400">Add, edit, or remove Power BI report pages</p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg font-semibold hover:shadow-lg hover:shadow-neon-blue/50 transition-all duration-300"
        >
          Add New Page
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-morphism rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">{editingPage ? "Edit Page" : "Add New Page"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Page Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full modern-input"
                  placeholder="Enter page title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full modern-textarea"
                  placeholder="Enter page description"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Embed URL</label>
                <input
                  type="url"
                  value={formData.embedUrl}
                  onChange={(e) => setFormData({ ...formData, embedUrl: e.target.value })}
                  className="w-full modern-input"
                  placeholder="Enter Power BI embed URL"
                  required
                />
              </div>

              <div className="flex space-x-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 font-semibold transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, #10b981 0%, rgba(255, 255, 255, 0.1) 100%)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.2)"
                  }}
                >
                  {editingPage ? "Update Page" : "Add Page"}
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetForm}
                  className="px-6 py-3 font-semibold transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, #4b5563 0%, rgba(255, 255, 255, 0.1) 100%)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.2)"
                  }}
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page, index) => (
          <motion.div
            key={page.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="modern-card"
          >
            <h3 className="text-lg font-bold text-white mb-2">{page.title}</h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-3">{page.description}</p>
            <p className="text-xs text-gray-500 mb-4">Created: {new Date(page.createdAt).toLocaleDateString()}</p>

            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleEdit(page)}
                className="flex-1 px-3 py-2 text-sm font-medium transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #3b82f6 0%, rgba(255, 255, 255, 0.1) 100%)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.2)"
                }}
              >
                Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDelete(page.id)}
                className="flex-1 px-3 py-2 text-sm font-medium transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #ef4444 0%, rgba(255, 255, 255, 0.1) 100%)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.2)"
                }}
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {pages.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-bold text-white mb-2">No Pages Yet</h3>
          <p className="text-gray-400">Add your first Power BI report page to get started</p>
        </motion.div>
      )}
    </div>
  )
}