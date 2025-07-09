"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import PowerBIEmbed from "../../../components/powerbi-embed"

export default function PerformanceDashboard() {
  const performanceEmbedUrl =
    "https://app.powerbi.com/reportEmbed?reportId=21a0a736-2f97-48bd-af4d-9f6897139ff7&autoAuth=true&ctid=827ea450-686d-49d6-8fd8-801e6e5da931"

  return (
    <DashboardLayout title="Performance Dashboard">
      <PowerBIEmbed
        reportId="21a0a736-2f97-48bd-af4d-9f6897139ff7"
        title="Performance Analytics - HELLOBRANHOLIC"
        embedUrl={performanceEmbedUrl}
        accessToken="YOUR_ACCESS_TOKEN_HERE" // Add if you have an embed token
      />
    </DashboardLayout>
  )
}
