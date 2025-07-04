import { NextResponse } from "next/server"

export async function GET() {
  try {
    const siteKey = process.env.RECAPTCHA_SITE_KEY
    const secretKey = process.env.RECAPTCHA_SECRET_KEY

    const status = {
      configured: !!(siteKey && secretKey),
      siteKey: siteKey ? "Set" : "Missing",
      secretKey: secretKey ? "Set" : "Missing",
      endpoint: "/api/recaptcha-config",
      lastChecked: new Date().toISOString(),
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error("Error checking reCAPTCHA status:", error)
    return NextResponse.json(
      {
        configured: false,
        error: "Failed to check reCAPTCHA status",
        lastChecked: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
