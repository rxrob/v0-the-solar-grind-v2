import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MySolarAI - AI-Powered Solar Analysis",
  description:
    "Discover your solar potential with advanced AI technology. Get instant calculations, professional reports, and accurate savings estimates.",
  keywords: ["solar", "AI", "renewable energy", "solar calculator", "solar analysis", "solar savings"],
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
    title: "MySolarAI - AI-Powered Solar Analysis",
    description:
      "Discover your solar potential with advanced AI technology. Get instant calculations, professional reports, and accurate savings estimates.",
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
    description:
      "Discover your solar potential with advanced AI technology. Get instant calculations, professional reports, and accurate savings estimates.",
    images: ["/images/og-image.png"],
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
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="relative flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
          <SonnerToaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
