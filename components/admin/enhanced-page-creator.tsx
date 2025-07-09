"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MainPage, SubPage, PageCategory } from "../../types/page-types"
import Toast from "../toast"

interface EnhancedPageCreatorProps {
  onSave: (page: MainPage) => void
  editingPage?: MainPage | null
  onCancel: () => void
}

export default function EnhancedPageCreator({ onSave, editingPage, onCancel }: EnhancedPageCreatorProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    classification: "",
    powerbiBadgeUrl: "",
    spreadsheetBadgeUrl: "",
    customHtml: ""
  })
  
  const [subPages, setSubPages] = useState<Omit<SubPage, 'id' | 'createdAt' | 'updatedAt'>[]>([
    {
      name: "Power BI Analytics",
      type: "powerbi",
      embedUrl: "",
      elements: [],
      classification: "",
      customHtml: ""
    },
    {
      name: "Spreadsheet Data",
      type: "spreadsheet", 
      embedUrl: "",
      elements: [],
      classification: "",
      customHtml: ""
    }
  ])

  const [categories] = useState<PageCategory[]>([
    { id: "analytics", name: "Analytics", color: "#3B82F6", icon: "📊" },
    { id: "reports", name: "Reports", color: "#10B981", icon: "📈" },
    { id: "dashboards", name: "Dashboards", color: "#8B5CF6", icon: "📋" },
    { id: "operations", name: "Operations", color: "#F59E0B", icon: "⚙️" },
    { id: "finance", name: "Finance", color: "#EF4444", icon: "💰" }
  ])

  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "error">("success")

  useEffect(() => {
    if (editingPage) {
      setFormData({
        name: editingPage.name,
        description: editingPage.description,
        classification: editingPage.classification,
        powerbiBadgeUrl: editingPage.powerbiBadgeUrl || "",
        spreadsheetBadgeUrl: editingPage.spreadsheetBadgeUrl || "",
        customHtml: editingPage.customHtml || ""
      })
      
      if (editingPage.subPages.length >= 2) {
        setSubPages([
          {
            name: editingPage.subPages[0].name,
            type: editingPage.subPages[0].type,
            embedUrl: editingPage.subPages[0].embedUrl,
            elements: editingPage.subPages[0].elements,
            classification: editingPage.subPages[0].classification,
            customHtml: editingPage.subPages[0].customHtml || ""
          },
          {
            name: editingPage.subPages[1].name,
            type: editingPage.subPages[1].type,
            embedUrl: editingPage.subPages[1].embedUrl,
            elements: editingPage.subPages[1].elements,
            classification: editingPage.subPages[1].classification,
            customHtml: editingPage.subPages[1].customHtml || ""
          }
        ])
      }
    }
  }, [editingPage])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setToastType("error")
      setToastMessage("Page name is required")
      setShowToast(true)
      return
    }

    const newPage: MainPage = {
      id: editingPage?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      classification: formData.classification,
      powerbiBadgeUrl: formData.powerbiBadgeUrl,
      spreadsheetBadgeUrl: formData.spreadsheetBadgeUrl,
      elements: editingPage?.elements || [],
      customHtml: formData.customHtml,
      subPages: subPages.map((subPage, index) => ({
        ...subPage,
        id: editingPage?.subPages[index]?.id || `${Date.now()}-${index}`,
        createdAt: editingPage?.subPages[index]?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })),
      createdAt: editingPage?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    onSave(newPage)
    
    setToastType("success")
    setToastMessage(editingPage ? "Page updated successfully!" : "Page created successfully!")
    setShowToast(true)
  }

  const updateSubPage = (index: number, field: string, value: string) => {
    const updated = [...subPages]
    updated[index] = { ...updated[index], [field]: value }
    setSubPages(updated)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-morphism rounded-2xl p-6 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          {editingPage ? "Edit Page" : "Create New Page"}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Page Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Page Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
              placeholder="Enter page name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Classification</label>
            <select
              value={formData.classification}
              onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
            placeholder="Enter page description"
            rows={3}
          />
        </div>

        {/* Badge URLs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Power BI Badge URL</label>
            <input
              type="url"
              value={formData.powerbiBadgeUrl}
              onChange={(e) => setFormData({ ...formData, powerbiBadgeUrl: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
              placeholder="https://example.com/powerbi-logo.png"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Spreadsheet Badge URL</label>
            <input
              type="url"
              value={formData.spreadsheetBadgeUrl}
              onChange={(e) => setFormData({ ...formData, spreadsheetBadgeUrl: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
              placeholder="https://example.com/spreadsheet-logo.png"
            />
          </div>
        </div>

        {/* Custom HTML */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Custom HTML Content</label>
          <textarea
            value={formData.customHtml}
            onChange={(e) => setFormData({ ...formData, customHtml: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 font-mono text-sm"
            placeholder="<div>Custom HTML content...</div>"
            rows={4}
          />
        </div>

        {/* SubPages Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">SubPages Configuration</h3>
          
          {subPages.map((subPage, index) => (
            <div key={index} className="bg-gray-800/30 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-white">
                  {subPage.type === 'powerbi' ? '📊 Power BI SubPage' : '📊 Spreadsheet SubPage'}
                </h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  subPage.type === 'powerbi' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                }`}>
                  {subPage.type.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">SubPage Name</label>
                  <input
                    type="text"
                    value={subPage.name}
                    onChange={(e) => updateSubPage(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                    placeholder="Enter subpage name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Classification</label>
                  <select
                    value={subPage.classification}
                    onChange={(e) => updateSubPage(index, 'classification', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Embed URL</label>
                <input
                  type="url"
                  value={subPage.embedUrl}
                  onChange={(e) => updateSubPage(index, 'embedUrl', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                  placeholder={`Enter ${subPage.type} embed URL`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Custom HTML</label>
                <textarea
                  value={subPage.customHtml}
                  onChange={(e) => updateSubPage(index, 'customHtml', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 font-mono text-sm"
                  placeholder="<div>Custom HTML for this subpage...</div>"
                  rows={3}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300"
          >
            {editingPage ? "Update Page" : "Create Page"}
          </motion.button>
          
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold text-white transition-all duration-300"
          >
            Cancel
          </motion.button>
        </div>
      </form>

      {/* Toast Notification */}
      {showToast && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setShowToast(false)} 
          duration={3000} 
        />
      )}
    </motion.div>
  )
}