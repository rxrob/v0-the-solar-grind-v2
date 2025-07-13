import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Return only the site key from server-side environment
    const siteKey = process.env.RECAPTCHA_SITE_KEY

    if (!siteKey) {
      return NextResponse.json({ error: "reCAPTCHA site key not configured" }, { status: 500 })
    }

    return NextResponse.json({
      siteKey,
      version: "v2",
    })
  } catch (error) {
    console.error("reCAPTCHA config error:", error)
    return NextResponse.json({ error: "Failed to get reCAPTCHA configuration" }, { status: 500 })
  }
}
