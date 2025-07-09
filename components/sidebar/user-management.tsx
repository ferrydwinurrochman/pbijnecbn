"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface User {
  id: string
  name: string
  email: string
  password: string
  phoneNumber?: string
  role: "admin" | "viewer" | "developer"
  assignedPages: string[]
  createdAt: string
}

interface UserManagementProps {
  onSaveToDatabase: (action: string, data: any) => void
}

export default function UserManagement({ onSaveToDatabase }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [pages, setPages] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<"all" | "admin" | "viewer" | "developer">("all")

  useEffect(() => {
    loadUsers()
    loadPages()
  }, [])

  const loadUsers = () => {
    const savedUsers = JSON.parse(localStorage.getItem("adminUsers") || "[]")
    setUsers(savedUsers)
  }

  const loadPages = () => {
    const savedPages = JSON.parse(localStorage.getItem("adminPages") || "[]")
    setPages(savedPages)
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === "all" || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  const handleTogglePageAccess = (userId: string, pageId: string) => {
    const updatedUsers = users.map((user) => {
      if (user.id === userId) {
        const assignedPages = user.assignedPages || []
        const newAssignedPages = assignedPages.includes(pageId)
          ? assignedPages.filter((id) => id !== pageId)
          : [...assignedPages, pageId]

        return { ...user, assignedPages: newAssignedPages }
      }
      return user
    })

    setUsers(updatedUsers)
    localStorage.setItem("adminUsers", JSON.stringify(updatedUsers))

    // Auto-save
    onSaveToDatabase("user_page_access_updated", {
      userId,
      pageId,
      action: users.find((u) => u.id === userId)?.assignedPages?.includes(pageId) ? "removed" : "added",
    })
  }

  const handleRoleChange = (userId: string, newRole: "admin" | "viewer" | "developer") => {
    const updatedUsers = users.map((user) => (user.id === userId ? { ...user, role: newRole } : user))

    setUsers(updatedUsers)
    localStorage.setItem("adminUsers", JSON.stringify(updatedUsers))

    // Auto-save
    onSaveToDatabase("user_role_updated", { userId, newRole })
  }

  const handleDeleteUser = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    if (confirm(`Delete user "${user.name}"? This action cannot be undone.`)) {
      const updatedUsers = users.filter((u) => u.id !== userId)
      setUsers(updatedUsers)
      localStorage.setItem("adminUsers", JSON.stringify(updatedUsers))

      // Auto-save
      onSaveToDatabase("user_deleted", { userId, userName: user.name })
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400"
      case "developer":
        return "bg-purple-500/20 text-purple-400"
      case "viewer":
        return "bg-blue-500/20 text-blue-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return "👑"
      case "developer":
        return "🛠️"
      case "viewer":
        return "👁️"
      default:
        return "👤"
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
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 text-sm"
        />

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as any)}
          className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white text-sm"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admins</option>
          <option value="developer">Developers</option>
          <option value="viewer">Viewers</option>
        </select>
      </div>

      {/* User List */}
      <div className="space-y-3">
        {filteredUsers.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="p-3 bg-gray-800/30 rounded-lg border border-gray-700 hover:bg-gray-700/50 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-lg">{getRoleIcon(user.role)}</span>
                  <h3 className="font-semibold text-white text-sm">{user.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${getRoleColor(user.role)}`}>{user.role}</span>
                </div>
                <p className="text-xs text-gray-400 mb-1">{user.email}</p>
                {user.phoneNumber && <p className="text-xs text-gray-400">📞 {user.phoneNumber}</p>}
              </div>

              {user.id !== "1" && (
                <div className="flex space-x-1">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                    className="text-xs bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="admin">Admin</option>
                    <option value="developer">Developer</option>
                  </select>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-1 hover:bg-red-400/20 rounded text-red-400 hover:text-red-300 transition-colors"
                    title="Delete User"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>

            {/* Page Access (only for viewers) */}
            {user.role === "viewer" && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <h4 className="text-xs font-semibold text-gray-300 mb-2">Page Access:</h4>
                <div className="space-y-1">
                  {pages.map((page) => (
                    <label key={page.id} className="flex items-center space-x-2 text-xs">
                      <input
                        type="checkbox"
                        checked={user.assignedPages?.includes(page.id) || false}
                        onChange={() => handleTogglePageAccess(user.id, page.id)}
                        className="w-3 h-3 text-cyan-400 bg-gray-700 border-gray-600 rounded focus:ring-cyan-400 focus:ring-1"
                      />
                      <span className="text-gray-300">{page.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">👥</div>
          <p className="text-gray-400 text-sm">No users found</p>
        </div>
      )}

      {/* User Statistics */}
      <div className="mt-6 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
        <h4 className="text-sm font-semibold text-white mb-2">User Statistics</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-gray-400">
            Total: <span className="text-white font-medium">{users.length}</span>
          </div>
          <div className="text-gray-400">
            Admins: <span className="text-white font-medium">{users.filter((u) => u.role === "admin").length}</span>
          </div>
          <div className="text-gray-400">
            Developers:{" "}
            <span className="text-white font-medium">{users.filter((u) => u.role === "developer").length}</span>
          </div>
          <div className="text-gray-400">
            Viewers: <span className="text-white font-medium">{users.filter((u) => u.role === "viewer").length}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
