import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Simple status endpoint for uptime monitoring
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  })
}
