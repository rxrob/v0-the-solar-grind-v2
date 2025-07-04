import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🧪 Testing Supabase connection...")

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: "Missing Supabase environment variables",
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey,
        },
        suggestion: "Check your .env.local file for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
      })
    }

    // Validate URL format
    const urlFormat = supabaseUrl.startsWith("https://") && supabaseUrl.includes(".supabase.co")
    const keyFormat = supabaseKey.startsWith("eyJ")

    if (!urlFormat || !keyFormat) {
      return NextResponse.json({
        success: false,
        error: "Invalid Supabase configuration format",
        details: {
          environment: {
            urlFormat,
            keyFormat,
            url: supabaseUrl.substring(0, 30) + "...",
            keyPrefix: supabaseKey.substring(0, 10) + "...",
          },
        },
        suggestion: "Check your Supabase URL and API key formats",
      })
    }

    // Test REST API connectivity with detailed response logging
    let restApiWorking = false
    let restApiError = ""
    let restApiResponse = ""
    try {
      const restResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: "GET",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
      })

      const responseText = await restResponse.text()
      restApiResponse = responseText.substring(0, 200)

      restApiWorking = restResponse.ok
      if (!restResponse.ok) {
        restApiError = `HTTP ${restResponse.status}: ${responseText.substring(0, 100)}`
      }
    } catch (error) {
      restApiError = error instanceof Error ? error.message : "Unknown error"
    }

    // Test Auth API connectivity with detailed response logging
    let authApiWorking = false
    let authApiError = ""
    let authApiResponse = ""
    try {
      const authResponse = await fetch(`${supabaseUrl}/auth/v1/settings`, {
        method: "GET",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
      })

      const responseText = await authResponse.text()
      authApiResponse = responseText.substring(0, 200)

      authApiWorking = authResponse.ok
      if (!authResponse.ok) {
        authApiError = `HTTP ${authResponse.status}: ${responseText.substring(0, 100)}`
      }
    } catch (error) {
      authApiError = error instanceof Error ? error.message : "Unknown error"
    }

    // Test a simple signup attempt to see what happens
    let signupTestWorking = false
    let signupTestError = ""
    let signupTestResponse = ""
    try {
      const signupResponse = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "test123",
        }),
      })

      const responseText = await signupResponse.text()
      signupTestResponse = responseText.substring(0, 200)

      // For signup, we expect either success or a specific error (like user already exists)
      // What we don't want is HTML or non-JSON responses
      const contentType = signupResponse.headers.get("content-type")
      const isJson = contentType?.includes("application/json")

      signupTestWorking = isJson || false
      if (!isJson) {
        signupTestError = `Non-JSON response: ${contentType}, Response: ${responseText.substring(0, 100)}`
      } else if (!signupResponse.ok) {
        // This is actually expected for test signup, so we'll mark it as working if it's JSON
        signupTestWorking = true
      }
    } catch (error) {
      signupTestError = error instanceof Error ? error.message : "Unknown error"
    }

    const success = restApiWorking && authApiWorking && signupTestWorking

    return NextResponse.json({
      success,
      message: success ? "All Supabase services are working" : "Some Supabase services have issues",
      details: {
        environment: {
          urlFormat,
          keyFormat,
        },
        restApiWorking,
        authApiWorking,
        signupTestWorking,
        restApiError: restApiError || undefined,
        authApiError: authApiError || undefined,
        signupTestError: signupTestError || undefined,
        responses: {
          restApi: restApiResponse || undefined,
          authApi: authApiResponse || undefined,
          signupTest: signupTestResponse || undefined,
        },
      },
    })
  } catch (error) {
    console.error("Connection test error:", error)
    return NextResponse.json({
      success: false,
      error: "Connection test failed",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
