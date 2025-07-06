import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SolarGrind AI | Smarter Solar Starts Here",
  description:
    "Professional solar analysis powered by AI and real government data. Get instant, accurate solar calculations with NREL PVWatts integration and Google Maps analysis.",
  keywords:
    "solar calculator, solar analysis, NREL PVWatts, solar panels, renewable energy, solar savings, solar installation, solar professionals",
  authors: [{ name: "SolarGrind Team" }],
  creator: "SolarGrind",
  publisher: "SolarGrind",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://mysolarai.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SolarGrind AI | Professional Solar Analysis",
    description:
      "Get instant, accurate solar calculations with AI-powered analysis. Professional reports for homeowners and solar professionals.",
    url: "/",
    siteName: "SolarGrind",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SolarGrind - Professional Solar Analysis",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SolarGrind AI | Professional Solar Analysis",
    description: "Get instant, accurate solar calculations with AI-powered analysis.",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://maps.googleapis.com" />
        <link rel="preconnect" href="https://api.nrel.gov" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f97316" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SolarGrind" />
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

        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true" && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_title: document.title,
                  page_location: window.location.href,
                });
              `}
            </Script>
          </>
        )}

        {/* Axiom Analytics */}
        {process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT && process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true" && (
          <Script id="axiom-analytics" strategy="afterInteractive">
            {`
              (function() {
                const axiom = {
                  ingest: function(data) {
                    fetch('/api/axiom', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data)
                    }).catch(console.error);
                  }
                };
                
                // Track page views
                axiom.ingest({
                  event: 'page_view',
                  path: window.location.pathname,
                  referrer: document.referrer,
                  timestamp: new Date().toISOString(),
                  user_agent: navigator.userAgent
                });
                
                // Track clicks on CTA buttons
                document.addEventListener('click', function(e) {
                  const target = e.target.closest('a[href*="/calculator"], a[href*="/pro-calculator"], a[href*="/pricing"], a[href*="/signup"]');
                  if (target) {
                    axiom.ingest({
                      event: 'cta_click',
                      element: target.textContent.trim(),
                      href: target.href,
                      timestamp: new Date().toISOString()
                    });
                  }
                });
                
                window.axiom = axiom;
              })();
            `}
          </Script>
        )}
      </body>
    </html>
  )
}
