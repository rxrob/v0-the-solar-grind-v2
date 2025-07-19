import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Constructs a full, absolute URL for a given path.
 * This is essential for features like OAuth redirects and server-side rendering
 * where the application needs to know its own public URL.
 *
 * @param {string} [path=""] - The path to append to the base URL (e.g., "/dashboard").
 * @returns {string} The complete absolute URL.
 */
export const getURL = (path = "") => {
  // Determine the base URL using Vercel's system environment variables.
  // `NEXT_PUBLIC_SITE_URL` is the preferred, user-set variable for the production domain.
  // `NEXT_PUBLIC_VERCEL_URL` is automatically set by Vercel for preview deployments.
  // Fallback to localhost for local development.
  const baseURL =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "http://localhost:3000")

  // Use the native URL constructor for robust and safe URL creation.
  // This handles trailing slashes and other edge cases automatically.
  return new URL(path, baseURL).toString()
}

/**
 * A helper function for backwards compatibility in case other parts of the app
 * still reference `absoluteUrl`. It now uses the robust `getURL` logic.
 * @param path - The path to append to the base URL.
 * @returns The full absolute URL.
 */
export function absoluteUrl(path: string) {
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
