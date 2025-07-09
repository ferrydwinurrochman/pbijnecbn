"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface DeveloperToolbarProps {
  isEditMode: boolean
  onToggleEditMode: () => void
  onAddElement: (type: "button" | "card" | "shape") => void
  onSaveLayout: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}

export default function DeveloperToolbar({
  isEditMode,
  onToggleEditMode,
  onAddElement,
  onSaveLayout,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: DeveloperToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showColorPalette, setShowColorPalette] = useState(false)

  const colors = [
    "#0f2027",
    "#203a43",
    "#2c5364", // Dark blues
    "#00f5ff",
    "#bf00ff",
    "#39ff14", // Neon colors
    "#ff6b6b",
    "#4ecdc4",
    "#45b7d1", // Accent colors
    "#96ceb4",
    "#feca57",
    "#ff9ff3", // Soft colors
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="developer-toolbar"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-sm">Developer Tools</h3>
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-400 hover:text-white transition-colors">
          {isExpanded ? "−" : "+"}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {/* Edit Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleEditMode}
              className={`w-full py-2 px-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                isEditMode
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {isEditMode ? "🟢 Edit Mode ON" : "⚪ Edit Mode OFF"}
            </motion.button>

            {isEditMode && (
              <>
                {/* Add Elements */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 font-medium">Add Elements:</p>
                  <div className="grid grid-cols-3 gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onAddElement("button")}
                      className="py-2 px-2 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium text-white transition-colors"
                    >
                      🟦 Button
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onAddElement("card")}
                      className="py-2 px-2 bg-purple-600 hover:bg-purple-700 rounded text-xs font-medium text-white transition-colors"
                    >
                      🧾 Card
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onAddElement("shape")}
                      className="py-2 px-2 bg-green-600 hover:bg-green-700 rounded text-xs font-medium text-white transition-colors"
                    >
                      🔺 Shape
                    </motion.button>
                  </div>
                </div>

                {/* Color Palette */}
                <div className="space-y-2">
                  <button
                    onClick={() => setShowColorPalette(!showColorPalette)}
                    className="text-xs text-gray-400 font-medium hover:text-white transition-colors"
                  >
                    🎨 Color Palette {showColorPalette ? "▼" : "▶"}
                  </button>
                  {showColorPalette && (
                    <div className="grid grid-cols-4 gap-1">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => {
                            // Apply color to selected element
                            const selectedElement = document.querySelector(".selected-element")
                            if (selectedElement) {
                              ;(selectedElement as HTMLElement).style.backgroundColor = color
                            }
                          }}
                          className="w-6 h-6 rounded border border-gray-600 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onUndo}
                      disabled={!canUndo}
                      className="flex-1 py-2 px-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs font-medium text-white transition-colors"
                    >
                      ↩️ Undo
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onRedo}
                      disabled={!canRedo}
                      className="flex-1 py-2 px-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs font-medium text-white transition-colors"
                    >
                      ↪️ Redo
                    </motion.button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onSaveLayout}
                    className="w-full py-2 px-3 bg-gradient-to-r from-cyan-400 to-purple-500 rounded font-medium text-sm text-white hover:shadow-lg hover:shadow-cyan-400/30 transition-all duration-300"
                  >
                    💾 Save Layout
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
