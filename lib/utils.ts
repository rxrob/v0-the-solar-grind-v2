import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Constructs an absolute URL for the given path.
 * This function is designed to be robust for Vercel deployments and local development.
 * @param path - The path to append to the base URL. Defaults to an empty string.
 * @returns The full absolute URL.
 */
export const getURL = (path = "") => {
  // 1. Attempt to use the user-defined site URL from environment variables.
  //    This is the most reliable method for production.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  // 2. Fallback to VERCEL_URL, which is automatically set by Vercel in deployments.
  //    This is ideal for preview deployments where the URL is dynamic.
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL

  // 3. As a final fallback for local development, use localhost.
  const localUrl = "http://localhost:3000"

  // Determine the base URL, prioritizing the explicit site URL, then Vercel's URL.
  const baseUrl = siteUrl || (vercelUrl ? `https://${vercelUrl}` : localUrl)

  // Use the native URL constructor to safely join the base URL and the path.
  // This handles trailing slashes and other edge cases automatically.
  const absoluteUrl = new URL(path, baseUrl).toString()

  return absoluteUrl
}

/**
 * A helper function for backwards compatibility in case other parts of the app
 * still reference `absoluteUrl`. It now uses the robust `getURL` logic.
 * @param path - The path to append to the base URL.
 * @returns The full absolute URL.
 */
export const absoluteUrl = (path: string) => {
  return getURL(path)
}
