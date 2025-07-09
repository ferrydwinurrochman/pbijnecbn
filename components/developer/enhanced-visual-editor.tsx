"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PageElement, MainPage, SubPage } from "../../types/page-types"
import Toast from "../toast"

interface EnhancedVisualEditorProps {
  pageId: string
  pageType: 'main' | 'sub'
  subPageId?: string
  isEditMode: boolean
  onSaveToDatabase: (action: string, data: any) => void
}

export default function EnhancedVisualEditor({ 
  pageId, 
  pageType, 
  subPageId, 
  isEditMode, 
  onSaveToDatabase 
}: EnhancedVisualEditorProps) {
  const [elements, setElements] = useState<PageElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [draggedElement, setDraggedElement] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showPropertyPanel, setShowPropertyPanel] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [currentPage, setCurrentPage] = useState<MainPage | null>(null)
  const [currentSubPage, setCurrentSubPage] = useState<SubPage | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-save functionality
  const autoSave = useCallback((newElements: PageElement[]) => {
    const pages: MainPage[] = JSON.parse(localStorage.getItem("enhancedPages") || "[]")
    
    if (pageType === 'main') {
      const updatedPages = pages.map(page => {
        if (page.id === pageId) {
          return { ...page, elements: newElements, updatedAt: new Date().toISOString() }
        }
        return page
      })
      localStorage.setItem("enhancedPages", JSON.stringify(updatedPages))
    } else if (pageType === 'sub' && subPageId) {
      const updatedPages = pages.map(page => {
        if (page.id === pageId) {
          const updatedSubPages = page.subPages.map(subPage => {
            if (subPage.id === subPageId) {
              return { ...subPage, elements: newElements, updatedAt: new Date().toISOString() }
            }
            return subPage
          })
          return { ...page, subPages: updatedSubPages, updatedAt: new Date().toISOString() }
        }
        return page
      })
      localStorage.setItem("enhancedPages", JSON.stringify(updatedPages))
    }

    // Auto-save to database
    onSaveToDatabase("visual_edit_autosave", {
      pageId,
      pageType,
      subPageId,
      elements: newElements,
      timestamp: new Date().toISOString()
    })

    setToastMessage("Auto-saved ✓")
    setShowToast(true)
  }, [pageId, pageType, subPageId, onSaveToDatabase])

  useEffect(() => {
    loadPageData()
  }, [pageId, pageType, subPageId])

  const loadPageData = () => {
    const pages: MainPage[] = JSON.parse(localStorage.getItem("enhancedPages") || "[]")
    const page = pages.find(p => p.id === pageId)
    
    if (page) {
      setCurrentPage(page)
      
      if (pageType === 'main') {
        setElements(page.elements || [])
      } else if (pageType === 'sub' && subPageId) {
        const subPage = page.subPages.find(sp => sp.id === subPageId)
        if (subPage) {
          setCurrentSubPage(subPage)
          setElements(subPage.elements || [])
        }
      }
    }
  }

  const addElement = (type: PageElement['type']) => {
    const newElement: PageElement = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
      x: 100,
      y: 100,
      width: getDefaultWidth(type),
      height: getDefaultHeight(type),
      styles: {
        backgroundColor: type === 'button' ? '#3B82F6' : 'transparent',
        textColor: '#FFFFFF',
        fontSize: 14,
        borderRadius: 8,
        padding: '12px',
        margin: '0px'
      },
      properties: getDefaultProperties(type)
    }

    const updatedElements = [...elements, newElement]
    setElements(updatedElements)
    autoSave(updatedElements)
  }

  const getDefaultContent = (type: PageElement['type']): string => {
    switch (type) {
      case 'powerbi': return 'Power BI Report'
      case 'spreadsheet': return 'Spreadsheet View'
      case 'button': return 'Click Me'
      case 'text': return 'Sample Text'
      case 'image': return 'Image'
      case 'html': return '<div>Custom HTML</div>'
      default: return 'Element'
    }
  }

  const getDefaultWidth = (type: PageElement['type']): number => {
    switch (type) {
      case 'powerbi':
      case 'spreadsheet': return 800
      case 'button': return 120
      case 'text': return 200
      case 'image': return 200
      case 'html': return 300
      default: return 100
    }
  }

  const getDefaultHeight = (type: PageElement['type']): number => {
    switch (type) {
      case 'powerbi':
      case 'spreadsheet': return 600
      case 'button': return 40
      case 'text': return 30
      case 'image': return 150
      case 'html': return 200
      default: return 50
    }
  }

  const getDefaultProperties = (type: PageElement['type']) => {
    switch (type) {
      case 'powerbi':
      case 'spreadsheet':
        return { embedUrl: '' }
      case 'image':
        return { imageUrl: '', alt: 'Image' }
      case 'button':
        return { link: '#' }
      case 'html':
        return { html: '<div>Custom HTML Content</div>' }
      default:
        return {}
    }
  }

  const updateElement = (elementId: string, updates: Partial<PageElement>) => {
    const updatedElements = elements.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    )
    setElements(updatedElements)
    autoSave(updatedElements)
  }

  const deleteElement = (elementId: string) => {
    const updatedElements = elements.filter(el => el.id !== elementId)
    setElements(updatedElements)
    setSelectedElement(null)
    autoSave(updatedElements)
  }

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    if (!isEditMode) return

    e.preventDefault()
    setDraggedElement(elementId)
    setSelectedElement(elementId)

    const element = elements.find(el => el.id === elementId)
    if (!element) return

    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedElement || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const newX = e.clientX - containerRect.left - dragOffset.x
    const newY = e.clientY - containerRect.top - dragOffset.y

    updateElement(draggedElement, { 
      x: Math.max(0, newX), 
      y: Math.max(0, newY) 
    })
  }

  const handleMouseUp = () => {
    setDraggedElement(null)
  }

  const handleImageUpload = (elementId: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (e) => {
            const imageUrl = e.target?.result as string
            updateElement(elementId, {
              properties: { ...elements.find(el => el.id === elementId)?.properties, imageUrl }
            })
          }
          reader.readAsDataURL(file)
        }
      }
      fileInputRef.current.click()
    }
  }

  const renderElement = (element: PageElement) => {
    const commonProps = {
      key: element.id,
      style: {
        position: 'absolute' as const,
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        backgroundColor: element.styles.backgroundColor,
        color: element.styles.textColor,
        fontSize: element.styles.fontSize,
        borderRadius: element.styles.borderRadius,
        padding: element.styles.padding,
        margin: element.styles.margin,
        border: element.styles.border,
        cursor: isEditMode ? 'move' : 'default',
        zIndex: selectedElement === element.id ? 1000 : 1,
        boxShadow: selectedElement === element.id ? '0 0 0 2px #00f5ff' : 'none'
      },
      onMouseDown: (e: React.MouseEvent) => handleMouseDown(e, element.id),
      className: `${isEditMode ? 'draggable-element' : ''} transition-all duration-200`
    }

    switch (element.type) {
      case 'powerbi':
        return (
          <div {...commonProps} className={`${commonProps.className} border-2 border-blue-500/50`}>
            {element.properties?.embedUrl ? (
              <iframe
                src={element.properties.embedUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-blue-500/20 text-blue-400">
                <div className="text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-sm">Power BI Report</div>
                  <div className="text-xs opacity-70">Configure embed URL</div>
                </div>
              </div>
            )}
          </div>
        )

      case 'spreadsheet':
        return (
          <div {...commonProps} className={`${commonProps.className} border-2 border-green-500/50`}>
            {element.properties?.embedUrl ? (
              <iframe
                src={element.properties.embedUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-green-500/20 text-green-400">
                <div className="text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-sm">Spreadsheet</div>
                  <div className="text-xs opacity-70">Configure embed URL</div>
                </div>
              </div>
            )}
          </div>
        )

      case 'image':
        return (
          <div {...commonProps}>
            {element.properties?.imageUrl ? (
              <img
                src={element.properties.imageUrl}
                alt={element.properties?.alt || 'Image'}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div 
                className="flex items-center justify-center h-full bg-gray-500/20 text-gray-400 border-2 border-dashed border-gray-500/50 rounded cursor-pointer"
                onClick={() => isEditMode && handleImageUpload(element.id)}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🖼️</div>
                  <div className="text-sm">Click to upload</div>
                </div>
              </div>
            )}
          </div>
        )

      case 'button':
        return (
          <button
            {...commonProps}
            className={`${commonProps.className} flex items-center justify-center font-semibold hover:opacity-80 transition-opacity`}
            onClick={(e) => {
              if (!isEditMode && element.properties?.link) {
                window.open(element.properties.link, '_blank')
              }
              e.stopPropagation()
            }}
          >
            {element.content}
          </button>
        )

      case 'text':
        return (
          <div {...commonProps} className={`${commonProps.className} flex items-center font-medium`}>
            {element.content}
          </div>
        )

      case 'html':
        return (
          <div
            {...commonProps}
            dangerouslySetInnerHTML={{ __html: element.properties?.html || element.content }}
          />
        )

      default:
        return (
          <div {...commonProps} className={`${commonProps.className} border border-gray-500/50`}>
            {element.content}
          </div>
        )
    }
  }

  if (!isEditMode && elements.length === 0) {
    return null
  }

  return (
    <div className="relative w-full h-full">
      {/* Element Container */}
      <div
        ref={containerRef}
        className="relative w-full min-h-screen"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ pointerEvents: isEditMode ? 'auto' : 'none' }}
      >
        <div className="relative w-full h-full" style={{ pointerEvents: 'auto' }}>
          {elements.map(renderElement)}
        </div>
      </div>

      {/* Developer Toolbar */}
      {isEditMode && (
        <div className="fixed bottom-20 left-4 z-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 border border-gray-700"
          >
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => addElement('powerbi')}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium text-white transition-colors"
                title="Add Power BI"
              >
                📊 Power BI
              </button>
              <button
                onClick={() => addElement('spreadsheet')}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-xs font-medium text-white transition-colors"
                title="Add Spreadsheet"
              >
                📊 Spreadsheet
              </button>
              <button
                onClick={() => addElement('image')}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-xs font-medium text-white transition-colors"
                title="Add Image"
              >
                🖼️ Image
              </button>
              <button
                onClick={() => addElement('button')}
                className="px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded text-xs font-medium text-white transition-colors"
                title="Add Button"
              >
                🔘 Button
              </button>
              <button
                onClick={() => addElement('text')}
                className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-xs font-medium text-white transition-colors"
                title="Add Text"
              >
                📝 Text
              </button>
              <button
                onClick={() => addElement('html')}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-xs font-medium text-white transition-colors"
                title="Add HTML"
              >
                🔧 HTML
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Property Panel */}
      {selectedElement && isEditMode && (
        <PropertyPanel
          element={elements.find(el => el.id === selectedElement)!}
          onUpdate={(updates) => updateElement(selectedElement, updates)}
          onDelete={() => deleteElement(selectedElement)}
          onClose={() => setSelectedElement(null)}
          onImageUpload={() => handleImageUpload(selectedElement)}
        />
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Toast Notification */}
      {showToast && (
        <Toast 
          message={toastMessage} 
          type="success" 
          onClose={() => setShowToast(false)} 
          duration={1500} 
        />
      )}
    </div>
  )
}

