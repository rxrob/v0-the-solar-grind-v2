import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MySolarAI - AI-Powered Solar Analysis",
  description:
    "Get instant, accurate solar calculations with our advanced AI technology. Analyze your property, calculate savings, and generate professional reports in minutes.",
  keywords: ["solar", "AI", "analysis", "calculator", "renewable energy", "solar panels", "energy savings"],
  authors: [{ name: "MySolarAI Team" }],
  creator: "MySolarAI",
  publisher: "MySolarAI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://mysolarai.vercel.app"),
  openGraph: {
    title: "MySolarAI - AI-Powered Solar Analysis",
    description:
      "Get instant, accurate solar calculations with our advanced AI technology. Analyze your property, calculate savings, and generate professional reports in minutes.",
    url: "/",
    siteName: "MySolarAI",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "MySolarAI - AI-Powered Solar Analysis",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MySolarAI - AI-Powered Solar Analysis",
    description: "Get instant, accurate solar calculations with our advanced AI technology.",
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
