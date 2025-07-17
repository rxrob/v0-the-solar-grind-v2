import { type NextRequest, NextResponse } from "next/server"
import { trackEvent } from "@/lib/user-tracking"

export async function POST(request: NextRequest) {
  try {
    const { eventType, eventData } = await request.json()

    const result = await trackEvent(eventType, eventData)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Track event API error:", error)
    return NextResponse.json({ success: false, error: "Failed to track event" }, { status: 500 })
  }
}
