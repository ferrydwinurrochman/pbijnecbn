"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface Stats {
  totalPages: number
  editableElements: number
  customComponents: number
  lastModified: string
}

export default function DeveloperStats() {
  const [stats, setStats] = useState<Stats>({
    totalPages: 0,
    editableElements: 0,
    customComponents: 0,
    lastModified: "Never",
  })

  useEffect(() => {
    // Load stats from localStorage
    const pages = JSON.parse(localStorage.getItem("adminPages") || "[]")
    const layouts = JSON.parse(localStorage.getItem("pageLayouts") || "{}")

    let totalElements = 0
    Object.values(layouts).forEach((layout: any) => {
      if (layout.elements) {
        totalElements += layout.elements.length
      }
    })

    setStats({
      totalPages: pages.length + 2, // Include built-in pages
      editableElements: totalElements,
      customComponents: Object.keys(layouts).length,
      lastModified: localStorage.getItem("lastLayoutUpdate") || "Never",
    })
  }, [])

  const statCards = [
    {
      title: "Total Pages",
      value: stats.totalPages,
      icon: "📄",
      color: "from-blue-500 to-cyan-500",
      description: "Available for editing",
    },
    {
      title: "Custom Elements",
      value: stats.editableElements,
      icon: "🧩",
      color: "from-purple-500 to-pink-500",
      description: "Draggable components",
    },
    {
      title: "Modified Pages",
      value: stats.customComponents,
      icon: "✏️",
      color: "from-green-500 to-emerald-500",
      description: "With custom layouts",
    },
    {
      title: "Last Update",
      value: stats.lastModified === "Never" ? "Never" : new Date(stats.lastModified).toLocaleDateString(),
      icon: "🕒",
      color: "from-orange-500 to-red-500",
      description: "Layout modification",
    },
  ]

  const quickActions = [
    {
      title: "Edit Performance Dashboard",
      description: "Customize the main analytics page",
      action: () => window.open("/dashboard/performance?dev=true", "_blank"),
      icon: "📊",
      color: "from-cyan-400 to-blue-500",
    },
    {
      title: "Edit Shipment Analysis",
      description: "Modify shipment tracking layout",
      action: () => window.open("/dashboard/shipment?dev=true", "_blank"),
      icon: "📦",
      color: "from-green-400 to-emerald-500",
    },
    {
      title: "Create New Template",
      description: "Design a reusable page template",
      action: () => alert("Template creator coming soon!"),
      icon: "🎨",
      color: "from-purple-400 to-pink-500",
    },
    {
      title: "Export Layouts",
      description: "Download all custom layouts",
      action: () => {
        const layouts = localStorage.getItem("pageLayouts")
        if (layouts) {
          const blob = new Blob([layouts], { type: "application/json" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = "page-layouts.json"
          a.click()
        }
      },
      icon: "💾",
      color: "from-yellow-400 to-orange-500",
    },
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h2 className="text-3xl font-bold text-white mb-2">Developer Dashboard</h2>
        <p className="text-gray-400">Manage and customize all pages with full design control</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="glass-morphism rounded-2xl p-6 hover:shadow-lg hover:shadow-cyan-400/20 transition-all duration-300"
          >
            <div
              className={`w-12 h-12 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center mb-4`}
            >
              <span className="text-2xl">{card.icon}</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">{card.title}</h3>
            <p className="text-2xl font-bold text-white mb-1">{card.value}</p>
            <p className="text-xs text-gray-500">{card.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="glass-morphism rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.title}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.action}
              className={`p-4 rounded-lg bg-gradient-to-r ${action.color} text-white text-left hover:shadow-lg transition-all duration-300`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{action.icon}</span>
                <div>
                  <h4 className="font-bold mb-1">{action.title}</h4>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Developer Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="glass-morphism rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4">Developer Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-cyan-400 mb-2">🎯 Edit Mode</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Toggle edit mode on any page</li>
              <li>• Drag elements to reposition</li>
              <li>• Right-click for context menu</li>
              <li>• Use toolbar for new elements</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-purple-400 mb-2">🛠️ Customization</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Change colors and gradients</li>
              <li>• Modify text and content</li>
              <li>• Update embed URLs</li>
              <li>• Add custom shapes</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
