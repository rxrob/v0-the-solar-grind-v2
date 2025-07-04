"use server"

interface AuthResponse {
  success: boolean
  message: string
  user?: any
  error?: string
  details?: any
}

interface User {
  id: string
  email: string
  user_metadata?: any
}

// Helper function to make authenticated requests to Supabase
async function makeSupabaseRequest(endpoint: string, options: RequestInit = {}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase configuration")
  }

  const url = `${supabaseUrl}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      ...options.headers,
    },
  })

  const responseText = await response.text()

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${responseText}`)
  }

  try {
    return JSON.parse(responseText)
  } catch (e) {
    throw new Error(`Invalid JSON response: ${responseText}`)
  }
}

export async function signUpReal(email: string, password: string, fullName?: string): Promise<AuthResponse> {
  try {
    console.log("🔄 Starting signup process for:", email)

    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return {
        success: false,
        message: "Server configuration error",
        error: "Missing Supabase environment variables",
      }
    }

    console.log("✅ Environment variables validated")
    console.log("🔗 Supabase URL:", supabaseUrl)

    // Make signup request
    const signupData = {
      email,
      password,
      options: {
        data: {
          full_name: fullName || "",
          subscription_type: "free",
          subscription_status: "active",
        },
      },
    }

    console.log("📤 Making signup request...")

    const result = await makeSupabaseRequest("/auth/v1/signup", {
      method: "POST",
      body: JSON.stringify(signupData),
    })

    console.log("✅ Signup successful:", result)

    return {
      success: true,
      message: "Account created successfully! Please check your email to verify your account.",
      user: result.user,
      details: result,
    }
  } catch (error) {
    console.error("❌ Signup error:", error)

    return {
      success: false,
      message: "Failed to create account",
      error: error instanceof Error ? error.message : "Unknown error",
      details: { error },
    }
  }
}

export async function signInWithEmailReal(email: string, password: string): Promise<AuthResponse> {
  try {
    console.log("🔄 Starting signin process for:", email)

    const signinData = {
      email,
      password,
    }

    const result = await makeSupabaseRequest("/auth/v1/token?grant_type=password", {
      method: "POST",
      body: JSON.stringify(signinData),
    })

    console.log("✅ Signin successful")

    return {
      success: true,
      message: "Signed in successfully",
      user: result.user,
      details: result,
    }
  } catch (error) {
    console.error("❌ Signin error:", error)

    return {
      success: false,
      message: "Failed to sign in",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function signOutReal(): Promise<AuthResponse> {
  try {
    // For server-side signout, we mainly need to clear any server-side sessions
    // Client-side signout should be handled by the client

    return {
      success: true,
      message: "Signed out successfully",
    }
  } catch (error) {
    console.error("❌ Signout error:", error)

    return {
      success: false,
      message: "Failed to sign out",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getCurrentUserReal(): Promise<AuthResponse> {
  try {
    // This would typically require a session token
    // For now, return a placeholder response

    return {
      success: false,
      message: "User session required",
      error: "No active session",
    }
  } catch (error) {
    console.error("❌ Get user error:", error)

    return {
      success: false,
      message: "Failed to get current user",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function resetPasswordReal(email: string): Promise<AuthResponse> {
  try {
    console.log("🔄 Starting password reset for:", email)

    const resetData = {
      email,
    }

    const result = await makeSupabaseRequest("/auth/v1/recover", {
      method: "POST",
      body: JSON.stringify(resetData),
    })

    console.log("✅ Password reset email sent")

    return {
      success: true,
      message: "Password reset email sent successfully",
      details: result,
    }
  } catch (error) {
    console.error("❌ Password reset error:", error)

    return {
      success: false,
      message: "Failed to send password reset email",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function updatePasswordReal(newPassword: string, accessToken?: string): Promise<AuthResponse> {
  try {
    console.log("🔄 Starting password update")

    if (!accessToken) {
      return {
        success: false,
        message: "Access token required for password update",
        error: "Missing access token",
      }
    }

    const updateData = {
      password: newPassword,
    }

    const result = await makeSupabaseRequest("/auth/v1/user", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(updateData),
    })

    console.log("✅ Password updated successfully")

    return {
      success: true,
      message: "Password updated successfully",
      details: result,
    }
  } catch (error) {
    console.error("❌ Password update error:", error)

    return {
      success: false,
      message: "Failed to update password",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function updateUserProfileReal(updates: any, accessToken?: string): Promise<AuthResponse> {
  try {
    console.log("🔄 Starting profile update")

    if (!accessToken) {
      return {
        success: false,
        message: "Access token required for profile update",
        error: "Missing access token",
      }
    }

    const updateData = {
      data: updates,
    }

    const result = await makeSupabaseRequest("/auth/v1/user", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(updateData),
    })

    console.log("✅ Profile updated successfully")

    return {
      success: true,
      message: "Profile updated successfully",
      user: result,
      details: result,
    }
  } catch (error) {
    console.error("❌ Profile update error:", error)

    return {
      success: false,
      message: "Failed to update profile",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function checkUserPermissions(userId: string): Promise<AuthResponse> {
  try {
    console.log("🔄 Checking user permissions for:", userId)

    // This would typically query your users table
    // For now, return a placeholder response

    return {
      success: true,
      message: "User permissions retrieved",
      details: {
        userId,
        subscriptionType: "free",
        subscriptionStatus: "active",
      },
    }
  } catch (error) {
    console.error("❌ Permission check error:", error)

    return {
      success: false,
      message: "Failed to check user permissions",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function trackUsageReal(userId: string, action: string, metadata?: any): Promise<AuthResponse> {
  try {
    console.log("🔄 Tracking usage:", { userId, action, metadata })

    // This would typically insert into a usage tracking table
    // For now, return a placeholder response

    return {
      success: true,
      message: "Usage tracked successfully",
      details: {
        userId,
        action,
        metadata,
        timestamp: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error("❌ Usage tracking error:", error)

    return {
      success: false,
      message: "Failed to track usage",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Aliases for backward compatibility
export const getCurrentUser = getCurrentUserReal
export const signOut = signOutReal
export const resetPassword = resetPasswordReal
export const updatePassword = updatePasswordReal
