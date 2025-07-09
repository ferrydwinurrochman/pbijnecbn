// Power BI Configuration Types
export interface PowerBIConfig {
  reportId: string
  embedUrl: string
  accessToken?: string
  tokenType?: "Aad" | "Embed"
}

// Power BI Event Types
export interface PowerBIEvents {
  loaded: () => void
  rendered: () => void
  error: (error: any) => void
}

// Default Power BI Settings
export const defaultPowerBISettings = {
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
}

// Power BI SDK Loader
export const loadPowerBISDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.powerbi) {
      resolve()
      return
    }

    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/powerbi-client@2.22.1/dist/powerbi.min.js"
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Failed to load Power BI SDK"))

    if (typeof document !== "undefined") {
      document.head.appendChild(script)
    }
  })
}
