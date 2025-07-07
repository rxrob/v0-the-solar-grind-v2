import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Solar Grind - Professional Solar Calculator & Analysis",
    template: "%s | Solar Grind",
  },
  description:
    "Professional solar panel calculator with advanced analysis, NREL integration, and comprehensive reporting. Get accurate solar estimates for residential and commercial properties.",
  keywords: ["solar calculator", "solar panels", "renewable energy", "solar analysis", "NREL", "solar estimates"],
  authors: [{ name: "Solar Grind Team" }],
  creator: "Solar Grind",
  publisher: "Solar Grind",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://solargrind.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Solar Grind - Professional Solar Calculator",
    description:
      "Get accurate solar panel estimates with our professional calculator featuring NREL integration and advanced analysis.",
    siteName: "Solar Grind",
  },
  twitter: {
    card: "summary_large_image",
    title: "Solar Grind - Professional Solar Calculator",
    description:
      "Get accurate solar panel estimates with our professional calculator featuring NREL integration and advanced analysis.",
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
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.stripe.com" />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        <link rel="dns-prefetch" href="https://developer.nrel.gov" />
      </head>
      <body className={inter.className}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
            <SonnerToaster />
            <Analytics />
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
