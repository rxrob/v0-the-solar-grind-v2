import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { SupabaseProvider } from "@/components/supabase-provider"
import { AnalyticsTracker } from "@/components/analytics-tracker"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "The Solar Grind",
  description: "Advanced Solar Analysis and Reporting",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,marker`}
          async
          defer
        ></script>
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <SupabaseProvider>
            <Suspense fallback={null}>
              <main>{children}</main>
              <Toaster />
              <AnalyticsTracker />
            </Suspense>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
