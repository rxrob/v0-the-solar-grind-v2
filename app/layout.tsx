import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { SiteNavigation } from "@/components/site-navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Solar Grind - Professional Solar Analysis Platform",
  description:
    "Advanced solar calculator and analysis tools for solar professionals. Get accurate system sizing, cost estimates, and professional reports.",
  keywords: "solar calculator, solar analysis, solar professional tools, solar system design, solar cost calculator",
  authors: [{ name: "Solar Grind" }],
  creator: "Solar Grind",
  publisher: "Solar Grind",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Solar Grind - Professional Solar Analysis Platform",
    description:
      "Advanced solar calculator and analysis tools for solar professionals. Get accurate system sizing, cost estimates, and professional reports.",
    siteName: "Solar Grind",
  },
  twitter: {
    card: "summary_large_image",
    title: "Solar Grind - Professional Solar Analysis Platform",
    description:
      "Advanced solar calculator and analysis tools for solar professionals. Get accurate system sizing, cost estimates, and professional reports.",
    creator: "@solargrind",
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
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <SiteNavigation />
          <main>{children}</main>
          <Toaster />
          <SonnerToaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
