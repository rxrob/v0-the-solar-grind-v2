import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("🔍 Running database diagnostic...")

    const supabase = await createSupabaseServerClient()
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
      const { data, error } = await supabase.from("users").select("*").limit(1)
      tests.push({
        name: "Users Table Access",
        status: error ? "fail" : "pass",
        details: error?.message,
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
      const { data, error } = await supabase.auth.getSession()
      tests.push({
        name: "Auth Service",
        status: error ? "fail" : "pass",
        details: error?.message,
      })
    } catch (error) {
      tests.push({
        name: "Auth Service",
        status: "fail",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    }

    // Test 4: RLS policies
    try {
      const { error } = await supabase.from("users").insert({
        id: "test-id-" + Date.now(),
        email: "test@example.com",
        full_name: "Test User",
        subscription_type: "free",
      })

      // Clean up test data
      if (!error) {
        await supabase.from("users").delete().eq("email", "test@example.com")
      }

      tests.push({
        name: "Database Write Access",
        status: error ? "fail" : "pass",
        details: error?.message,
      })
    } catch (error) {
      tests.push({
        name: "Database Write Access",
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
