"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Toast from "../toast"

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

interface PendingRegistration {
  id: string
  username: string
  phoneNumber: string
  password: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

interface Page {
  id: string
  title: string
  description: string
  embedUrl: string
  createdAt: string
}

type ActiveTab = "users" | "pending"

export default function ManageUsers() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("users")
  const [users, setUsers] = useState<User[]>([])
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([])
  const [pages, setPages] = useState<Page[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedPendingUser, setSelectedPendingUser] = useState<PendingRegistration | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "error">("success")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "viewer" as "admin" | "viewer" | "developer",
    assignedPages: [] as string[],
  })
  const [approvalData, setApprovalData] = useState({
    role: "viewer" as "admin" | "viewer" | "developer",
    assignedPages: [] as string[],
    email: "",
  })

  useEffect(() => {
    loadUsers()
    loadPendingRegistrations()
    loadPages()
  }, [])

  const loadUsers = () => {
    const savedUsers = JSON.parse(localStorage.getItem("adminUsers") || "[]")
    if (savedUsers.length === 0) {
      const defaultAdmin: User = {
        id: "1",
        name: "Administrator",
        email: "admin@jne.com",
        password: "admin",
        phoneNumber: "1234567890",
        role: "admin",
        assignedPages: [],
        createdAt: new Date().toISOString(),
      }
      savedUsers.push(defaultAdmin)
      localStorage.setItem("adminUsers", JSON.stringify(savedUsers))
    }

    const migratedUsers = savedUsers.map((user: any) => ({
      ...user,
      assignedPages: user.assignedPages || [],
      phoneNumber: user.phoneNumber || "",
    }))

    setUsers(migratedUsers)
  }

  const loadPendingRegistrations = () => {
    const savedPending = JSON.parse(localStorage.getItem("pendingRegistrations") || "[]")
    setPendingRegistrations(savedPending.filter((reg: PendingRegistration) => reg.status === "pending"))
  }

  const loadPages = () => {
    const savedPages = JSON.parse(localStorage.getItem("adminPages") || "[]")
    setPages(savedPages)
  }

  const saveUsers = (updatedUsers: User[]) => {
    localStorage.setItem("adminUsers", JSON.stringify(updatedUsers))
    setUsers(updatedUsers)
  }

  const savePendingRegistrations = (updatedPending: PendingRegistration[]) => {
    localStorage.setItem("pendingRegistrations", JSON.stringify(updatedPending))
    setPendingRegistrations(updatedPending.filter((reg) => reg.status === "pending"))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingUser) {
      const updatedUsers = users.map((user) => (user.id === editingUser.id ? { ...user, ...formData } : user))
      saveUsers(updatedUsers)
      setToastMessage("User updated successfully!")
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      }
      saveUsers([...users, newUser])
      setToastMessage("User added successfully!")
    }

    setToastType("success")
    setShowToast(true)
    resetForm()
  }

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "", phoneNumber: "", role: "viewer", assignedPages: [] })
    setShowForm(false)
    setEditingUser(null)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: user.password,
      phoneNumber: user.phoneNumber || "",
      role: user.role,
      assignedPages: user.assignedPages || [],
    })
    setShowForm(true)
  }

  const handleDelete = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      const updatedUsers = users.filter((user) => user.id !== userId)
      saveUsers(updatedUsers)
      setToastMessage("User deleted successfully!")
      setToastType("success")
      setShowToast(true)
    }
  }

  const handlePageSelection = (pageId: string, isApproval = false) => {
    if (isApproval) {
      const updatedPages = approvalData.assignedPages.includes(pageId)
        ? approvalData.assignedPages.filter((id) => id !== pageId)
        : [...approvalData.assignedPages, pageId]
      setApprovalData({ ...approvalData, assignedPages: updatedPages })
    } else {
      const updatedPages = formData.assignedPages.includes(pageId)
        ? formData.assignedPages.filter((id) => id !== pageId)
        : [...formData.assignedPages, pageId]
      setFormData({ ...formData, assignedPages: updatedPages })
    }
  }

  const handleApproveUser = (pendingUser: PendingRegistration) => {
    setSelectedPendingUser(pendingUser)
    setApprovalData({
      role: "viewer",
      assignedPages: [],
      email: `${pendingUser.username.toLowerCase()}@jne.com`,
    })
    setShowApprovalModal(true)
  }

  const handleRejectUser = (pendingUser: PendingRegistration) => {
    if (confirm(`Are you sure you want to reject ${pendingUser.username}'s registration?`)) {
      const allPending = JSON.parse(localStorage.getItem("pendingRegistrations") || "[]")
      const updatedPending = allPending.map((reg: PendingRegistration) =>
        reg.id === pendingUser.id ? { ...reg, status: "rejected" } : reg,
      )
      savePendingRegistrations(updatedPending)
      setToastMessage("Registration rejected!")
      setToastType("error")
      setShowToast(true)
    }
  }

  const confirmApproval = () => {
    if (!selectedPendingUser) return

    // Create new user from pending registration
    const newUser: User = {
      id: Date.now().toString(),
      name: selectedPendingUser.username,
      email: approvalData.email,
      password: selectedPendingUser.password,
      phoneNumber: selectedPendingUser.phoneNumber,
      role: approvalData.role,
      assignedPages: approvalData.assignedPages,
      createdAt: new Date().toISOString(),
    }

    // Add to users
    saveUsers([...users, newUser])

    // Update pending registration status
    const allPending = JSON.parse(localStorage.getItem("pendingRegistrations") || "[]")
    const updatedPending = allPending.map((reg: PendingRegistration) =>
      reg.id === selectedPendingUser.id ? { ...reg, status: "approved" } : reg,
    )
    savePendingRegistrations(updatedPending)

    setShowApprovalModal(false)
    setSelectedPendingUser(null)
    setToastMessage("User approved and added successfully!")
    setToastType("success")
    setShowToast(true)
  }

  const getPageTitle = (pageId: string) => {
    const page = pages.find((p) => p.id === pageId)
    return page ? page.title : "Unknown Page"
  }

  const getRoleColor = (role: string) => {
    return role === "admin" ? "from-red-500 to-pink-500" : "from-blue-500 to-cyan-500"
  }

  const getRoleIcon = (role: string) => {
    return role === "admin" ? "👑" : "👁️"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <h2 className="text-3xl font-bold text-white mb-2">Manage Users</h2>
          <p className="text-gray-400">Add, edit, or remove user accounts and manage registrations</p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
        >
          Add New User
        </motion.button>
      </div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex space-x-1 bg-gray-800/50 rounded-lg p-1"
      >
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-300 ${
            activeTab === "users"
              ? "bg-gradient-to-r from-cyan-400 to-purple-500 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Active Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-300 relative ${
            activeTab === "pending"
              ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Pending Registrations ({pendingRegistrations.length})
          {pendingRegistrations.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {pendingRegistrations.length}
            </span>
          )}
        </button>
      </motion.div>

      {/* User Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-morphism rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">{editingUser ? "Edit User" : "Add New User"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as "admin" | "viewer" | "developer" })
                  }
                  className="w-full modern-select"
                  required
                >
                  <option value="viewer">Viewer</option>
                  <option value="admin">Admin</option>
                  <option value="developer">Developer</option>
                </select>
              </div>

              {formData.role === "viewer" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Assigned Pages {formData.assignedPages.length > 0 && `(${formData.assignedPages.length} selected)`}
                  </label>
                  <div className="space-y-2">
                    {pages.length === 0 ? (
                      <div className="text-gray-400 text-sm p-4 bg-gray-800/30 rounded-lg border border-gray-600">
                        No pages available. Create pages in the "Manage Pages" section first.
                      </div>
                    ) : (
                      <div className="max-h-40 overflow-y-auto space-y-2 p-2 bg-gray-800/30 rounded-lg border border-gray-600">
                        {pages.map((page) => (
                          <motion.label
                            key={page.id}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.assignedPages.includes(page.id)}
                              onChange={() => handlePageSelection(page.id)}
                              className="w-4 h-4 text-cyan-400 bg-gray-700 border-gray-600 rounded focus:ring-cyan-400 focus:ring-2"
                            />
                            <div className="flex-1">
                              <div className="text-white font-medium">{page.title}</div>
                              <div className="text-gray-400 text-xs">{page.description}</div>
                            </div>
                          </motion.label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                  {editingUser ? "Update User" : "Add User"}
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

      {/* Approval Modal */}
      <AnimatePresence>
        {showApprovalModal && selectedPendingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-morphism rounded-2xl p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-xl font-bold text-white mb-4">Approve Registration</h3>
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">User Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="text-gray-300">Username: {selectedPendingUser.username}</div>
                    <div className="text-gray-300">Phone: {selectedPendingUser.phoneNumber}</div>
                    <div className="text-gray-300">
                      Registered: {new Date(selectedPendingUser.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={approvalData.email}
                    onChange={(e) => setApprovalData({ ...approvalData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                  <select
                    value={approvalData.role}
                    onChange={(e) =>
                      setApprovalData({ ...approvalData, role: e.target.value as "admin" | "viewer" | "developer" })
                    }
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="admin">Admin</option>
                    <option value="developer">Developer</option>
                  </select>
                </div>

                {approvalData.role === "viewer" && pages.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Assigned Pages</label>
                    <div className="max-h-32 overflow-y-auto space-y-2 p-2 bg-gray-800/30 rounded-lg border border-gray-600">
                      {pages.map((page) => (
                        <label
                          key={page.id}
                          className="flex items-center space-x-3 p-2 rounded hover:bg-gray-700/50 transition-colors cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={approvalData.assignedPages.includes(page.id)}
                            onChange={() => handlePageSelection(page.id, true)}
                            className="w-4 h-4 text-cyan-400 bg-gray-700 border-gray-600 rounded focus:ring-cyan-400 focus:ring-2"
                          />
                          <div className="text-white text-sm">{page.title}</div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={confirmApproval}
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300"
                  >
                    Approve User
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowApprovalModal(false)}
                    className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold text-white transition-all duration-300"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content based on active tab */}
      {activeTab === "users" ? (
        /* Active Users */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="modern-card"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">{user.name}</h3>
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-r ${getRoleColor(user.role)} flex items-center justify-center`}
                >
                  <span className="text-sm">{getRoleIcon(user.role)}</span>
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-2">{user.email}</p>
              {user.phoneNumber && <p className="text-gray-400 text-sm mb-2">📞 {user.phoneNumber}</p>}
              <p className="text-xs text-gray-500 mb-2">
                Role: <span className="capitalize font-medium">{user.role}</span>
              </p>

              {user.role === "viewer" && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Assigned Pages:</p>
                  {user.assignedPages && user.assignedPages.length > 0 ? (
                    <div className="space-y-1">
                      {user.assignedPages.map((pageId) => (
                        <div key={pageId} className="text-xs bg-cyan-400/20 text-cyan-400 px-2 py-1 rounded">
                          {getPageTitle(pageId)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-yellow-400">No pages assigned</div>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-500 mb-4">Created: {new Date(user.createdAt).toLocaleDateString()}</p>

              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEdit(user)}
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
                  onClick={() => handleDelete(user.id)}
                  className="flex-1 px-3 py-2 text-sm font-medium transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, #ef4444 0%, rgba(255, 255, 255, 0.1) 100%)",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.2)"
                  }}
                  disabled={user.id === "1"}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Pending Registrations */
        <div className="space-y-4">
          {pendingRegistrations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-white mb-2">No Pending Registrations</h3>
              <p className="text-gray-400">All registration requests have been processed</p>
            </motion.div>
          ) : (
            pendingRegistrations.map((registration, index) => (
              <motion.div
                key={registration.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-morphism rounded-2xl p-6 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {registration.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{registration.username}</h3>
                        <p className="text-sm text-gray-400">📞 {registration.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mb-4">
                      Registered: {new Date(registration.createdAt).toLocaleDateString()}{" "}
                      {new Date(registration.createdAt).toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleApproveUser(registration)}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-medium text-white hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300"
                    >
                      Approve
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRejectUser(registration)}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg font-medium text-white hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300"
                    >
                      Reject
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} duration={3000} />
      )}
    </div>
  )
}