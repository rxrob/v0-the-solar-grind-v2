import { NextResponse } from "next/server"
import { getServerConfig } from "@/lib/env-validation"

export async function GET() {
  try {
    const config = getServerConfig()

    const status = {
      configured: !!(config.recaptchaSiteKey && config.recaptchaSecretKey),
      siteKeyConfigured: !!config.recaptchaSiteKey,
      secretKeyConfigured: !!config.recaptchaSecretKey,
      service: "reCAPTCHA",
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error("Error checking reCAPTCHA status:", error)
    return NextResponse.json(
      {
        configured: false,
        error: "Failed to check reCAPTCHA status",
        service: "reCAPTCHA",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
