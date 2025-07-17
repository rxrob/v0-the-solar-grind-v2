import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let supabase: any = null

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} catch (error) {
  console.warn("Supabase client creation failed:", error)
}

export interface SolarLocationScore {
  score: number
  factors: {
    sunlight_hours: number
    weather_rating: number
    utility_incentives: number
    net_metering: boolean
    installation_difficulty: number
  }
  recommendations: string[]
  estimated_savings: {
    monthly: number
    annual: number
    lifetime: number
  }
}

export interface UserTrackingData {
  sessionId: string
  userAgent?: string
  location?: {
    latitude: number
    longitude: number
    city?: string
    state?: string
    zipCode?: string
  }
  deviceInfo?: {
    screenWidth: number
    screenHeight: number
    deviceType: string
    browser: string
    os: string
  }
  solarScore?: number
  events?: any[]
}

// Generate a unique session ID
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Get device information
export function getDeviceInfo() {
  return {
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    deviceType: window.screen.width < 768 ? "mobile" : window.screen.width < 1024 ? "tablet" : "desktop",
    browser: navigator.userAgent.includes("Chrome")
      ? "Chrome"
      : navigator.userAgent.includes("Firefox")
        ? "Firefox"
        : navigator.userAgent.includes("Safari")
          ? "Safari"
          : "Other",
    os: navigator.platform,
  }
}

// Get URL parameters
export function getUrlParameters() {
  if (typeof window === "undefined") return {}

  const urlParams = new URLSearchParams(window.location.search)
  return {
    utm_source: urlParams.get("utm_source"),
    utm_medium: urlParams.get("utm_medium"),
    utm_campaign: urlParams.get("utm_campaign"),
    utm_term: urlParams.get("utm_term"),
    utm_content: urlParams.get("utm_content"),
  }
}

// Check if table exists
async function checkTableExists(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from("user_tracking").select("id").limit(1)

    return !error
  } catch (error) {
    console.log("Table check failed:", error)
    return false
  }
}

