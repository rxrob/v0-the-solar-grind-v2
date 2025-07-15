import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const siteKey = process.env.RECAPTCHA_SITE_KEY

  if (!siteKey) {
    return NextResponse.json({ error: "reCAPTCHA site key not configured" }, { status: 500 })
  }

  return NextResponse.json({ siteKey })
}

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "reCAPTCHA token is required" }, { status: 400 })
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ error: "reCAPTCHA secret key not configured" }, { status: 500 })
    }

    const verifyResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${secretKey}&response=${token}`,
    })

    const verifyData = await verifyResponse.json()

    return NextResponse.json({
      success: verifyData.success,
      score: verifyData.score,
      action: verifyData.action,
    })
  } catch (error) {
    console.error("reCAPTCHA verification error:", error)
    return NextResponse.json({ error: "Failed to verify reCAPTCHA" }, { status: 500 })
  }
}
