import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Constructs a full, absolute URL for a given path.
 * This is essential for features like OAuth redirects and server-side rendering
 * where the application needs to know its own public URL.
 * This function is designed to be robust and safe for Vercel's build environment.
 *
 * @param {string} [path=""] - The path to append to the base URL (e.g., "/dashboard").
 * @returns {string} The complete absolute URL.
 */
export function getURL(path = ""): string {
  // 1. Get the base URL from environment variables.
  // Use optional chaining and the nullish coalescing operator for safety.
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // User-set production URL (most reliable).
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Vercel-set URL for preview deployments.
    "http://localhost:3000" // Fallback for local development.

  // 2. Ensure the URL has a protocol.
  // VERCEL_URL does not include it, so we add it here.
  url = url.startsWith("http") ? url : `https://${url}`

  // 3. Ensure the base URL does not have a trailing slash.
  // This prevents double slashes when joining with the path.
  url = url.endsWith("/") ? url.slice(0, -1) : url

  // 4. Ensure the path starts with a slash.
  const normalizedPath = path.startsWith("/") ? path : `/${path}`

  return url + normalizedPath
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