// Store data in localStorage as fallback
function storeInLocalStorage(data: Partial<UserTrackingData>) {
  try {
    const existingData = localStorage.getItem("user_tracking_data")
    const trackingData = existingData ? JSON.parse(existingData) : []
    trackingData.push({
      ...data,
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem("user_tracking_data", JSON.stringify(trackingData))
    console.log("Data stored in localStorage as fallback")
  } catch (error) {
    console.error("Failed to store in localStorage:", error)
  }
}

// Track user visit
export async function trackUserVisit(data: UserTrackingData) {
  try {
    console.log("Attempting to track user visit:", data)

    // First check if Supabase is available
    if (!supabase) {
      console.warn("Supabase not available, storing data locally")
      localStorage.setItem("userTrackingData", JSON.stringify(data))
      return { success: true, method: "localStorage" }
    }

    // Test connection first
    const { data: testData, error: testError } = await supabase.from("user_tracking").select("id").limit(1)

    if (testError) {
      console.warn("Supabase table not accessible:", testError.message)
      localStorage.setItem("userTrackingData", JSON.stringify(data))
      return { success: true, method: "localStorage", error: testError.message }
    }

    // Insert the tracking data
    const { data: insertData, error } = await supabase
      .from("user_tracking")
      .insert({
        session_id: data.sessionId,
        user_agent: data.userAgent,
        location: data.location,
        device_info: data.deviceInfo,
        solar_score: data.solarScore,
        events: data.events || [],
      })
      .select()

    if (error) {
      console.warn("Supabase insert failed:", error.message)
      localStorage.setItem("userTrackingData", JSON.stringify(data))
      return { success: true, method: "localStorage", error: error.message }
    }

    console.log("User tracking data saved successfully:", insertData)
    return { success: true, method: "supabase", data: insertData }
  } catch (error) {
    console.warn("Tracking error:", error)
    localStorage.setItem("userTrackingData", JSON.stringify(data))
    return { success: true, method: "localStorage", error: error }
  }
}

// Track custom event
export async function trackEvent(eventType: string, eventData: any) {
  try {
    const sessionId = getSessionId()

    if (!supabase) {
      const existingData = localStorage.getItem("userTrackingData")
      if (existingData) {
        const data = JSON.parse(existingData)
        data.events = data.events || []
        data.events.push({
          type: eventType,
          data: eventData,
          timestamp: Date.now(),
        })
        localStorage.setItem("userTrackingData", JSON.stringify(data))
      }
      return { success: true, method: "localStorage" }
    }

    const { error } = await supabase
      .from("user_tracking")
      .update({
        events: supabase.raw(
          `events || '[{"type": "${eventType}", "data": ${JSON.stringify(eventData)}, "timestamp": ${Date.now()}}]'::jsonb`,
        ),
        updated_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId)

    if (error) {
      console.warn("Event tracking failed:", error.message)
      return { success: false, error: error.message }
    }

    return { success: true, method: "supabase" }
  } catch (error) {
    console.warn("Event tracking error:", error)
    return { success: false, error }
  }
}

// Get session ID
export function getSessionId(): string {
  let sessionId = localStorage.getItem("sessionId")
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem("sessionId", sessionId)
  }
  return sessionId
}

// Get location details from coordinates
export async function getLocationDetails(latitude: number, longitude: number) {
  try {
    const response = await fetch(`/api/geocoding?lat=${latitude}&lng=${longitude}`)
    if (!response.ok) {
      throw new Error("Geocoding failed")
    }
    const data = await response.json()
    return {
      city: data.city || "Unknown City",
      state: data.state || "Unknown State",
      country: data.country || "US",
      zip_code: data.zip_code || null,
    }
  } catch (error) {
    console.error("Error getting location details:", error)
    return {
      city: "Your Location",
      state: "US",
      country: "US",
      zip_code: null,
    }
  }
}

// Calculate solar score based on location
export async function calculateSolarScore(latitude: number, longitude: number): Promise<SolarLocationScore> {
  try {
    // Base score calculation based on latitude (closer to equator = better)
    const latitudeScore = Math.max(0, 100 - Math.abs(latitude) * 2)

    // Simulate weather rating based on general climate zones
    let weatherRating = 70
    if (latitude >= 25 && latitude <= 40) weatherRating = 85 // Sun belt
    if (latitude >= 40 && latitude <= 50) weatherRating = 75 // Moderate
    if (latitude > 50 || latitude < 25) weatherRating = 60 // Less optimal

    // Simulate utility incentives (varies by state/region)
    const utilityIncentives = Math.floor(Math.random() * 40) + 50 // 50-90

    // Calculate sunlight hours (simplified)
    const sunlightHours = Math.max(3, Math.min(8, 6 - Math.abs(latitude - 35) * 0.1))

    // Installation difficulty (random for now)
    const installationDifficulty = Math.floor(Math.random() * 30) + 20 // 20-50

    // Net metering availability (simplified)
    const netMetering = Math.random() > 0.3 // 70% chance

    // Calculate overall score
    const score = Math.round(
      (latitudeScore * 0.3 +
        weatherRating * 0.25 +
        utilityIncentives * 0.2 +
        (sunlightHours / 8) * 100 * 0.15 +
        (100 - installationDifficulty) * 0.1) *
        (netMetering ? 1 : 0.9),
    )

    // Generate recommendations
    const recommendations = []
    if (score >= 80) {
      recommendations.push("Your location is excellent for solar! Consider getting quotes from multiple installers.")
      recommendations.push("Look into battery storage options to maximize your solar investment.")
    } else if (score >= 60) {
      recommendations.push("Solar could work well for your location with proper system design.")
      recommendations.push("Consider ground-mount systems if roof conditions are challenging.")
    } else {
      recommendations.push("Solar may still be viable with careful planning and incentives.")
      recommendations.push("Focus on energy efficiency improvements first.")
    }

    // Calculate estimated savings
    const baseMonthlyBill = 150
    const savingsPercentage = Math.min(0.9, (score / 100) * 0.8)
    const monthlySavings = Math.round(baseMonthlyBill * savingsPercentage)
    const annualSavings = monthlySavings * 12
    const lifetimeSavings = annualSavings * 20

    return {
      score: Math.min(100, Math.max(0, score)),
      factors: {
        sunlight_hours: Number(sunlightHours.toFixed(1)),
        weather_rating: weatherRating,
        utility_incentives: utilityIncentives,
        net_metering: netMetering,
        installation_difficulty: installationDifficulty,
      },
      recommendations,
      estimated_savings: {
        monthly: monthlySavings,
        annual: annualSavings,
        lifetime: lifetimeSavings,
      },
    }
  } catch (error) {
    console.error("Error calculating solar score:", error)
    // Return default score if calculation fails
    return {
      score: 75,
      factors: {
        sunlight_hours: 5.5,
        weather_rating: 75,
        utility_incentives: 60,
        net_metering: true,
        installation_difficulty: 30,
      },
      recommendations: [
        "Get a professional solar assessment for your specific location",
        "Compare quotes from multiple certified installers",
      ],
      estimated_savings: {
        monthly: 120,
        annual: 1440,
        lifetime: 28800,
      },
    }
  }
}

// Update time on page
export async function updateTimeOnPage(sessionId: string, timeOnPage: number) {
  try {
    const tableExists = await checkTableExists()
    if (!tableExists) return

    await supabase.from("user_tracking").update({ time_on_page: timeOnPage }).eq("session_id", sessionId)
  } catch (error) {
    console.error("Error updating time on page:", error)
  }
}

// Update scroll depth
export async function updateScrollDepth(sessionId: string, scrollDepth: number) {
  try {
    const tableExists = await checkTableExists()
    if (!tableExists) return

    await supabase.from("user_tracking").update({ scroll_depth: scrollDepth }).eq("session_id", sessionId)
  } catch (error) {
    console.error("Error updating scroll depth:", error)
  }
}
