import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Only return configuration status and public site key
    const hasRecaptchaSecret = !!process.env.RECAPTCHA_SECRET_KEY
    const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

    return NextResponse.json(
      {
        recaptcha: {
          available: hasRecaptchaSecret && !!recaptchaSiteKey,
          siteKey: recaptchaSiteKey || null,
          status: hasRecaptchaSecret && recaptchaSiteKey ? "configured" : "missing",
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
        },
      },
    )
  } catch (error) {
    console.error("reCAPTCHA config error:", error)
    return NextResponse.json(
      { error: "Configuration check failed" },
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
