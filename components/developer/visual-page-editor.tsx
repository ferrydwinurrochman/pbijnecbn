"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ContextMenu from "./context-menu"

interface PageElement {
  id: string
  type: "button" | "card" | "shape" | "text"
  content: string
  x: number
  y: number
  width: number
  height: number
  backgroundColor: string
  textColor: string
  link?: string
  borderRadius: number
  fontSize: number
}

interface VisualPageEditorProps {
  pageId: string
  isEditMode: boolean
  onSaveToDatabase: (action: string, data: any) => void
}

export default function VisualPageEditor({ pageId, isEditMode, onSaveToDatabase }: VisualPageEditorProps) {
  const [elements, setElements] = useState<PageElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; elementId: string } | null>(null)
  const [draggedElement, setDraggedElement] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadPageLayout()
  }, [pageId])

  const loadPageLayout = () => {
    const layouts = JSON.parse(localStorage.getItem("pageLayouts") || "{}")
    const pageLayout = layouts[pageId]
    if (pageLayout && pageLayout.elements) {
      setElements(pageLayout.elements)
    }
  }

  const savePageLayout = (newElements: PageElement[]) => {
    const layouts = JSON.parse(localStorage.getItem("pageLayouts") || "{}")
    layouts[pageId] = {
      elements: newElements,
      lastModified: new Date().toISOString(),
    }
    localStorage.setItem("pageLayouts", JSON.stringify(layouts))
    localStorage.setItem("lastLayoutUpdate", new Date().toISOString())

    // Auto-save to database
    onSaveToDatabase("layout_updated", {
      pageId,
      elements: newElements,
      timestamp: new Date().toISOString(),
    })
  }

  const addElement = (type: "button" | "card" | "shape" | "text") => {
    const newElement: PageElement = {
      id: Date.now().toString(),
      type,
      content: type === "button" ? "New Button" : type === "card" ? "New Card" : type === "text" ? "New Text" : "",
      x: 100,
      y: 100,
      width: type === "button" ? 120 : type === "card" ? 200 : type === "shape" ? 100 : 150,
      height: type === "button" ? 40 : type === "card" ? 120 : type === "shape" ? 100 : 30,
      backgroundColor: type === "button" ? "#0f2027" : type === "card" ? "#1a1a2e" : "#2c5364",
      textColor: "#ffffff",
      link: type === "button" ? "#" : undefined,
      borderRadius: type === "shape" ? 50 : 8,
      fontSize: 14,
    }

    const updatedElements = [...elements, newElement]
    setElements(updatedElements)
    savePageLayout(updatedElements)

    // Auto-save
    onSaveToDatabase("element_added", { pageId, element: newElement })
  }

  const updateElement = (elementId: string, updates: Partial<PageElement>) => {
    const updatedElements = elements.map((el) => (el.id === elementId ? { ...el, ...updates } : el))
    setElements(updatedElements)
    savePageLayout(updatedElements)

    // Auto-save
    onSaveToDatabase("element_updated", { pageId, elementId, updates })
  }

  const deleteElement = (elementId: string) => {
    const updatedElements = elements.filter((el) => el.id !== elementId)
    setElements(updatedElements)
    savePageLayout(updatedElements)

    // Auto-save
    onSaveToDatabase("element_deleted", { pageId, elementId })
  }

  const duplicateElement = (elementId: string) => {
    const element = elements.find((el) => el.id === elementId)
    if (!element) return

    const newElement = {
      ...element,
      id: Date.now().toString(),
      x: element.x + 20,
      y: element.y + 20,
    }

    const updatedElements = [...elements, newElement]
    setElements(updatedElements)
    savePageLayout(updatedElements)

    // Auto-save
    onSaveToDatabase("element_duplicated", { pageId, originalId: elementId, newElement })
  }

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    if (!isEditMode) return

    e.preventDefault()
    setDraggedElement(elementId)
    setSelectedElement(elementId)

    const element = elements.find((el) => el.id === elementId)
    if (!element) return

    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedElement || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const newX = e.clientX - containerRect.left - dragOffset.x
    const newY = e.clientY - containerRect.top - dragOffset.y

    updateElement(draggedElement, { x: Math.max(0, newX), y: Math.max(0, newY) })
  }

  const handleMouseUp = () => {
    setDraggedElement(null)
  }

  const handleRightClick = (e: React.MouseEvent, elementId: string) => {
    if (!isEditMode) return

    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      elementId,
    })
  }

  const handleEditContent = (elementId: string) => {
    const element = elements.find((el) => el.id === elementId)
    if (!element) return

    const newContent = prompt("Edit content:", element.content)
    if (newContent !== null) {
      updateElement(elementId, { content: newContent })
    }
    setContextMenu(null)
  }

  const handleChangeColor = (elementId: string) => {
    const element = elements.find((el) => el.id === elementId)
    if (!element) return

    const newColor = prompt("Enter color (hex):", element.backgroundColor)
    if (newColor) {
      updateElement(elementId, { backgroundColor: newColor })
    }
    setContextMenu(null)
  }

  const renderElement = (element: PageElement) => {
    const commonProps = {
      key: element.id,
      style: {
        position: "absolute" as const,
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        backgroundColor: element.backgroundColor,
        color: element.textColor,
        borderRadius: element.borderRadius,
        fontSize: element.fontSize,
        cursor: isEditMode ? "move" : "default",
        border: selectedElement === element.id ? "2px solid #00f5ff" : "none",
        zIndex: selectedElement === element.id ? 1000 : 1,
      },
      onMouseDown: (e: React.MouseEvent) => handleMouseDown(e, element.id),
      onContextMenu: (e: React.MouseEvent) => handleRightClick(e, element.id),
      className: `${isEditMode ? "draggable-element" : ""} transition-all duration-200`,
    }

    switch (element.type) {
      case "button":
        return (
          <motion.button
            {...commonProps}
            whileHover={!isEditMode ? { scale: 1.05 } : {}}
            className={`${commonProps.className} flex items-center justify-center font-semibold hover:shadow-lg transition-all duration-300`}
            onClick={(e) => {
              if (!isEditMode && element.link) {
                window.open(element.link, "_blank")
              }
              e.stopPropagation()
            }}
          >
            {element.content}
          </motion.button>
        )

      case "card":
        return (
          <motion.div
            {...commonProps}
            className={`${commonProps.className} p-4 shadow-lg`}
            style={{
              ...commonProps.style,
              background: `linear-gradient(135deg, ${element.backgroundColor}, ${element.backgroundColor}dd)`,
            }}
          >
            <div className="text-sm font-medium">{element.content}</div>
          </motion.div>
        )

      case "shape":
        return (
          <motion.div
            {...commonProps}
            className={`${commonProps.className} shadow-lg`}
            style={{
              ...commonProps.style,
              background: `radial-gradient(circle, ${element.backgroundColor}, ${element.backgroundColor}aa)`,
            }}
          />
        )

      case "text":
        return (
          <motion.div
            {...commonProps}
            className={`${commonProps.className} flex items-center font-medium`}
            style={{
              ...commonProps.style,
              backgroundColor: "transparent",
            }}
          >
            {element.content}
          </motion.div>
        )

      default:
        return null
    }
  }

  if (!isEditMode && elements.length === 0) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ pointerEvents: isEditMode ? "auto" : "none" }}
    >
      {/* Render Elements */}
      <div className="relative w-full h-full" style={{ pointerEvents: "auto" }}>
        {elements.map(renderElement)}
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            onEdit={() => handleEditContent(contextMenu.elementId)}
            onDelete={() => {
              deleteElement(contextMenu.elementId)
              setContextMenu(null)
            }}
            onDuplicate={() => {
              duplicateElement(contextMenu.elementId)
              setContextMenu(null)
            }}
            onChangeColor={() => handleChangeColor(contextMenu.elementId)}
          />
        )}
      </AnimatePresence>

      {/* Developer Toolbar Integration */}
      {isEditMode && (
        <div className="fixed bottom-20 left-4 z-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 border border-gray-700"
          >
            <div className="flex space-x-2">
              <button
                onClick={() => addElement("button")}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium text-white transition-colors"
              >
                + Button
              </button>
              <button
                onClick={() => addElement("card")}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-xs font-medium text-white transition-colors"
              >
                + Card
              </button>
              <button
                onClick={() => addElement("shape")}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-xs font-medium text-white transition-colors"
              >
                + Shape
              </button>
              <button
                onClick={() => addElement("text")}
                className="px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded text-xs font-medium text-white transition-colors"
              >
                + Text
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
