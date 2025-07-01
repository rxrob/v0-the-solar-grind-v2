import { NextResponse } from "next/server"

export async function GET() {
  const startTime = Date.now()

  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

    if (!secretKey || !siteKey) {
      return NextResponse.json({
        name: "reCAPTCHA Security",
        category: "Security",
        endpoint: "/api/status/recaptcha",
        critical: false,
        status: "error",
        message: "reCAPTCHA keys not configured",
        response_time: Date.now() - startTime,
        details: {
          secret_key_configured: !!secretKey,
          site_key_configured: !!siteKey,
          error: "RECAPTCHA_SECRET_KEY or NEXT_PUBLIC_RECAPTCHA_SITE_KEY not set",
        },
        timestamp: new Date().toISOString(),
        http_status: 500,
      })
    }

    // Test reCAPTCHA API accessibility (without actual verification)
    const testUrl = "https://www.google.com/recaptcha/api/siteverify"
    const testResponse = await fetch(testUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${secretKey}&response=test`,
    })

    const responseTime = Date.now() - startTime

    if (!testResponse.ok) {
      return NextResponse.json({
        name: "reCAPTCHA Security",
        category: "Security",
        endpoint: "/api/status/recaptcha",
        critical: false,
        status: "error",
        message: `reCAPTCHA API unreachable: ${testResponse.status}`,
        response_time: responseTime,
        details: {
          http_status: testResponse.status,
          error: "Cannot reach Google reCAPTCHA API",
        },
        timestamp: new Date().toISOString(),
        http_status: testResponse.status,
      })
    }

    const data = await testResponse.json()

    // Expected response for test token should be success: false
    // This confirms the API is reachable and responding
    return NextResponse.json({
      name: "reCAPTCHA Security",
      category: "Security",
      endpoint: "/api/status/recaptcha",
      critical: false,
      status: "healthy",
      message: "reCAPTCHA API accessible and configured",
      response_time: responseTime,
      details: {
        api_reachable: true,
        keys_configured: true,
        site_key_prefix: siteKey.substring(0, 10) + "...",
        test_response_received: !!data,
      },
      timestamp: new Date().toISOString(),
      http_status: 200,
    })
  } catch (error) {
    return NextResponse.json({
      name: "reCAPTCHA Security",
      category: "Security",
      endpoint: "/api/status/recaptcha",
      critical: false,
      status: "error",
      message: `Request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      response_time: Date.now() - startTime,
      details: { error: error instanceof Error ? error.message : "Unknown error" },
      timestamp: new Date().toISOString(),
      http_status: 500,
    })
  }
}
