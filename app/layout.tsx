import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { SupabaseProvider } from "@/components/providers/supabase-provider"
import { AnalyticsTracker } from "@/components/analytics-tracker"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "The Solar Grind",
  description: "Advanced Solar Analysis and Reporting for Professionals",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SupabaseProvider>
            {children}
            <Toaster />
            <AnalyticsTracker />
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
