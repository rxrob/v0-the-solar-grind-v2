import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MySolarAI - AI-Powered Solar Analysis Platform",
  description:
    "Get instant, accurate solar analysis for any property. Professional-grade tools and insights to evaluate solar potential with confidence.",
  keywords: [
    "solar",
    "solar panels",
    "solar calculator",
    "solar analysis",
    "renewable energy",
    "AI",
    "solar potential",
  ],
  authors: [{ name: "MySolarAI Team" }],
  creator: "MySolarAI",
  publisher: "MySolarAI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://mysolarai.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MySolarAI - AI-Powered Solar Analysis Platform",
    description:
      "Get instant, accurate solar analysis for any property. Professional-grade tools and insights to evaluate solar potential with confidence.",
    url: "/",
    siteName: "MySolarAI",
    images: [
      {
        url: "/images/mysolarai-design.png",
        width: 1200,
        height: 630,
        alt: "MySolarAI - Solar Analysis Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MySolarAI - AI-Powered Solar Analysis Platform",
    description:
      "Get instant, accurate solar analysis for any property. Professional-grade tools and insights to evaluate solar potential with confidence.",
    images: ["/images/mysolarai-design.png"],
    creator: "@mysolarai",
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
    google: "your-google-verification-code",
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
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#f97316" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MySolarAI" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#f97316" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
          <Sonner />
        </ThemeProvider>
      </body>
    </html>
  )
}
