"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { MainPage } from "../../types/page-types"

export default function EnhancedAdminStats() {
  const [stats, setStats] = useState({
    totalPages: 0,
    totalSubPages: 0,
    configuredSubPages: 0,
    categorizedPages: 0,
    remainingSlots: 15
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = () => {
    const pages: MainPage[] = JSON.parse(localStorage.getItem("enhancedPages") || "[]")
    const users = JSON.parse(localStorage.getItem("adminUsers") || "[]")
    
    const totalSubPages = pages.reduce((acc, page) => acc + page.subPages.length, 0)
    const configuredSubPages = pages.reduce((acc, page) => 
      acc + page.subPages.filter(sp => sp.embedUrl).length, 0
    )
    const categorizedPages = pages.filter(page => page.classification).length

    setStats({
      totalPages: pages.length,
      totalSubPages,
      configuredSubPages,
      categorizedPages,
      remainingSlots: Math.max(0, 15 - pages.length)
    })
  }

  const statCards = [
    {
      title: "Main Pages",
      value: stats.totalPages,
      max: 15,
      icon: "📄",
      color: "from-blue-500 to-cyan-500",
      description: `${stats.remainingSlots} slots remaining`
    },
    {
      title: "SubPages",
      value: stats.totalSubPages,
      max: stats.totalPages * 2,
      icon: "📊",
      color: "from-purple-500 to-pink-500",
      description: "Power BI & Spreadsheet"
    },
    {
      title: "Configured",
      value: stats.configuredSubPages,
      max: stats.totalSubPages,
      icon: "✅",
      color: "from-green-500 to-emerald-500",
      description: "Ready to use"
    },
    {
      title: "Categorized",
      value: stats.categorizedPages,
      max: stats.totalPages,
      icon: "🏷️",
      color: "from-orange-500 to-red-500",
      description: "With classifications"
    }
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-bold text-white mb-2">Enhanced Dashboard Overview</h2>
        <p className="text-gray-400">Manage your enhanced pages with Power BI and Spreadsheet integration</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="glass-morphism rounded-2xl p-6 hover:shadow-lg hover:shadow-neon-blue/20 transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center mb-4`}>
              <span className="text-2xl">{card.icon}</span>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">{card.title}</h3>
              {card.max && (
                <span className="text-xs text-gray-500">/{card.max}</span>
              )}
            </div>
            
            <p className="text-3xl font-bold text-white mb-1">{card.value}</p>
            <p className="text-xs text-gray-500">{card.description}</p>
            
            {/* Progress Bar */}
            {card.max && (
              <div className="mt-3">
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${card.color} transition-all duration-500`}
                    style={{ width: `${Math.min((card.value / card.max) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-neon-blue/50 transition-all duration-300 text-left"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">➕</span>
              <div>
                <div className="font-bold">Create New Page</div>
                <div className="text-sm opacity-90">Add main page with subpages</div>
              </div>
            </div>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 text-left"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">👥</span>
              <div>
                <div className="font-bold">Manage Users</div>
                <div className="text-sm opacity-90">User roles & permissions</div>
              </div>
            </div>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 text-left"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔧</span>
              <div>
                <div className="font-bold">Developer Mode</div>
                <div className="text-sm opacity-90">Visual page editing</div>
              </div>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="glass-morphism rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-gray-300">Auto-save Active</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span className="text-gray-300">Visual Editor Ready</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
            <span className="text-gray-300">Enhanced Mode Active</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}