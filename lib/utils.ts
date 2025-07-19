import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getURL = (path = "") => {
  // Check for Vercel-specific environment variables to determine the base URL
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production
    process.env.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel
    "http://localhost:3000/"
  // Make sure to include `https://` when not localhost.
  url = url.includes("http") ? url : `https://${url}`
  // Make sure to include a trailing `/`.
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`

  // Remove leading slash from path
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path

  // Use the URL constructor for robust URL creation
  return new URL(normalizedPath, url).toString()
}

/**
 * @deprecated Use getURL instead for more robust URL construction.
 * This function is kept for backward compatibility within the project.
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
