import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ServiceWorkerProvider } from "@/components/service-worker-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Weather PWA",
  description: "Modern weather app with offline capabilities",
  generator: "v0.app",
  manifest: "/manifest.json",
  themeColor: "#be123c",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Weather PWA",
  },
  icons: {
    icon: "/icon-192x192.jpg",
    apple: "/icon-192x192.jpg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ServiceWorkerProvider />
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
