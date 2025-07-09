"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import PowerBIEmbed from "../../../components/powerbi-embed"

export default function ShipmentAnalysis() {
  return (
    <DashboardLayout title="Shipment Analysis">
      <PowerBIEmbed
        reportId="shipment-report-456"
        title="Shipment Analytics"
        // No embedUrl provided, so it will show placeholder
      />
    </DashboardLayout>
  )
}
