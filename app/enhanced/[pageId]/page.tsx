"use client"

import { useSearchParams } from "next/navigation"
import DashboardLayout from "../../../components/dashboard-layout"
import EnhancedPageRenderer from "../../../components/enhanced-page-renderer"

interface EnhancedPageProps {
  params: {
    pageId: string
  }
}

export default function EnhancedPage({ params }: EnhancedPageProps) {
  const searchParams = useSearchParams()
  const isDeveloperMode = searchParams.get('dev') === 'true'

  return (
    <DashboardLayout title="Enhanced Page">
      <EnhancedPageRenderer 
        pageId={params.pageId} 
        isDeveloperMode={isDeveloperMode}
      />
    </DashboardLayout>
  )
}