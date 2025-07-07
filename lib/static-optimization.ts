// Static optimization utilities for edge caching

export const STATIC_PAGES = ["/pricing", "/calculator", "/basic-calculator", "/", "/dashboard", "/reports"] as const

export const CACHE_HEADERS = {
  STATIC_ASSETS: "public, max-age=31536000, immutable", // 1 year
  API_ROUTES: "no-cache, no-store, must-revalidate",
  PAGES: "public, max-age=3600, s-maxage=86400", // 1 hour browser, 1 day CDN
  IMAGES: "public, max-age=31536000, immutable",
} as const

export const REVALIDATION_TIMES = {
  PRICING: 3600, // 1 hour
  CALCULATOR: 1800, // 30 minutes
  BASIC_CALCULATOR: 3600, // 1 hour
  DASHBOARD: 300, // 5 minutes
  REPORTS: 600, // 10 minutes
} as const

// Generate static props for optimized pages
export const generateStaticPageProps = (page: keyof typeof REVALIDATION_TIMES) => {
  return {
    props: {},
    revalidate: REVALIDATION_TIMES[page],
  }
}

// Edge cache headers for API routes
export const getEdgeCacheHeaders = (maxAge = 3600) => {
  return {
    "Cache-Control": `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=86400`,
    "CDN-Cache-Control": `public, max-age=${maxAge}`,
    "Vercel-CDN-Cache-Control": `public, max-age=${maxAge}`,
  }
}

// Static data that can be cached at build time
export const STATIC_SOLAR_DATA = {
  stateAverages: {
    california: { sunHours: 5.5, costPerWatt: 3.2, incentives: 0.3 },
    texas: { sunHours: 5.0, costPerWatt: 3.4, incentives: 0.26 },
    florida: { sunHours: 4.8, costPerWatt: 3.3, incentives: 0.26 },
    arizona: { sunHours: 6.0, costPerWatt: 3.1, incentives: 0.26 },
    nevada: { sunHours: 5.8, costPerWatt: 3.2, incentives: 0.26 },
    other: { sunHours: 4.2, costPerWatt: 3.5, incentives: 0.26 },
  },
  roofEfficiency: {
    south: 0.85,
    "east-west": 0.75,
    north: 0.65,
  },
  systemEfficiency: 0.8,
  degradationRate: 0.005, // 0.5% per year
  co2PerKwh: 0.0007, // tons CO2 per kWh
} as const

// Pre-computed calculations for common scenarios
export const PRECOMPUTED_SCENARIOS = [
  {
    monthlyBill: 100,
    roofSize: 600,
    location: "california",
    roofType: "south",
    results: {
      systemSize: 5.2,
      annualProduction: 8736,
      monthlySavings: 85,
      annualSavings: 1020,
      paybackPeriod: 8.5,
      totalCost: 12740,
      netSavings25Years: 12760,
      co2Offset: 6.1,
    },
  },
  {
    monthlyBill: 150,
    roofSize: 800,
    location: "texas",
    roofType: "south",
    results: {
      systemSize: 7.8,
      annualProduction: 11700,
      monthlySavings: 128,
      annualSavings: 1536,
      paybackPeriod: 9.2,
      totalCost: 19656,
      netSavings25Years: 18744,
      co2Offset: 8.2,
    },
  },
  // Add more pre-computed scenarios as needed
] as const

export const getStaticSolarData = (location: string) => {
  return (
    STATIC_SOLAR_DATA.stateAverages[location as keyof typeof STATIC_SOLAR_DATA.stateAverages] ||
    STATIC_SOLAR_DATA.stateAverages.other
  )
}

export const findPrecomputedScenario = (monthlyBill: number, roofSize: number, location: string, roofType: string) => {
  return PRECOMPUTED_SCENARIOS.find(
    (scenario) =>
      Math.abs(scenario.monthlyBill - monthlyBill) <= 10 &&
      Math.abs(scenario.roofSize - roofSize) <= 100 &&
      scenario.location === location &&
      scenario.roofType === roofType,
  )
}

export const generateCacheHeaders = (type: keyof typeof CACHE_HEADERS) => {
  return {
    "Cache-Control": CACHE_HEADERS[type],
    "CDN-Cache-Control": CACHE_HEADERS[type],
    "Vercel-CDN-Cache-Control": CACHE_HEADERS[type],
  }
}
