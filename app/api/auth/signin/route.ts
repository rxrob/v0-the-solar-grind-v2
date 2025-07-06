import { type NextRequest, NextResponse } from "next/server"
import { signInWithEmailReal } from "@/app/actions/auth-real"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    const result = await signInWithEmailReal(email, password)

    if (result.success) {
      return NextResponse.json({
        success: true,
        user: result.user,
        message: "Login successful",
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
      })
    }
  } catch (error) {
    console.error("Sign in API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
