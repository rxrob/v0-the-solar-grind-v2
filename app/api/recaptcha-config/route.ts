import { NextResponse } from "next/server"
import { getServerConfig } from "@/lib/env-validation"

export async function GET() {
  try {
    const config = getServerConfig()

    return NextResponse.json(
      {
        configured: !!(config.recaptchaSiteKey && config.recaptchaSecretKey),
        hasSiteKey: !!config.recaptchaSiteKey,
        hasSecretKey: !!config.recaptchaSecretKey,
        siteKey: config.recaptchaSiteKey || null,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      },
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to get reCAPTCHA configuration", details: error.message },
      { status: 500 },
    )
  }
}
