import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { SiteNavigation } from "@/components/site-navigation"
import { UserTrackingProvider } from "@/components/user-tracking-provider"
import { AnalyticsProvider } from "@/components/analytics-provider"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "The Solar Grind - AI-Powered Solar Analysis",
  description:
    "Advanced AI-powered solar analysis with comprehensive energy modeling, financial projections, and personalized recommendations for your property.",
  keywords: "solar, solar panels, solar analysis, solar calculator, renewable energy, AI solar",
  authors: [{ name: "The Solar Grind Team" }],
  creator: "The Solar Grind",
  publisher: "The Solar Grind",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://thesolargrind.com"),
  openGraph: {
    title: "The Solar Grind - AI-Powered Solar Analysis",
    description:
      "Get comprehensive solar analysis with AI-powered calculations, financial modeling, and personalized recommendations.",
    url: "/",
    siteName: "The Solar Grind",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "The Solar Grind - Solar Analysis Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Solar Grind - AI-Powered Solar Analysis",
    description: "Get comprehensive solar analysis with AI-powered calculations and personalized recommendations.",
    images: ["/images/og-image.jpg"],
    creator: "@thesolargrind",
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AnalyticsProvider>
            <UserTrackingProvider>
              <Suspense fallback={null}>
                <div className="relative flex min-h-screen flex-col">
                  <SiteNavigation />
                  <main className="flex-1">{children}</main>
                </div>
                <Toaster />
                <SonnerToaster />
              </Suspense>
            </UserTrackingProvider>
          </AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
