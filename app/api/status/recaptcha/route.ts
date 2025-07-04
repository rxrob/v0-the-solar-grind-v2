import { NextResponse } from "next/server"

export async function GET() {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

    if (!secretKey || !siteKey) {
      return NextResponse.json({
        status: "error",
        message: "reCAPTCHA keys not configured",
        details: {
          hasSecretKey: !!secretKey,
          hasSiteKey: !!siteKey,
        },
      })
    }

    return NextResponse.json({
      status: "success",
      message: "reCAPTCHA configured correctly",
      details: {
        hasSecretKey: true,
        hasSiteKey: true,
        siteKey: siteKey.substring(0, 10) + "...",
      },
    })
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Failed to check reCAPTCHA status",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
