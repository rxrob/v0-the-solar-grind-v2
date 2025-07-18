import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AnalyticsProvider } from "@/components/analytics-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { UserTrackingProvider } from "@/components/user-tracking-provider"
import { Toaster } from "@/components/ui/toaster"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AnalyticsProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <UserTrackingProvider>
              <div className="relative flex min-h-screen flex-col">
                <Toaster />
                {children}
              </div>
            </UserTrackingProvider>
          </ThemeProvider>
        </AnalyticsProvider>
      </body>
    </html>
  )
}
