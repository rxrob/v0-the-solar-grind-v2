import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("🔍 Running database diagnostic...")
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      },
    )

    const tests = []

    // Test 1: Basic connection
    try {
      const { error } = await supabase.from("users").select("count", { count: "exact", head: true })
      tests.push({
        name: "Database Connection",
        status: error ? "fail" : "pass",
        details: error?.message,
      })
    } catch (error) {
      tests.push({
        name: "Database Connection",
        status: "fail",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    }

    // Test 2: Users table structure
    try {
      await supabase.from("users").select("*").limit(1)
      tests.push({
        name: "Users Table Access",
        status: "pass",
        details: null,
      })
    } catch (error) {
      tests.push({
        name: "Users Table Access",
        status: "fail",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    }

    // Test 3: Auth service
    try {
      await supabase.auth.getSession()
      tests.push({
        name: "Auth Service",
        status: "pass",
        details: null,
      })
    } catch (error) {
      tests.push({
        name: "Auth Service",
        status: "fail",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    }

    const passedTests = tests.filter((test) => test.status === "pass").length
    const totalTests = tests.length
    const success = passedTests === totalTests

    return NextResponse.json({
      success,
      summary: `${passedTests}/${totalTests} tests passed`,
      tests,
      message: success ? "All database tests passed" : "Some database tests failed",
    })
  } catch (error) {
    console.error("Database diagnostic error:", error)
    return NextResponse.json({
      success: false,
      error: "Database diagnostic failed",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
