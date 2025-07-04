import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing environment variables",
          details: {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseAnonKey,
          },
        },
        { status: 400 },
      )
    }

    // Test multiple endpoints
    const tests = []

    // Test 1: Basic REST API
    try {
      const restResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      })

      const restText = await restResponse.text()
      tests.push({
        name: "REST API",
        url: `${supabaseUrl}/rest/v1/`,
        status: restResponse.status,
        success: restResponse.ok,
        contentType: restResponse.headers.get("content-type"),
        responsePreview: restText.substring(0, 100),
      })
    } catch (error) {
      tests.push({
        name: "REST API",
        success: false,
        error: error.message,
      })
    }

    // Test 2: Auth API
    try {
      const authResponse = await fetch(`${supabaseUrl}/auth/v1/settings`, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      })

      const authText = await authResponse.text()
      tests.push({
        name: "Auth API",
        url: `${supabaseUrl}/auth/v1/settings`,
        status: authResponse.status,
        success: authResponse.ok,
        contentType: authResponse.headers.get("content-type"),
        responsePreview: authText.substring(0, 100),
      })
    } catch (error) {
      tests.push({
        name: "Auth API",
        success: false,
        error: error.message,
      })
    }

    // Test 3: Try a simple signup test (without actually creating account)
    try {
      const signupResponse = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "invalid",
        }),
      })

      const signupText = await signupResponse.text()
      tests.push({
        name: "Signup Endpoint",
        url: `${supabaseUrl}/auth/v1/signup`,
        status: signupResponse.status,
        success: signupResponse.status !== 500, // Any response other than 500 is good
        contentType: signupResponse.headers.get("content-type"),
        responsePreview: signupText.substring(0, 200),
      })
    } catch (error) {
      tests.push({
        name: "Signup Endpoint",
        success: false,
        error: error.message,
      })
    }

    const allSuccessful = tests.every((test) => test.success)

    return NextResponse.json({
      success: allSuccessful,
      supabaseUrl: `${supabaseUrl.substring(0, 30)}...`,
      tests,
      summary: {
        total: tests.length,
        successful: tests.filter((t) => t.success).length,
        failed: tests.filter((t) => !t.success).length,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
