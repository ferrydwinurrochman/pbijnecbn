"use client"

import DynamicPageRouter from "../../../components/dynamic-page-router"

interface PageProps {
  params: {
    id: string
  }
}

export default function DynamicPage({ params }: PageProps) {
  return <DynamicPageRouter pageId={params.id} />
}
