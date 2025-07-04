"use server"

interface SignUpResponse {
  success: boolean
  message: string
  error?: string
  debug?: any
}

export async function signUpReal(email: string, password: string): Promise<SignUpResponse> {
  try {
    console.log("🔍 Starting signUpReal function...")

    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log("🔍 Environment check:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "MISSING",
      keyPreview: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : "MISSING",
    })

    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        success: false,
        message: "Missing Supabase configuration",
        error: "SUPABASE_CONFIG_MISSING",
      }
    }

    // Test basic connectivity first
    console.log("🔍 Testing Supabase connectivity...")
    try {
      const healthCheck = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: "GET",
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      })

      console.log("🔍 Health check response:", {
        status: healthCheck.status,
        statusText: healthCheck.statusText,
        contentType: healthCheck.headers.get("content-type"),
      })

      if (!healthCheck.ok) {
        const errorText = await healthCheck.text()
        console.log("🔍 Health check error response:", errorText.substring(0, 500))
        return {
          success: false,
          message: "Supabase connection failed",
          error: "SUPABASE_CONNECTION_FAILED",
          debug: {
            status: healthCheck.status,
            response: errorText.substring(0, 200),
          },
        }
      }
    } catch (connectError) {
      console.error("🔍 Connection test failed:", connectError)
      return {
        success: false,
        message: "Cannot reach Supabase",
        error: "SUPABASE_UNREACHABLE",
        debug: connectError,
      }
    }

    // Now attempt the actual signup
    console.log("🔍 Attempting signup with email:", email)

    const signupUrl = `${supabaseUrl}/auth/v1/signup`
    const signupPayload = {
      email,
      password,
      data: {},
    }

    console.log("🔍 Making signup request to:", signupUrl)

    const response = await fetch(signupUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify(signupPayload),
    })

    console.log("🔍 Signup response status:", response.status)
    console.log("🔍 Signup response headers:", {
      contentType: response.headers.get("content-type"),
      contentLength: response.headers.get("content-length"),
    })

    // Get the raw response text first
    const responseText = await response.text()
    console.log("🔍 Raw response text (first 500 chars):", responseText.substring(0, 500))

    // Try to parse as JSON
    let responseData
    try {
      responseData = JSON.parse(responseText)
      console.log("🔍 Parsed response data:", responseData)
    } catch (parseError) {
      console.error("🔍 JSON parse error:", parseError)
      return {
        success: false,
        message: "Invalid response from Supabase",
        error: "INVALID_JSON_RESPONSE",
        debug: {
          status: response.status,
          contentType: response.headers.get("content-type"),
          responsePreview: responseText.substring(0, 200),
          parseError: parseError.message,
        },
      }
    }

    if (!response.ok) {
      console.error("🔍 Signup failed with status:", response.status)
      return {
        success: false,
        message: responseData?.message || responseData?.error_description || "Signup failed",
        error: responseData?.error || "SIGNUP_FAILED",
        debug: responseData,
      }
    }

    console.log("✅ Signup successful!")
    return {
      success: true,
      message: "Account created successfully! Please check your email to verify your account.",
      debug: {
        userId: responseData?.user?.id,
        email: responseData?.user?.email,
      },
    }
  } catch (error) {
    console.error("🔍 Unexpected error in signUpReal:", error)
    return {
      success: false,
      message: "An unexpected error occurred",
      error: "UNEXPECTED_ERROR",
      debug: {
        errorMessage: error.message,
        errorStack: error.stack,
      },
    }
  }
}
