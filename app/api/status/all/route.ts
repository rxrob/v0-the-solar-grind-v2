import { NextResponse } from "next/server"

interface ServiceStatus {
  name: string
  category: string
  endpoint: string
  critical: boolean
  status: "healthy" | "error" | "degraded"
  message: string
  response_time: number
  details: Record<string, any>
  timestamp: string
  http_status: number
}

interface CategoryData {
  services: ServiceStatus[]
  healthy: number
  total: number
  critical: number
  avg_response_time: number
}

async function checkService(
  name: string,
  category: string,
  endpoint: string,
  critical = false,
): Promise<ServiceStatus> {
  const startTime = Date.now()

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(endpoint, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Solar-App-Status-Check/1.0",
      },
    })

    clearTimeout(timeoutId)
    const responseTime = Date.now() - startTime
    const data = await response.json()

    return {
      name,
      category,
      endpoint,
      critical,
      status: response.ok ? "healthy" : "error",
      message: response.ok ? data.message || "Service operational" : data.message || `HTTP ${response.status}`,
      response_time: responseTime,
      details: data.details || {},
      timestamp: new Date().toISOString(),
      http_status: response.status,
    }
  } catch (error) {
    const responseTime = Date.now() - startTime

    return {
      name,
      category,
      endpoint,
      critical,
      status: "error",
      message: error instanceof Error ? error.message : "Service unavailable",
      response_time: responseTime,
      details: { error: error instanceof Error ? error.message : "Unknown error" },
      timestamp: new Date().toISOString(),
      http_status: 0,
    }
  }
}

export async function GET(request: Request) {
  try {
    const { origin } = new URL(request.url)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || origin

    // Define services to check
    const servicesToCheck = [
      { name: "Supabase Database", category: "Database", endpoint: `${baseUrl}/api/status/supabase`, critical: true },
      {
        name: "Google Maps",
        category: "Google Services",
        endpoint: `${baseUrl}/api/status/google-maps`,
        critical: true,
      },
      {
        name: "Google Geocoding",
        category: "Google Services",
        endpoint: `${baseUrl}/api/status/google-geocoding`,
        critical: true,
      },
      {
        name: "Google Elevation",
        category: "Google Services",
        endpoint: `${baseUrl}/api/status/google-elevation`,
        critical: true,
      },
      { name: "NREL Solar Data", category: "Solar Data", endpoint: `${baseUrl}/api/status/nrel`, critical: true },
      { name: "Stripe Payments", category: "Payments", endpoint: `${baseUrl}/api/status/stripe`, critical: true },
      {
        name: "reCAPTCHA Security",
        category: "Security",
        endpoint: `${baseUrl}/api/status/recaptcha`,
        critical: false,
      },
    ]

    const startTime = Date.now()

    // Check all services in parallel
    const servicePromises = servicesToCheck.map((service) =>
      checkService(service.name, service.category, service.endpoint, service.critical),
    )

    const services = await Promise.all(servicePromises)
    const totalCheckTime = Date.now() - startTime

    // Group by category
    const categories: Record<string, CategoryData> = {}

    services.forEach((service) => {
      if (!categories[service.category]) {
        categories[service.category] = {
          services: [],
          healthy: 0,
          total: 0,
          critical: 0,
          avg_response_time: 0,
        }
      }

      categories[service.category].services.push(service)
      categories[service.category].total++

      if (service.status === "healthy") {
        categories[service.category].healthy++
      }

      if (service.critical) {
        categories[service.category].critical++
      }
    })

    // Calculate average response times for categories
    Object.keys(categories).forEach((category) => {
      const categoryServices = categories[category].services
      const totalResponseTime = categoryServices.reduce((sum, service) => sum + service.response_time, 0)
      categories[category].avg_response_time = Math.round(totalResponseTime / categoryServices.length)
    })

    // Calculate summary statistics
    const totalServices = services.length
    const healthyServices = services.filter((s) => s.status === "healthy").length
    const errorServices = services.filter((s) => s.status === "error").length
    const criticalServices = services.filter((s) => s.critical).length
    const criticalHealthy = services.filter((s) => s.critical && s.status === "healthy").length

    const averageResponseTime = Math.round(
      services.reduce((sum, service) => sum + service.response_time, 0) / totalServices,
    )

    const overallHealthPercentage = Math.round((healthyServices / totalServices) * 100)
    const criticalHealthPercentage = criticalServices > 0 ? Math.round((criticalHealthy / criticalServices) * 100) : 100

    // Determine overall system status
    let overallStatus: "healthy" | "degraded" | "unhealthy"
    let overallMessage: string

    if (criticalHealthPercentage === 100 && overallHealthPercentage >= 90) {
      overallStatus = "healthy"
      overallMessage = "All systems operational"
    } else if (criticalHealthPercentage >= 50) {
      overallStatus = "degraded"
      overallMessage = "Some services experiencing issues"
    } else {
      overallStatus = "unhealthy"
      overallMessage = "Critical services are down"
    }

    // Generate recommendations
    const recommendations: string[] = []

    if (errorServices > 0) {
      recommendations.push(`${errorServices} service(s) need attention`)
    }

    if (criticalHealthPercentage < 100) {
      recommendations.push("Critical services require immediate configuration")
    }

    if (averageResponseTime > 5000) {
      recommendations.push("High response times detected - check network connectivity")
    }

    const response = {
      status: overallStatus,
      message: overallMessage,
      summary: {
        total: totalServices,
        healthy: healthyServices,
        error: errorServices,
        critical_total: criticalServices,
        critical_healthy: criticalHealthy,
        average_response_time: averageResponseTime,
        overall_health_percentage: overallHealthPercentage,
        critical_health_percentage: criticalHealthPercentage,
      },
      categories,
      services,
      recommendations,
      timestamp: new Date().toISOString(),
      base_url: baseUrl,
      total_check_time: totalCheckTime,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Status check error:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        message: "Failed to perform status check",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
