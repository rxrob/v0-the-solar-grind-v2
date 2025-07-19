import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Constructs a full, absolute URL for a given path.
 * This is essential for features like OAuth redirects and server-side rendering
 * where the application needs to know its own public URL.
 * This function is designed to be robust for Vercel's build environment.
 *
 * @param {string} [path=""] - The path to append to the base URL (e.g., "/dashboard").
 * @returns {string} The complete absolute URL.
 */
export function getURL(path = ""): string {
  // First, try to get the site URL from the user-defined environment variable.
  // This is the most reliable way to get the production domain.
  let baseURL = process.env.NEXT_PUBLIC_SITE_URL

  // If the site URL isn't set, try to use the Vercel-provided URL.
  // This is useful for preview deployments.
  if (!baseURL) {
    baseURL = process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : ""
  }

  // As a last resort, for local development, use localhost.
  if (!baseURL) {
    baseURL = "http://localhost:3000"
  }

  // Normalize the base URL to ensure it doesn't have a trailing slash.
  const normalizedBaseURL = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL

  // Normalize the path to ensure it has a leading slash.
  const normalizedPath = path.startsWith("/") ? path : `/${path}`

  return `${normalizedBaseURL}${normalizedPath}`
}

/**
 * A helper function for backwards compatibility in case other parts of the app
 * still reference `absoluteUrl`. It now uses the robust `getURL` logic.
 * @param path - The path to append to the base URL.
 * @returns The full absolute URL.
 */
export function absoluteUrl(path: string): string {
  return getURL(path)
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
