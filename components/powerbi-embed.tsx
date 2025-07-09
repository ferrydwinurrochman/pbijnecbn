"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

interface PowerBIEmbedProps {
  reportId: string
  title: string
  embedUrl?: string
  accessToken?: string
}

declare global {
  interface Window {
    powerbi: any
    "powerbi-client": any
  }
}

export default function PowerBIEmbed({ reportId, title, embedUrl, accessToken }: PowerBIEmbedProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isRendered, setIsRendered] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const embedContainerRef = useRef<HTMLDivElement>(null)
  const reportRef = useRef<any>(null)

  useEffect(() => {
    // Load Power BI JavaScript SDK
    const loadPowerBIScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.powerbi) {
          resolve()
          return
        }

        const script = document.createElement("script")
        script.src = "https://cdn.jsdelivr.net/npm/powerbi-client@2.22.1/dist/powerbi.min.js"
        script.onload = () => resolve()
        script.onerror = () => reject(new Error("Failed to load Power BI SDK"))
        document.head.appendChild(script)
      })
    }

    const embedPowerBIReport = async () => {
      try {
        await loadPowerBIScript()

        if (!embedUrl || !embedContainerRef.current) {
          setError("Missing embed URL or container")
          setIsLoading(false)
          return
        }

        // Set up promises for loading and rendering events
        let loadedResolve: () => void
        let renderedResolve: () => void

        const reportLoaded = new Promise<void>((resolve) => {
          loadedResolve = resolve
        })

        const reportRendered = new Promise<void>((resolve) => {
          renderedResolve = resolve
        })

        // Get models from Power BI client
        const models = window["powerbi-client"].models

        // Create the embed configuration object
        const config = {
          type: "report",
          tokenType: accessToken ? models.TokenType.Embed : models.TokenType.Aad,
          accessToken: accessToken || "",
          embedUrl: embedUrl,
          id: reportId,
          permissions: models.Permissions.All,
          settings: {
            panes: {
              filters: {
                visible: true,
              },
              pageNavigation: {
                visible: true,
              },
            },
            bars: {
              statusBar: {
                visible: true,
              },
            },
          },
        }

        // Embed the report
        const report = window.powerbi.embed(embedContainerRef.current, config)
        reportRef.current = report

        // Set up event handlers
        report.off("loaded")
        report.on("loaded", () => {
          console.log("Power BI report loaded")
          setIsLoading(false)
          loadedResolve()
          report.off("loaded")
        })

        report.off("error")
        report.on("error", (event: any) => {
          console.error("Power BI report error:", event.detail)
          setError("Failed to load Power BI report")
          setIsLoading(false)
        })

        report.off("rendered")
        report.on("rendered", () => {
          console.log("Power BI report rendered")
          setIsRendered(true)
          renderedResolve()
          report.off("rendered")
        })

        // Wait for report to load and render
        await reportLoaded
        console.log("Report loaded successfully")

        await reportRendered
        console.log("Report rendered successfully")
      } catch (err) {
        console.error("Error embedding Power BI report:", err)
        setError("Failed to embed Power BI report")
        setIsLoading(false)
      }
    }

    if (embedUrl) {
      embedPowerBIReport()
    } else {
      setIsLoading(false)
    }

    // Cleanup function
    return () => {
      if (reportRef.current) {
        try {
          reportRef.current.off("loaded")
          reportRef.current.off("error")
          reportRef.current.off("rendered")
        } catch (err) {
          console.warn("Error cleaning up Power BI report:", err)
        }
      }
    }
  }, [embedUrl, reportId, accessToken])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="modern-card shadow-2xl"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        <div className="h-1 w-20 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full"></div>
      </motion.div>

      <div className="relative h-[600px] rounded-lg overflow-hidden">
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-gray-800/50 backdrop-blur-sm z-10"
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue mx-auto mb-4"></div>
              <p className="text-gray-300">Loading Power BI Report...</p>
              <p className="text-gray-500 text-sm mt-2">
                {embedUrl ? "Connecting to Power BI Service" : "Initializing SDK"}
              </p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-red-900/20 backdrop-blur-sm z-10"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Report</h3>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Power BI Embed Container */}
        {embedUrl ? (
          <div
            ref={embedContainerRef}
            id="embedContainer"
            className="w-full h-full rounded-lg"
            style={{ minHeight: "600px" }}
          />
        ) : (
          /* Placeholder for reports without embed URL */
          <div className="w-full h-full bg-gray-800 rounded-lg border border-gray-600 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Power BI Report</h3>
              <p className="text-gray-400 text-sm">Report ID: {reportId}</p>
              <p className="text-gray-500 text-xs mt-2">Embed URL not provided</p>
            </div>
          </div>
        )}

        {/* Loading indicator for rendering */}
        {!isLoading && !error && !isRendered && embedUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-4 right-4 bg-gray-800/80 rounded-lg p-2 z-10"
          >
            <div className="flex items-center space-x-2">
              <div className="animate-pulse w-2 h-2 bg-neon-blue rounded-full"></div>
              <span className="text-xs text-gray-300">Rendering...</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
