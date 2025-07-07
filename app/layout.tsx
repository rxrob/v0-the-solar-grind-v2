import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MySolarAI - Smart Solar Analysis Platform",
  description:
    "AI-powered solar potential analysis with real-time data, advanced calculations, and professional reports. Discover your home's solar savings potential in seconds.",
  keywords: "solar calculator, solar analysis, AI solar, solar savings, renewable energy, solar panels",
  authors: [{ name: "MySolarAI Team" }],
  openGraph: {
    title: "MySolarAI - Smart Solar Analysis Platform",
    description: "AI-powered solar potential analysis with real-time data and professional reports",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "MySolarAI - Smart Solar Analysis Platform",
    description: "AI-powered solar potential analysis with real-time data and professional reports",
  },
  robots: {
    index: true,
    follow: true,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
          <SonnerToaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
