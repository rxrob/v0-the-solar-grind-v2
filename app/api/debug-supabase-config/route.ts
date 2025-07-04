import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🔍 Debugging Supabase configuration...")

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Basic environment check
    const envCheck = {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlLength: supabaseUrl?.length || 0,
      keyLength: supabaseKey?.length || 0,
      urlPrefix: supabaseUrl?.substring(0, 20) || "missing",
      keyPrefix: supabaseKey?.substring(0, 10) || "missing",
    }

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: "Missing environment variables",
        envCheck,
        suggestion: "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file",
      })
    }

    // Format validation
    const formatCheck = {
      urlStartsWithHttps: supabaseUrl.startsWith("https://"),
      urlContainsSupabase: supabaseUrl.includes(".supabase.co"),
      keyStartsWithEyJ: supabaseKey.startsWith("eyJ"),
      urlFormat: supabaseUrl.startsWith("https://") && supabaseUrl.includes(".supabase.co"),
      keyFormat: supabaseKey.startsWith("eyJ"),
    }

    if (!formatCheck.urlFormat || !formatCheck.keyFormat) {
      return NextResponse.json({
        success: false,
        error: "Invalid format for Supabase credentials",
        envCheck,
        formatCheck,
        suggestion: "Check the format of your Supabase URL and API key",
      })
    }

    // Test basic connectivity
    console.log("Testing connectivity to:", supabaseUrl)

    const tests = []

    // Test 1: Basic URL reachability
    try {
      const basicResponse = await fetch(supabaseUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Supabase-Debug-Test",
        },
      })

      tests.push({
        name: "Basic URL Reachability",
        status: basicResponse.status < 500 ? "pass" : "fail",
        details: `HTTP ${basicResponse.status}`,
        contentType: basicResponse.headers.get("content-type"),
      })
    } catch (error) {
      tests.push({
        name: "Basic URL Reachability",
        status: "fail",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    }

    // Test 2: Auth endpoint
    try {
      const authResponse = await fetch(`${supabaseUrl}/auth/v1/settings`, {
        method: "GET",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
      })

      const authResponseText = await authResponse.text()

      tests.push({
        name: "Auth Endpoint",
        status: authResponse.ok ? "pass" : "fail",
        details: `HTTP ${authResponse.status}`,
        contentType: authResponse.headers.get("content-type"),
        responsePreview: authResponseText.substring(0, 100),
        isJson: authResponse.headers.get("content-type")?.includes("application/json"),
      })
    } catch (error) {
      tests.push({
        name: "Auth Endpoint",
        status: "fail",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    }

    // Test 3: REST endpoint
    try {
      const restResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: "GET",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
      })

      const restResponseText = await restResponse.text()

      tests.push({
        name: "REST Endpoint",
        status: restResponse.status < 500 ? "pass" : "fail",
        details: `HTTP ${restResponse.status}`,
        contentType: restResponse.headers.get("content-type"),
        responsePreview: restResponseText.substring(0, 100),
        isJson: restResponse.headers.get("content-type")?.includes("application/json"),
      })
    } catch (error) {
      tests.push({
        name: "REST Endpoint",
        status: "fail",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    }

    const passedTests = tests.filter((test) => test.status === "pass").length
    const totalTests = tests.length

    return NextResponse.json({
      success: passedTests === totalTests,
      summary: `${passedTests}/${totalTests} tests passed`,
      envCheck,
      formatCheck,
      tests,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({
      success: false,
      error: "Debug test failed",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
