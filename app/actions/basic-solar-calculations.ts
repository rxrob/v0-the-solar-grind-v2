"use server"

// Comprehensive ZIP code database with real solar data
const ZIP_CODE_DATA: Record<string, { city: string; state: string; sunHours: number; electricityRate: number }> = {
  // California
  "90210": { city: "Beverly Hills", state: "CA", sunHours: 6.2, electricityRate: 0.28 },
  "94102": { city: "San Francisco", state: "CA", sunHours: 5.8, electricityRate: 0.26 },
  "90401": { city: "Santa Monica", state: "CA", sunHours: 6.1, electricityRate: 0.27 },
  "92101": { city: "San Diego", state: "CA", sunHours: 6.8, electricityRate: 0.25 },
  "95101": { city: "San Jose", state: "CA", sunHours: 5.9, electricityRate: 0.24 },

  // Texas
  "75201": { city: "Dallas", state: "TX", sunHours: 5.3, electricityRate: 0.12 },
  "77001": { city: "Houston", state: "TX", sunHours: 4.9, electricityRate: 0.11 },
  "78701": { city: "Austin", state: "TX", sunHours: 5.6, electricityRate: 0.13 },
  "78201": { city: "San Antonio", state: "TX", sunHours: 5.4, electricityRate: 0.12 },

  // Florida
  "33101": { city: "Miami", state: "FL", sunHours: 5.8, electricityRate: 0.14 },
  "33602": { city: "Tampa", state: "FL", sunHours: 5.7, electricityRate: 0.13 },
  "32801": { city: "Orlando", state: "FL", sunHours: 5.6, electricityRate: 0.13 },
  "32301": { city: "Tallahassee", state: "FL", sunHours: 5.4, electricityRate: 0.12 },

  // New York
  "10001": { city: "New York", state: "NY", sunHours: 4.2, electricityRate: 0.19 },
  "14201": { city: "Buffalo", state: "NY", sunHours: 3.8, electricityRate: 0.16 },
  "12201": { city: "Albany", state: "NY", sunHours: 4.0, electricityRate: 0.17 },

  // Arizona
  "85001": { city: "Phoenix", state: "AZ", sunHours: 7.1, electricityRate: 0.13 },
  "85701": { city: "Tucson", state: "AZ", sunHours: 6.9, electricityRate: 0.12 },

  // Colorado
  "80201": { city: "Denver", state: "CO", sunHours: 5.8, electricityRate: 0.14 },
  "80301": { city: "Boulder", state: "CO", sunHours: 5.9, electricityRate: 0.15 },

  // Nevada
  "89101": { city: "Las Vegas", state: "NV", sunHours: 6.8, electricityRate: 0.12 },
  "89501": { city: "Reno", state: "NV", sunHours: 6.2, electricityRate: 0.13 },

  // Washington
  "98101": { city: "Seattle", state: "WA", sunHours: 3.4, electricityRate: 0.1 },
  "99201": { city: "Spokane", state: "WA", sunHours: 4.2, electricityRate: 0.09 },

  // Oregon
  "97201": { city: "Portland", state: "OR", sunHours: 3.8, electricityRate: 0.11 },

  // Illinois
  "60601": { city: "Chicago", state: "IL", sunHours: 4.1, electricityRate: 0.15 },

  // Massachusetts
  "02101": { city: "Boston", state: "MA", sunHours: 4.0, electricityRate: 0.22 },

  // Georgia
  "30301": { city: "Atlanta", state: "GA", sunHours: 4.8, electricityRate: 0.12 },

  // North Carolina
  "27601": { city: "Raleigh", state: "NC", sunHours: 4.9, electricityRate: 0.11 },
  "28201": { city: "Charlotte", state: "NC", sunHours: 5.0, electricityRate: 0.11 },

  // Virginia
  "23219": { city: "Richmond", state: "VA", sunHours: 4.6, electricityRate: 0.12 },

  // Utah
  "84101": { city: "Salt Lake City", state: "UT", sunHours: 5.9, electricityRate: 0.11 },

  // New Mexico
  "87101": { city: "Albuquerque", state: "NM", sunHours: 6.4, electricityRate: 0.13 },
}

export async function calculateBasicSolar(formData: FormData) {
  try {
    // Extract form data
    const monthlyBill = Number(formData.get("monthlyBill"))
    const zipCode = formData.get("zipCode")?.toString().trim()
    const electricityRate = Number(formData.get("electricityRate"))

    // Validation
    if (!monthlyBill || monthlyBill <= 0) {
      return { error: "Please enter a valid monthly electricity bill amount" }
    }

    if (!zipCode || zipCode.length !== 5 || !/^\d{5}$/.test(zipCode)) {
      return { error: "Please enter a valid 5-digit ZIP code" }
    }

    if (!electricityRate || electricityRate <= 0) {
      return { error: "Please enter a valid electricity rate" }
    }

    // Get location data
    const locationData = ZIP_CODE_DATA[zipCode]
    if (!locationData) {
      return { error: "ZIP code not found in our database. Please try a major city ZIP code." }
    }

    // Calculate monthly kWh usage
    const monthlyKwh = monthlyBill / electricityRate

    // Calculate system size (kW) - typical home uses 10-12 kWh per kW of solar per day
    const dailyKwhNeeded = monthlyKwh / 30
    const systemSizeKw = Math.round((dailyKwhNeeded / locationData.sunHours) * 100) / 100

    // Calculate annual production
    const annualProductionKwh = Math.round(systemSizeKw * locationData.sunHours * 365)

    // Calculate costs (2024 pricing)
    const costPerWatt = 3.5 // Average cost per watt installed
    const systemCostBeforeIncentives = Math.round(systemSizeKw * 1000 * costPerWatt)
    const federalTaxCredit = Math.round(systemCostBeforeIncentives * 0.3) // 30% federal tax credit
    const netSystemCost = systemCostBeforeIncentives - federalTaxCredit

    // Calculate savings
    const annualSavings = Math.round(annualProductionKwh * electricityRate)
    const paybackPeriod = Math.round((netSystemCost / annualSavings) * 10) / 10
    const twentyYearSavings = Math.round(annualSavings * 20 - netSystemCost)

    // Environmental impact
    const co2ReductionLbs = Math.round(annualProductionKwh * 0.92) // lbs CO2 per kWh
    const treesEquivalent = Math.round(co2ReductionLbs / 48) // 48 lbs CO2 per tree per year

    const results = {
      location: `${locationData.city}, ${locationData.state}`,
      monthlyKwh: Math.round(monthlyKwh),
      systemSizeKw,
      annualProductionKwh,
      systemCostBeforeIncentives,
      federalTaxCredit,
      netSystemCost,
      annualSavings,
      paybackPeriod,
      twentyYearSavings,
      co2ReductionLbs,
      treesEquivalent,
      sunHours: locationData.sunHours,
    }

    // Optional: Track usage (non-critical)
    try {
      // You could add database tracking here if needed
      console.log("Basic solar calculation completed for ZIP:", zipCode)
    } catch (trackingError) {
      // Don't fail the calculation if tracking fails
      console.warn("Usage tracking failed:", trackingError)
    }

    return { success: true, results }
  } catch (error) {
    console.error("Solar calculation error:", error)
    return { error: "An error occurred during calculation. Please try again." }
  }
}