// Property Panel Component
interface PropertyPanelProps {
  element: PageElement
  onUpdate: (updates: Partial<PageElement>) => void
  onDelete: () => void
  onClose: () => void
  onImageUpload: () => void
}

function PropertyPanel({ element, onUpdate, onDelete, onClose, onImageUpload }: PropertyPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-4 top-20 w-80 max-h-[80vh] overflow-y-auto bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700 p-4 z-50"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Edit {element.type}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
          <input
            type="text"
            value={element.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 text-sm"
          />
        </div>

        {/* Position & Size */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">X</label>
            <input
              type="number"
              value={element.x}
              onChange={(e) => onUpdate({ x: parseInt(e.target.value) || 0 })}
              className="w-full px-2 py-1 bg-gray-800/50 border border-gray-600 rounded text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Y</label>
            <input
              type="number"
              value={element.y}
              onChange={(e) => onUpdate({ y: parseInt(e.target.value) || 0 })}
              className="w-full px-2 py-1 bg-gray-800/50 border border-gray-600 rounded text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Width</label>
            <input
              type="number"
              value={element.width}
              onChange={(e) => onUpdate({ width: parseInt(e.target.value) || 100 })}
              className="w-full px-2 py-1 bg-gray-800/50 border border-gray-600 rounded text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Height</label>
            <input
              type="number"
              value={element.height}
              onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 50 })}
              className="w-full px-2 py-1 bg-gray-800/50 border border-gray-600 rounded text-white text-sm"
            />
          </div>
        </div>

        {/* Styles */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Background Color</label>
          <input
            type="color"
            value={element.styles.backgroundColor || '#000000'}
            onChange={(e) => onUpdate({ 
              styles: { ...element.styles, backgroundColor: e.target.value }
            })}
            className="w-full h-8 bg-gray-800/50 border border-gray-600 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Text Color</label>
          <input
            type="color"
            value={element.styles.textColor || '#ffffff'}
            onChange={(e) => onUpdate({ 
              styles: { ...element.styles, textColor: e.target.value }
            })}
            className="w-full h-8 bg-gray-800/50 border border-gray-600 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Font Size</label>
          <input
            type="number"
            value={element.styles.fontSize || 14}
            onChange={(e) => onUpdate({ 
              styles: { ...element.styles, fontSize: parseInt(e.target.value) || 14 }
            })}
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded text-white text-sm"
          />
        </div>

        {/* Type-specific properties */}
        {(element.type === 'powerbi' || element.type === 'spreadsheet') && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Embed URL</label>
            <textarea
              value={element.properties?.embedUrl || ''}
              onChange={(e) => onUpdate({ 
                properties: { ...element.properties, embedUrl: e.target.value }
              })}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 text-sm"
              rows={3}
              placeholder="Enter embed URL"
            />
          </div>
        )}

        {element.type === 'image' && (
          <div>
            <button
              onClick={onImageUpload}
              className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-medium transition-colors"
            >
              Upload Image
            </button>
            {element.properties?.imageUrl && (
              <div className="mt-2">
                <img 
                  src={element.properties.imageUrl} 
                  alt="Preview" 
                  className="w-full h-20 object-cover rounded"
                />
              </div>
            )}
          </div>
        )}

        {element.type === 'button' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Link URL</label>
            <input
              type="url"
              value={element.properties?.link || ''}
              onChange={(e) => onUpdate({ 
                properties: { ...element.properties, link: e.target.value }
              })}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 text-sm"
              placeholder="https://example.com"
            />
          </div>
        )}

        {element.type === 'html' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">HTML Content</label>
            <textarea
              value={element.properties?.html || element.content}
              onChange={(e) => onUpdate({ 
                properties: { ...element.properties, html: e.target.value }
              })}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 text-sm font-mono"
              rows={4}
              placeholder="<div>Your HTML here</div>"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2 pt-4 border-t border-gray-700">
          <button
            onClick={onDelete}
            className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition-colors"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </motion.div>
  )
}