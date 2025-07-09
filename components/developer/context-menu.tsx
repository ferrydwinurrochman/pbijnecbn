"use client"

import { motion } from "framer-motion"

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onChangeColor: () => void
}

export default function ContextMenu({ x, y, onClose, onEdit, onDelete, onDuplicate, onChangeColor }: ContextMenuProps) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-1000" onClick={onClose} />

      {/* Menu */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="context-menu"
        style={{ left: x, top: y }}
      >
        <div className="space-y-1">
          <button
            onClick={onEdit}
            className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded transition-colors"
          >
            ✏️ Edit Content
          </button>
          <button
            onClick={onChangeColor}
            className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded transition-colors"
          >
            🎨 Change Color
          </button>
          <button
            onClick={onDuplicate}
            className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded transition-colors"
          >
            📋 Duplicate
          </button>
          <hr className="border-gray-600 my-1" />
          <button
            onClick={onDelete}
            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded transition-colors"
          >
            🗑️ Delete
          </button>
        </div>
      </motion.div>
    </>
  )
}
