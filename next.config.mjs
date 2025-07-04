/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.vercel.app"],
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'maps.googleapis.com',
      'maps.google.com',
      'streetviewpixels-pa.googleapis.com',
      'lh3.googleusercontent.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
        pathname: '/maps/api/streetview/**',
      },
      {
        protocol: 'https',
        hostname: 'maps.google.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'streetviewpixels-pa.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      }
    ],
    unoptimized: true,
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

export default nextConfig
