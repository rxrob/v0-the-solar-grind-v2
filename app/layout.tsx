import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "MySolarAI - AI-Powered Solar Analysis & Calculator",
    template: "%s | MySolarAI",
  },
  description:
    "Get instant, accurate solar calculations with our advanced AI technology. Analyze your property, calculate savings, and generate professional reports in minutes.",
  keywords: [
    "solar calculator",
    "solar analysis",
    "solar panels",
    "renewable energy",
    "AI solar",
    "solar savings",
    "solar installation",
    "solar ROI",
    "solar reports",
    "NREL data",
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
    type: "website",
    locale: "en_US",
    url: "/",
    title: "MySolarAI - AI-Powered Solar Analysis & Calculator",
    description:
      "Get instant, accurate solar calculations with our advanced AI technology. Analyze your property, calculate savings, and generate professional reports in minutes.",
    siteName: "MySolarAI",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "MySolarAI - AI-Powered Solar Analysis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MySolarAI - AI-Powered Solar Analysis & Calculator",
    description:
      "Get instant, accurate solar calculations with our advanced AI technology. Analyze your property, calculate savings, and generate professional reports in minutes.",
    images: ["/images/twitter-image.png"],
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
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
          <SonnerToaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
