import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const config = {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      urlFormat: supabaseUrl ? (supabaseUrl.includes("supabase.co") ? "Valid" : "Invalid") : "Missing",
      urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 50)}...` : "MISSING",
      keyPreview: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 30)}...` : "MISSING",
      keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0,
    }

    // Test connectivity if we have both values
    let connectivityTest = null
    if (supabaseUrl && supabaseAnonKey) {
      try {
        console.log("Testing connectivity to:", supabaseUrl)

        const testResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: "GET",
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
            "Content-Type": "application/json",
          },
        })

        const responseText = await testResponse.text()

        connectivityTest = {
          status: testResponse.status,
          statusText: testResponse.statusText,
          contentType: testResponse.headers.get("content-type"),
          responsePreview: responseText.substring(0, 200),
          isJson: testResponse.headers.get("content-type")?.includes("application/json"),
          success: testResponse.ok,
        }

        console.log("Connectivity test result:", connectivityTest)
      } catch (error) {
        connectivityTest = {
          error: error.message,
          success: false,
        }
      }
    }

    // Test auth endpoint specifically
    let authTest = null
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const authUrl = `${supabaseUrl}/auth/v1/settings`
        console.log("Testing auth endpoint:", authUrl)

        const authResponse = await fetch(authUrl, {
          method: "GET",
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
        })

        const authResponseText = await authResponse.text()

        authTest = {
          status: authResponse.status,
          statusText: authResponse.statusText,
          contentType: authResponse.headers.get("content-type"),
          responsePreview: authResponseText.substring(0, 200),
          success: authResponse.ok,
        }

        console.log("Auth test result:", authTest)
      } catch (error) {
        authTest = {
          error: error.message,
          success: false,
        }
      }
    }

    return NextResponse.json({
      config,
      connectivityTest,
      authTest,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Debug endpoint error:", error)
    return NextResponse.json(
      {
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
