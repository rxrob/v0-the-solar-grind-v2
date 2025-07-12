// ✅ Use default import for CommonJS compatibility
import bundleAnalyzer from "@next/bundle-analyzer"

// ✅ Get the correct function from the default import
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons", "lucide-react"],
    serverActions: true,
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: true,
    domains: ["maps.googleapis.com", "maps.gstatic.com"],
  },
  async headers() {
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https: *.googletagmanager.com *.google.com *.googleapis.com *.gstatic.com *.vercel.sh *.vercel.app;
      style-src 'self' 'unsafe-inline' https: *.googleapis.com;
      img-src 'self' blob: data: https: *.googleapis.com *.gstatic.com maps.google.com;
      font-src 'self' https: *.gstatic.com;
      frame-src 'self' https: *.google.com;
      connect-src 'self' https://v0chat.vercel.sh https://vercel.live https://vercel.com https://*.pusher.com https://blob.vercel-storage.com https://*.blob.vercel-storage.com https://blobs.vusercontent.net wss://*.pusher.com https://fides-vercel.us.fides.ethyca.com/api/v1/ https://cdn-api.ethyca.com/location https://privacy-vercel.us.fides.ethyca.com/api/v1/ https://api.getkoala.com https://*.sentry.io/api/ *.supabase.co wss://*.supabase.co *.googleapis.com maps.googleapis.com;
    `.replace(/\s{2,}/g, " ")
      .trim()

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: "/healthz",
        destination: "/api/health",
      },
    ]
  },
}

// ✅ Export the final wrapped config
export default withBundleAnalyzer(nextConfig)
