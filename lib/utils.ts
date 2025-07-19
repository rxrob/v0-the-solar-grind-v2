import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"

  return new URL(path, baseUrl).toString()
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatNumber(num: number, decimals = 0) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Add the getURL function to the end of the file
export const getURL = (path = "") => {
  // Check for Vercel-specific environment variables to determine the base URL
  const baseURL = process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL
    : process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "http://localhost:3000"

  // Ensure the base URL has a trailing slash
  const normalizedBaseURL = baseURL.endsWith("/") ? baseURL : `${baseURL}/`

  // Ensure the path does not have a leading slash to prevent double slashes
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path

  return new URL(normalizedPath, normalizedBaseURL).toString()
}
