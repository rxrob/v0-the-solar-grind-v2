import { type NextRequest, NextResponse } from "next/server"
import { signInWithEmailReal } from "@/app/actions/auth-real"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    const result = await signInWithEmailReal(email, password)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        user: result.user,
      })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 })
    }
  } catch (error) {
    console.error("Signin API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
