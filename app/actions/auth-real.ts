"use server"

import { redirect } from "next/navigation"

export async function signUpReal(formData: FormData) {
  try {
    console.log("🔐 Starting user registration...")

    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    console.log("Registration data received:", {
      fullName,
      email,
      passwordProvided: !!password,
      passwordLength: password?.length || 0,
    })

    // Validate required fields
    if (!email || !password) {
      return {
        success: false,
        error: "Email and password are required",
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: "Invalid email format",
      }
    }

    // Validate password strength
    if (password.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters long",
      }
    }

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Missing Supabase environment variables")
      return {
        success: false,
        error: "Server configuration error - missing Supabase credentials",
        suggestion: "Check your .env.local file for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
      }
    }

    // Validate URL format
    if (!supabaseUrl.startsWith("https://") || !supabaseUrl.includes(".supabase.co")) {
      console.error("❌ Invalid Supabase URL format:", supabaseUrl)
      return {
        success: false,
        error: "Invalid Supabase URL format",
        details: `Expected https://your-project.supabase.co, got: ${supabaseUrl}`,
        suggestion: "Check your NEXT_PUBLIC_SUPABASE_URL environment variable",
      }
    }

    // Validate API key format
    if (!supabaseKey.startsWith("eyJ")) {
      console.error("❌ Invalid Supabase API key format")
      return {
        success: false,
        error: "Invalid Supabase API key format",
        details: "API key should start with 'eyJ'",
        suggestion: "Check your NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable",
      }
    }

    console.log("✅ Environment validation passed")

    // Test basic connectivity with raw fetch first
    console.log("🧪 Testing Supabase connectivity...")

    try {
      const testResponse = await fetch(`${supabaseUrl}/auth/v1/settings`, {
        method: "GET",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
      })

      console.log("Test response status:", testResponse.status)
      console.log("Test response content-type:", testResponse.headers.get("content-type"))

      if (!testResponse.ok) {
        const errorText = await testResponse.text()
        console.error("❌ Supabase connectivity test failed:", errorText.substring(0, 200))

        return {
          success: false,
          error: "Supabase connectivity test failed",
          details: `HTTP ${testResponse.status}: ${errorText.substring(0, 100)}`,
          suggestion: "Check your Supabase URL and API key configuration",
        }
      }

      console.log("✅ Basic connectivity test passed")
    } catch (connectivityError) {
      console.error("❌ Connectivity test error:", connectivityError)
      return {
        success: false,
        error: "Network error connecting to Supabase",
        details: connectivityError instanceof Error ? connectivityError.message : String(connectivityError),
        suggestion: "Check your internet connection and Supabase configuration",
      }
    }

    // Now try the actual signup with raw fetch to get better error details
    console.log("🔗 Attempting signup with raw fetch...")

    const signupPayload = {
      email: email.trim().toLowerCase(),
      password: password,
      data: {
        full_name: fullName || "",
      },
    }

    try {
      const signupResponse = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupPayload),
      })

      console.log("Signup response status:", signupResponse.status)
      console.log("Signup response content-type:", signupResponse.headers.get("content-type"))

      const responseText = await signupResponse.text()
      console.log("Raw response (first 200 chars):", responseText.substring(0, 200))

      if (!signupResponse.ok) {
        console.error("❌ Signup failed with status:", signupResponse.status)
        return {
          success: false,
          error: "Authentication signup failed",
          details: `HTTP ${signupResponse.status}: ${responseText.substring(0, 100)}`,
          rawResponse: responseText.substring(0, 500),
        }
      }

      // Try to parse the response
      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch (parseError) {
        console.error("❌ Failed to parse signup response as JSON:", parseError)
        return {
          success: false,
          error: "Invalid response format from Supabase",
          details: "Supabase returned non-JSON response",
          rawResponse: responseText.substring(0, 500),
          suggestion: "This usually indicates a configuration issue with your Supabase project",
        }
      }

      if (!responseData.user) {
        console.error("❌ No user in response:", responseData)
        return {
          success: false,
          error: "User creation failed - no user data returned",
          details: "Supabase returned success but no user object",
        }
      }

      console.log("✅ Auth user created:", responseData.user.id)

      // Now create user profile using raw fetch as well
      console.log("👤 Creating user profile in database...")

      const profilePayload = {
        id: responseData.user.id,
        email: responseData.user.email,
        full_name: fullName || "",
        subscription_type: "free",
        created_at: new Date().toISOString(),
      }

      try {
        const profileResponse = await fetch(`${supabaseUrl}/rest/v1/users`, {
          method: "POST",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify(profilePayload),
        })

        if (!profileResponse.ok) {
          const profileErrorText = await profileResponse.text()
          console.error("❌ Profile creation failed:", profileErrorText)
          return {
            success: true,
            message: "User account created successfully (profile setup had issues)",
            user: {
              id: responseData.user.id,
              email: responseData.user.email,
              fullName: fullName || "",
            },
            warning: "Profile creation encountered an issue but account is functional",
            profileError: profileErrorText.substring(0, 100),
          }
        }

        console.log("✅ User profile created successfully")
      } catch (profileError) {
        console.error("❌ Profile creation request failed:", profileError)
        return {
          success: true,
          message: "User account created successfully (profile setup had issues)",
          user: {
            id: responseData.user.id,
            email: responseData.user.email,
            fullName: fullName || "",
          },
          warning: "Profile creation failed but authentication account exists",
        }
      }

      return {
        success: true,
        message: "User account created successfully!",
        user: {
          id: responseData.user.id,
          email: responseData.user.email,
          fullName: fullName || "",
        },
      }
    } catch (signupError) {
      console.error("❌ Signup request failed:", signupError)

      if (signupError instanceof SyntaxError && signupError.message.includes("Unexpected token")) {
        return {
          success: false,
          error: "Invalid server response from Supabase",
          details: "Supabase returned HTML instead of JSON - this indicates a configuration issue",
          suggestion: "Double-check your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
          rawError: signupError.message,
        }
      }

      return {
        success: false,
        error: "Authentication request failed",
        details: signupError instanceof Error ? signupError.message : String(signupError),
      }
    }
  } catch (error) {
    console.error("💥 Unexpected error during signup:", error)
    return {
      success: false,
      error: "Unexpected error during registration",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function signInReal(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      return {
        success: false,
        error: "Email and password are required",
      }
    }

    // Use raw fetch for sign in as well
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return {
        success: false,
        error: "Server configuration error",
      }
    }

    const signinPayload = {
      email: email.trim().toLowerCase(),
      password: password,
    }

    const signinResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signinPayload),
    })

    if (!signinResponse.ok) {
      const errorText = await signinResponse.text()
      return {
        success: false,
        error: "Sign in failed",
        details: errorText.substring(0, 100),
      }
    }

    const responseData = await signinResponse.json()

    if (responseData.user) {
      redirect("/dashboard")
    }

    return {
      success: true,
      message: "Signed in successfully",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign in failed",
    }
  }
}

export async function signOutReal() {
  try {
    redirect("/")
  } catch (error) {
    console.error("Sign out error:", error)
  }
}
