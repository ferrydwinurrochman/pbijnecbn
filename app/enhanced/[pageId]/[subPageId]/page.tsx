"use client"

import { useSearchParams } from "next/navigation"
import DashboardLayout from "../../../../components/dashboard-layout"
import EnhancedPageRenderer from "../../../../components/enhanced-page-renderer"

interface EnhancedSubPageProps {
  params: {
    pageId: string
    subPageId: string
  }
}

export default function EnhancedSubPage({ params }: EnhancedSubPageProps) {
  const searchParams = useSearchParams()
  const isDeveloperMode = searchParams.get('dev') === 'true'

  return (
    <DashboardLayout title="Enhanced SubPage">
      <EnhancedPageRenderer 
        pageId={params.pageId} 
        subPageId={params.subPageId}
        isDeveloperMode={isDeveloperMode}
      />
    </DashboardLayout>
  )
}