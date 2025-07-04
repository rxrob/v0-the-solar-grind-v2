import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log("🔍 Debug: Checking Supabase configuration...")

    // Check environment variables
    const envCheck = {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
      hasServiceKey: !!supabaseServiceKey,
      urlFormat: supabaseUrl ? (supabaseUrl.includes("supabase.co") ? "valid" : "invalid") : "missing",
      urlLength: supabaseUrl?.length || 0,
      anonKeyLength: supabaseAnonKey?.length || 0,
      serviceKeyLength: supabaseServiceKey?.length || 0,
    }

    console.log("📊 Environment check:", envCheck)

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        message: "Missing required environment variables",
        envCheck,
        tests: [],
      })
    }

    // Test different endpoints
    const tests = []

    // Test 1: Basic REST API health check
    try {
      console.log("🧪 Test 1: REST API health check")
      const restResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: "GET",
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      })

      const restText = await restResponse.text()
      console.log("📤 REST API Response:", restResponse.status, restText.substring(0, 200))

      tests.push({
        name: "REST API Health Check",
        success: restResponse.ok,
        status: restResponse.status,
        contentType: restResponse.headers.get("content-type"),
        response: restText.substring(0, 500),
      })
    } catch (error) {
      console.error("❌ REST API test failed:", error)
      tests.push({
        name: "REST API Health Check",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }

    // Test 2: Auth API health check
    try {
      console.log("🧪 Test 2: Auth API health check")
      const authResponse = await fetch(`${supabaseUrl}/auth/v1/health`, {
        method: "GET",
        headers: {
          apikey: supabaseServiceKey,
        },
      })

      const authText = await authResponse.text()
      console.log("📤 Auth API Response:", authResponse.status, authText.substring(0, 200))

      tests.push({
        name: "Auth API Health Check",
        success: authResponse.ok,
        status: authResponse.status,
        contentType: authResponse.headers.get("content-type"),
        response: authText.substring(0, 500),
      })
    } catch (error) {
      console.error("❌ Auth API test failed:", error)
      tests.push({
        name: "Auth API Health Check",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }

    // Test 3: Test signup endpoint (without actually signing up)
    try {
      console.log("🧪 Test 3: Signup endpoint test")
      const signupResponse = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseServiceKey,
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "invalid-test-password-that-should-fail",
        }),
      })

      const signupText = await signupResponse.text()
      console.log("📤 Signup API Response:", signupResponse.status, signupText.substring(0, 200))

      tests.push({
        name: "Signup Endpoint Test",
        success: signupResponse.status !== 500, // Any response other than 500 is good
        status: signupResponse.status,
        contentType: signupResponse.headers.get("content-type"),
        response: signupText.substring(0, 500),
        note: "This test uses invalid credentials and should fail gracefully",
      })
    } catch (error) {
      console.error("❌ Signup endpoint test failed:", error)
      tests.push({
        name: "Signup Endpoint Test",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }

    const allTestsPassed = tests.every((test) => test.success)

    return NextResponse.json({
      success: allTestsPassed,
      message: allTestsPassed ? "All Supabase tests passed" : "Some Supabase tests failed",
      envCheck,
      tests,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Debug configuration error:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to debug Supabase configuration",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
