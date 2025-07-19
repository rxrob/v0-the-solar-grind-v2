// lib/user-tracking.ts
"use client"

import { getSupabaseClient } from "@/lib/supabaseClient"

export async function trackEvent(eventType: string, sessionId: string, eventData: any = {}) {
  try {
    const supabase = getSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // ❌ Skip tracking for anonymous users
    if (!user?.id) return

    // ✅ Insert the tracking event (only for logged-in users)
    const { error } = await supabase.from("user_tracking_events").insert({
      event_type: eventType,
      session_id: sessionId,
      event_data: eventData,
      user_id: user.id,
      has_event_data: Object.keys(eventData).length > 0,
    })

    if (error) {
      console.error("Tracking failed:", error)
    }
  } catch (err) {
    console.error("Unexpected error while tracking:", err)
  }
}
