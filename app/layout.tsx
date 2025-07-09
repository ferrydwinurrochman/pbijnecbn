import type React from "react"
import type { Metadata } from "next"
import { Orbitron, Space_Mono } from "next/font/google"
import "./globals.css"

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
})

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
})

export const metadata: Metadata = {
  title: "JNE Express - Futuristic Dashboard",
  description: "Advanced analytics dashboard for JNE Express",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${orbitron.variable} ${spaceMono.variable} font-orbitron bg-gray-900 text-white`}>
        {children}
      </body>
    </html>
  )
}
