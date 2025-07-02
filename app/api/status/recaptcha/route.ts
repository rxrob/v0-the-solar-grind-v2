import { NextResponse } from "next/server"

export async function GET() {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY

    if (!secretKey) {
      return NextResponse.json({
        service: "reCAPTCHA",
        status: "not_configured",
        message: "reCAPTCHA secret key not configured",
        configured: false,
      })
    }

    // Test reCAPTCHA API connectivity (without exposing the site key)
    try {
      const testResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: "test-token", // This will fail but tests connectivity
        }),
      })

      const testResult = await testResponse.json()

      return NextResponse.json({
        service: "reCAPTCHA",
        status: "configured",
        message: "reCAPTCHA API is accessible",
        configured: true,
        api_accessible: testResponse.ok,
        test_response: {
          success: testResult.success,
          // Don't expose error codes that might reveal configuration details
          has_errors: Array.isArray(testResult["error-codes"]) && testResult["error-codes"].length > 0,
        },
      })
    } catch (error: any) {
      return NextResponse.json({
        service: "reCAPTCHA",
        status: "error",
        message: "Failed to connect to reCAPTCHA API",
        configured: true,
        api_accessible: false,
        error: "Connection failed",
      })
    }
  } catch (error: any) {
    console.error("reCAPTCHA status check error:", error)
    return NextResponse.json(
      {
        service: "reCAPTCHA",
        status: "error",
        message: "Failed to check reCAPTCHA status",
        configured: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
