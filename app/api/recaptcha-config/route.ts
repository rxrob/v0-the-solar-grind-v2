import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const siteKey = process.env.RECAPTCHA_SITE_KEY

    if (!siteKey) {
      return NextResponse.json({ error: "reCAPTCHA not configured" }, { status: 500 })
    }

    return NextResponse.json({
      siteKey,
      enabled: true,
    })
  } catch (error) {
    console.error("Error getting reCAPTCHA config:", error)
    return NextResponse.json({ error: "Failed to get reCAPTCHA configuration" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "reCAPTCHA token is required" }, { status: 400 })
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY

    if (!secretKey) {
      return NextResponse.json({ error: "reCAPTCHA not configured" }, { status: 500 })
    }

    // Verify the reCAPTCHA token with Google
    const verifyResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    })

    const verifyData = await verifyResponse.json()

    if (!verifyData.success) {
      return NextResponse.json(
        {
          error: "reCAPTCHA verification failed",
          details: verifyData["error-codes"] || [],
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      score: verifyData.score || null,
      action: verifyData.action || null,
    })
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error)
    return NextResponse.json({ error: "Failed to verify reCAPTCHA" }, { status: 500 })
  }
}
