import { type NextRequest, NextResponse } from "next/server"
import { getServerConfig } from "@/lib/env-validation"

export async function GET(request: NextRequest) {
  try {
    const config = getServerConfig()

    // Only return the public site key, never the secret key
    return NextResponse.json(
      {
        siteKey: config.recaptchaSiteKey || null,
        configured: !!(config.recaptchaSiteKey && config.recaptchaSecretKey),
        status: "ready",
      },
      {
        headers: {
          "Cache-Control": "public, max-age=3600",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
        },
      },
    )
  } catch (error) {
    console.error("reCAPTCHA config error:", error)
    return NextResponse.json(
      {
        siteKey: null,
        configured: false,
        status: "error",
        error: "Configuration error",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
        },
      },
    )
  }
}
