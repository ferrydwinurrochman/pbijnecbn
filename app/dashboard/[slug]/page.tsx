"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "../../../components/dashboard-layout"
import PowerBIEmbed from "../../../components/powerbi-embed"

interface Page {
  id: string
  title: string
  description: string
  embedUrl: string
  createdAt: string
}

interface DynamicDashboardProps {
  params: {
    slug: string
  }
}

export default function DynamicDashboard({ params }: DynamicDashboardProps) {
  const [page, setPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadPage = () => {
      // Handle built-in pages
      if (params.slug === "performance") {
        setPage({
          id: "performance",
          title: "Performance Analytics - HELLOBRANHOLIC",
          description: "Performance Dashboard",
          embedUrl:
            "https://app.powerbi.com/reportEmbed?reportId=21a0a736-2f97-48bd-af4d-9f6897139ff7&autoAuth=true&ctid=827ea450-686d-49d6-8fd8-801e6e5da931",
          createdAt: new Date().toISOString(),
        })
        setLoading(false)
        return
      }

      if (params.slug === "shipment") {
        setPage({
          id: "shipment",
          title: "Shipment Analysis",
          description: "Shipment Analytics Dashboard",
          embedUrl: "",
          createdAt: new Date().toISOString(),
        })
        setLoading(false)
        return
      }

      // Handle custom pages
      const pages: Page[] = JSON.parse(localStorage.getItem("adminPages") || "[]")
      const foundPage = pages.find((p) => p.id === params.slug)

      if (foundPage) {
        setPage(foundPage)
      } else {
        // Redirect to performance dashboard if page not found
        router.replace("/dashboard/performance")
        return
      }
      setLoading(false)
    }

    loadPage()
  }, [params.slug, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
          <p className="text-gray-400">The requested page could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout title={page.title}>
      <PowerBIEmbed reportId={page.id} title={page.title} embedUrl={page.embedUrl} />
    </DashboardLayout>
  )
}
