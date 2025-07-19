import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { UserTrackingProvider } from "@/app/context/UserTrackingProvider"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "The Solar Grind | AI-Powered Solar Analysis",
  description:
    "Instant, accurate solar panel ROI calculations and AI-driven insights for your home or business. Make a smart, sustainable investment with The Solar Grind.",
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="stars"></div>
          <div className="twinkling"></div>
          <UserTrackingProvider>
            {children}
            <Toaster />
          </UserTrackingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
