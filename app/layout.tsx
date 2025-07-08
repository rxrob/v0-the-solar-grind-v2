import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { AnalyticsTracker } from "@/components/analytics-tracker"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MySolarAI - Advanced Solar Analysis Platform",
  description:
    "Professional solar analysis with AI-powered insights, real-time calculations, and comprehensive reporting.",
  keywords: ["solar", "AI", "renewable energy", "solar calculator", "solar analysis"],
  authors: [{ name: "MySolarAI Team" }],
  creator: "MySolarAI",
  publisher: "MySolarAI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  openGraph: {
    title: "MySolarAI - Advanced Solar Analysis Platform",
    description:
      "Professional solar analysis with AI-powered insights, real-time calculations, and comprehensive reporting.",
    url: "/",
    siteName: "MySolarAI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MySolarAI - Advanced Solar Analysis Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MySolarAI - Advanced Solar Analysis Platform",
    description:
      "Professional solar analysis with AI-powered insights, real-time calculations, and comprehensive reporting.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
            <SonnerToaster />
            <AnalyticsTracker />
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
