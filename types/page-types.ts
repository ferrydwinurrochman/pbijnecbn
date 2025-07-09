export interface PageElement {
  id: string
  type: 'powerbi' | 'spreadsheet' | 'image' | 'text' | 'button' | 'html'
  content: string
  x: number
  y: number
  width: number
  height: number
  styles: {
    backgroundColor?: string
    textColor?: string
    fontSize?: number
    borderRadius?: number
    border?: string
    padding?: string
    margin?: string
  }
  properties?: {
    embedUrl?: string
    imageUrl?: string
    link?: string
    html?: string
    alt?: string
  }
}

export interface SubPage {
  id: string
  name: string
  type: 'powerbi' | 'spreadsheet'
  embedUrl: string
  elements: PageElement[]
  classification: string
  customHtml?: string
  createdAt: string
  updatedAt: string
}

export interface MainPage {
  id: string
  name: string
  description: string
  classification: string
  powerbiBadgeUrl?: string
  spreadsheetBadgeUrl?: string
  elements: PageElement[]
  subPages: SubPage[]
  customHtml?: string
  createdAt: string
  updatedAt: string
}

export interface PageCategory {
  id: string
  name: string
  color: string
  icon: string
}