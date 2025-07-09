"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { MainPage, SubPage, PageElement } from "../types/page-types"
import EnhancedVisualEditor from "./developer/enhanced-visual-editor"

interface EnhancedPageRendererProps {
  pageId: string
  subPageId?: string
  isDeveloperMode?: boolean
}

export default function EnhancedPageRenderer({ pageId, subPageId, isDeveloperMode = false }: EnhancedPageRendererProps) {
  const [page, setPage] = useState<MainPage | null>(null)
  const [subPage, setSubPage] = useState<SubPage | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadPageData()
  }, [pageId, subPageId])

  const loadPageData = () => {
    const pages: MainPage[] = JSON.parse(localStorage.getItem("enhancedPages") || "[]")
    const foundPage = pages.find(p => p.id === pageId)
    
    if (foundPage) {
      setPage(foundPage)
      
      if (subPageId) {
        const foundSubPage = foundPage.subPages.find(sp => sp.id === subPageId)
        setSubPage(foundSubPage || null)
      }
    }
    
    setLoading(false)
  }

  const handleSaveToDatabase = (action: string, data: any) => {
    console.log('Auto-save:', action, data)
    // This would typically save to a real database
  }

  const renderElement = (element: PageElement) => {
    const style = {
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
      zIndex: 1
    }

    switch (element.type) {
      case 'powerbi':
        return (
          <div key={element.id} style={style} className="border-2 border-blue-500/30">
            {element.properties?.embedUrl ? (
              <iframe
                src={element.properties.embedUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-blue-500/10 text-blue-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <div className="text-lg font-semibold">{element.content}</div>
                  <div className="text-sm opacity-70">Power BI Report</div>
                </div>
              </div>
            )}
          </div>
        )

      case 'spreadsheet':
        return (
          <div key={element.id} style={style} className="border-2 border-green-500/30">
            {element.properties?.embedUrl ? (
              <iframe
                src={element.properties.embedUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-green-500/10 text-green-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <div className="text-lg font-semibold">{element.content}</div>
                  <div className="text-sm opacity-70">Spreadsheet Data</div>
                </div>
              </div>
            )}
          </div>
        )

      case 'image':
        return (
          <div key={element.id} style={style}>
            {element.properties?.imageUrl ? (
              <img
                src={element.properties.imageUrl}
                alt={element.properties?.alt || 'Image'}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-500/10 text-gray-400 border-2 border-dashed border-gray-500/30 rounded">
                <div className="text-center">
                  <div className="text-2xl mb-2">🖼️</div>
                  <div className="text-sm">Image Placeholder</div>
                </div>
              </div>
            )}
          </div>
        )

      case 'button':
        return (
          <motion.button
            key={element.id}
            style={style}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center font-semibold hover:opacity-80 transition-all duration-300 shadow-lg"
            onClick={() => {
              if (element.properties?.link) {
                if (element.properties.link.startsWith('/')) {
                  router.push(element.properties.link)
                } else {
                  window.open(element.properties.link, '_blank')
                }
              }
            }}
          >
            {element.content}
          </motion.button>
        )

      case 'text':
        return (
          <div key={element.id} style={style} className="flex items-center font-medium">
            {element.content}
          </div>
        )

      case 'html':
        return (
          <div
            key={element.id}
            style={style}
            dangerouslySetInnerHTML={{ __html: element.properties?.html || element.content }}
          />
        )

      default:
        return (
          <div key={element.id} style={style} className="border border-gray-500/30 flex items-center justify-center">
            {element.content}
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white">Loading page...</p>
        </div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
          <p className="text-gray-400">The requested page could not be found.</p>
        </div>
      </div>
    )
  }

  const currentElements = subPage ? subPage.elements : page.elements
  const currentTitle = subPage ? subPage.name : page.name

  return (
    <div className="min-h-screen relative">
      {/* Developer Mode Controls */}
      {isDeveloperMode && (
        <div className="fixed top-4 right-4 z-50">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
              isEditMode
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                : "bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300"
            }`}
          >
            {isEditMode ? "🟢 Edit Mode ON" : "⚪ Edit Mode OFF"}
          </motion.button>
        </div>
      )}

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 p-4"
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white">{currentTitle}</h1>
          {subPage && (
            <div className="flex items-center space-x-2 mt-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                subPage.type === 'powerbi' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
              }`}>
                {subPage.type.toUpperCase()}
              </span>
              {subPage.classification && (
                <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs font-medium">
                  {subPage.classification}
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Page Layout */}
      {!subPage && (
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Default Main Page Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {page.subPages.map((sp, index) => (
                <motion.div
                  key={sp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="glass-morphism rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:shadow-cyan-400/20 transition-all duration-300"
                  onClick={() => router.push(`/page/${pageId}/${sp.id}${isDeveloperMode ? '?dev=true' : ''}`)}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      sp.type === 'powerbi' ? 'bg-blue-500/20' : 'bg-green-500/20'
                    }`}>
                      <span className="text-2xl">📊</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{sp.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        sp.type === 'powerbi' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                        {sp.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-gray-400 text-sm">
                    {sp.embedUrl ? 'Configured and ready' : 'Configuration pending'}
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-cyan-400 text-sm font-medium">Click to view →</span>
                    <div className={`w-3 h-3 rounded-full ${
                      sp.embedUrl ? 'bg-green-400' : 'bg-yellow-400'
                    }`}></div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Custom HTML Content */}
            {page.customHtml && (
              <div 
                className="mb-8"
                dangerouslySetInnerHTML={{ __html: page.customHtml }}
              />
            )}
          </div>
        </div>
      )}

      {/* Custom Elements Renderer */}
      <div className="relative">
        {currentElements.map(renderElement)}
      </div>

      {/* Visual Editor Overlay */}
      {isDeveloperMode && (
        <EnhancedVisualEditor
          pageId={pageId}
          pageType={subPage ? 'sub' : 'main'}
          subPageId={subPage?.id}
          isEditMode={isEditMode}
          onSaveToDatabase={handleSaveToDatabase}
        />
      )}

      {/* Custom HTML Content for SubPages */}
      {subPage && subPage.customHtml && (
        <div 
          className="p-6"
          dangerouslySetInnerHTML={{ __html: subPage.customHtml }}
        />
      )}
    </div>
  )
}

export default EnhancedPageRenderer