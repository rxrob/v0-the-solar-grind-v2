import { NextResponse } from "next/server"
import { getServerConfig } from "@/lib/env-validation"

export async function GET() {
  try {
    const config = getServerConfig()

    // Only return the site key (public key) to the client
    if (!config.recaptchaSiteKey) {
      return NextResponse.json({ error: "reCAPTCHA not configured" }, { status: 503 })
    }

    return NextResponse.json({
      siteKey: config.recaptchaSiteKey,
      configured: true,
    })
  } catch (error) {
    console.error("Error getting reCAPTCHA config:", error)
    return NextResponse.json({ error: "Failed to get reCAPTCHA configuration" }, { status: 500 })
  }
}

// Verify reCAPTCHA token (server-side only)
export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "No reCAPTCHA token provided",
        },
        { status: 400 },
      )
    }

    const config = getServerConfig()

    if (!config.recaptchaSecretKey) {
      return NextResponse.json(
        {
          success: false,
          error: "reCAPTCHA is not properly configured",
        },
        { status: 500 },
      )
    }

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: config.recaptchaSecretKey!,
        response: token,
      }),
    })

    const data = await response.json()

    return NextResponse.json({
      success: data.success,
      score: data.score,
      action: data.action,
      timestamp: data.challenge_ts,
      errors: data["error-codes"] || [],
    })
  } catch (error) {
    console.error("reCAPTCHA verification error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to verify reCAPTCHA token",
      },
      { status: 500 },
    )
  }
}
