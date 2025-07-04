import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        message: "Missing Supabase environment variables",
        details: {
          hasUrl: !!supabaseUrl,
          hasServiceKey: !!supabaseServiceKey,
        },
      })
    }

    console.log("🔄 Testing Supabase connection...")
    console.log("🔗 URL:", supabaseUrl)

    // Test basic connectivity
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: "GET",
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
    })

    const responseText = await response.text()
    console.log("📤 Response status:", response.status)
    console.log("📤 Response headers:", Object.fromEntries(response.headers.entries()))
    console.log("📤 Response text:", responseText.substring(0, 500))

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        message: `Supabase connection failed with status ${response.status}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          response: responseText.substring(0, 1000),
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Supabase connection successful",
      details: {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        response: responseText.substring(0, 500),
      },
    })
  } catch (error) {
    console.error("❌ Connection test error:", error)
    return NextResponse.json({
      success: false,
      message: "Connection test failed",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
