"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface PendingRegistration {
  id: string
  username: string
  phoneNumber: string
  password: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

interface RegistrationRequestsProps {
  onSaveToDatabase: (action: string, data: any) => void
  onRequestsUpdate: () => void
}

export default function RegistrationRequests({ onSaveToDatabase, onRequestsUpdate }: RegistrationRequestsProps) {
  const [requests, setRequests] = useState<PendingRegistration[]>([])
  const [pages, setPages] = useState<any[]>([])
  const [selectedRequest, setSelectedRequest] = useState<PendingRegistration | null>(null)
  const [approvalData, setApprovalData] = useState({
    role: "viewer" as "admin" | "viewer" | "developer",
    assignedPages: [] as string[],
    email: "",
  })

  useEffect(() => {
    loadRequests()
    loadPages()
  }, [])

  const loadRequests = () => {
    const pending = JSON.parse(localStorage.getItem("pendingRegistrations") || "[]")
    setRequests(pending.filter((req: PendingRegistration) => req.status === "pending"))
  }

  const loadPages = () => {
    const savedPages = JSON.parse(localStorage.getItem("adminPages") || "[]")
    setPages(savedPages)
  }

  const handleApprove = (request: PendingRegistration) => {
    setSelectedRequest(request)
    setApprovalData({
      role: "viewer",
      assignedPages: [],
      email: `${request.username.toLowerCase()}@jne.com`,
    })
  }

  const handleReject = (request: PendingRegistration) => {
    if (confirm(`Reject registration for "${request.username}"?`)) {
      // Update status to rejected
      const allRequests = JSON.parse(localStorage.getItem("pendingRegistrations") || "[]")
      const updatedRequests = allRequests.map((req: PendingRegistration) =>
        req.id === request.id ? { ...req, status: "rejected" } : req,
      )
      localStorage.setItem("pendingRegistrations", JSON.stringify(updatedRequests))

      // Auto-save
      onSaveToDatabase("registration_rejected", {
        requestId: request.id,
        username: request.username,
      })

      // Reload
      loadRequests()
      onRequestsUpdate()
    }
  }

  const confirmApproval = () => {
    if (!selectedRequest) return

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name: selectedRequest.username,
      email: approvalData.email,
      password: selectedRequest.password,
      phoneNumber: selectedRequest.phoneNumber,
      role: approvalData.role,
      assignedPages: approvalData.assignedPages,
      createdAt: new Date().toISOString(),
    }

    // Add to users
    const existingUsers = JSON.parse(localStorage.getItem("adminUsers") || "[]")
    const updatedUsers = [...existingUsers, newUser]
    localStorage.setItem("adminUsers", JSON.stringify(updatedUsers))

    // Update request status
    const allRequests = JSON.parse(localStorage.getItem("pendingRegistrations") || "[]")
    const updatedRequests = allRequests.map((req: PendingRegistration) =>
      req.id === selectedRequest.id ? { ...req, status: "approved" } : req,
    )
    localStorage.setItem("pendingRegistrations", JSON.stringify(updatedRequests))

    // Auto-save
    onSaveToDatabase("registration_approved", {
      requestId: selectedRequest.id,
      username: selectedRequest.username,
      newUser,
    })

    // Reset and reload
    setSelectedRequest(null)
    loadRequests()
    onRequestsUpdate()
  }

  const handlePageSelection = (pageId: string) => {
    const updatedPages = approvalData.assignedPages.includes(pageId)
      ? approvalData.assignedPages.filter((id) => id !== pageId)
      : [...approvalData.assignedPages, pageId]
    setApprovalData({ ...approvalData, assignedPages: updatedPages })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="p-4 space-y-4"
    >
      {!selectedRequest ? (
        <>
          {/* Request List */}
          <div className="space-y-3">
            {requests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-3 bg-gray-800/30 rounded-lg border border-gray-700 hover:bg-gray-700/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">{request.username.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm">{request.username}</h3>
                        <p className="text-xs text-gray-400">📞 {request.phoneNumber}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Requested: {new Date(request.createdAt).toLocaleDateString()}{" "}
                      {new Date(request.createdAt).toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleApprove(request)}
                      className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded text-xs font-medium text-white hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300"
                    >
                      ✅ Approve
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleReject(request)}
                      className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 rounded text-xs font-medium text-white hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300"
                    >
                      ❌ Reject
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {requests.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-gray-400 text-sm">No pending requests</p>
            </div>
          )}
        </>
      ) : (
        /* Approval Modal */
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Approve Registration</h3>
            <button
              onClick={() => setSelectedRequest(null)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-3">
            <h4 className="font-medium text-white mb-2">User Details</h4>
            <div className="space-y-1 text-sm">
              <div className="text-gray-300">Username: {selectedRequest.username}</div>
              <div className="text-gray-300">Phone: {selectedRequest.phoneNumber}</div>
              <div className="text-gray-300">
                Registered: {new Date(selectedRequest.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                value={approvalData.email}
                onChange={(e) => setApprovalData({ ...approvalData, email: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
              <select
                value={approvalData.role}
                onChange={(e) => setApprovalData({ ...approvalData, role: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white text-sm"
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
                    <label key={page.id} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={approvalData.assignedPages.includes(page.id)}
                        onChange={() => handlePageSelection(page.id)}
                        className="w-3 h-3 text-cyan-400 bg-gray-700 border-gray-600 rounded focus:ring-cyan-400 focus:ring-1"
                      />
                      <span className="text-white">{page.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={confirmApproval}
              className="flex-1 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300"
            >
              ✅ Approve User
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedRequest(null)}
              className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold text-white transition-all duration-300"
            >
              Cancel
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
