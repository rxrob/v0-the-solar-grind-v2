import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Only return configuration status, not actual keys
    const hasRecaptcha = !!process.env.RECAPTCHA_SECRET_KEY

    return NextResponse.json({
      success: true,
      recaptcha: {
        enabled: hasRecaptcha,
        configured: hasRecaptcha,
      },
    })
  } catch (error) {
    console.error("reCAPTCHA config error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get reCAPTCHA configuration",
        recaptcha: {
          enabled: false,
          configured: false,
        },
      },
      { status: 500 },
    )
  }
}
