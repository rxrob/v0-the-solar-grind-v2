import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SolarGrind - Professional Solar Analysis Platform",
  description:
    "Advanced solar analysis tools powered by NREL data, Google Maps integration, and professional reporting. Maximize your solar investment with accurate assessments.",
  keywords:
    "solar analysis, solar calculator, NREL data, solar potential, renewable energy, solar panels, energy assessment",
  authors: [{ name: "SolarGrind Team" }],
  creator: "SolarGrind",
  publisher: "SolarGrind",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  openGraph: {
    title: "SolarGrind - Professional Solar Analysis Platform",
    description: "Advanced solar analysis tools powered by NREL data and professional reporting.",
    url: "/",
    siteName: "SolarGrind",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SolarGrind - Professional Solar Analysis Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SolarGrind - Professional Solar Analysis Platform",
    description: "Advanced solar analysis tools powered by NREL data and professional reporting.",
    images: ["/og-image.png"],
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
          <SonnerToaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
