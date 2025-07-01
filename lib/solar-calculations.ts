// Advanced solar calculations with astronomical algorithms
export interface SolarPosition {
  azimuth: number // degrees from north
  elevation: number // degrees above horizon
  zenith: number // degrees from vertical
}

export interface SolarIrradiance {
  direct: number // W/m²
  diffuse: number // W/m²
  global: number // W/m²
}

export interface TerrainAnalysis {
  slope: number // degrees
  aspect: number // degrees from north
  shadingFactor: number // 0-1
  skyViewFactor: number // 0-1
}

export interface SolarAnalysisResult {
  position: SolarPosition
  irradiance: SolarIrradiance
  terrain: TerrainAnalysis
  peakSunHours: number
  monthlyProduction: number[]
  annualProduction: number
}

/**
 * Calculate solar position using astronomical algorithms
 */
export function calculateSolarPosition(latitude: number, longitude: number, date: Date = new Date()): SolarPosition {
  const lat = (latitude * Math.PI) / 180
  const lon = (longitude * Math.PI) / 180

  // Julian day calculation
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours() + date.getMinutes() / 60

  const a = Math.floor((14 - month) / 12)
  const y = year - a
  const m = month + 12 * a - 3

  let jd =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  jd = jd + (hour - 12) / 24

  // Solar calculations
  const n = jd - 2451545.0
  const L = (280.46 + 0.9856474 * n) % 360
  const g = ((357.528 + 0.9856003 * n) * Math.PI) / 180
  const lambda = ((L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * Math.PI) / 180

  // Declination
  const delta = Math.asin(Math.sin(lambda) * Math.sin((23.439 * Math.PI) / 180))

  // Hour angle
  const gmst = (18.697374558 + 24.06570982441908 * n) % 24
  const lmst = (gmst + longitude / 15) % 24
  const h = ((lmst - 12) * 15 * Math.PI) / 180

  // Elevation and azimuth
  const elevation = Math.asin(Math.sin(lat) * Math.sin(delta) + Math.cos(lat) * Math.cos(delta) * Math.cos(h))
  const azimuth = Math.atan2(Math.sin(h), Math.cos(h) * Math.sin(lat) - Math.tan(delta) * Math.cos(lat))

  return {
    elevation: (elevation * 180) / Math.PI,
    azimuth: ((azimuth * 180) / Math.PI + 180) % 360,
    zenith: 90 - (elevation * 180) / Math.PI,
  }
}

/**
 * Calculate solar irradiance based on atmospheric conditions
 */
export function calculateSolarIrradiance(
  solarPosition: SolarPosition,
  atmosphericTransmittance = 0.75,
  cloudCover = 0.2,
): SolarIrradiance {
  const solarConstant = 1367 // W/m²
  const airMass = 1 / Math.sin((solarPosition.elevation * Math.PI) / 180)

  // Direct normal irradiance
  const directNormal = solarConstant * Math.pow(atmosphericTransmittance, airMass) * (1 - cloudCover)

  // Direct horizontal irradiance
  const direct = directNormal * Math.sin((solarPosition.elevation * Math.PI) / 180)

  // Diffuse irradiance (simplified model)
  const diffuse = solarConstant * 0.1 * (1 + cloudCover) * Math.sin((solarPosition.elevation * Math.PI) / 180)

  return {
    direct: Math.max(0, direct),
    diffuse: Math.max(0, diffuse),
    global: Math.max(0, direct + diffuse),
  }
}

/**
 * Analyze terrain effects on solar potential
 */
export function analyzeTerrainEffects(
  elevationData: number[][],
  centerLat: number,
  centerLon: number,
  resolution = 30, // meters per pixel
): TerrainAnalysis {
  const rows = elevationData.length
  const cols = elevationData[0].length
  const centerRow = Math.floor(rows / 2)
  const centerCol = Math.floor(cols / 2)

  // Calculate slope and aspect using finite differences
  const dzdx = (elevationData[centerRow][centerCol + 1] - elevationData[centerRow][centerCol - 1]) / (2 * resolution)
  const dzdy = (elevationData[centerRow + 1][centerCol] - elevationData[centerRow - 1][centerCol]) / (2 * resolution)

  const slope = Math.atan(Math.sqrt(dzdx * dzdx + dzdy * dzdy)) * (180 / Math.PI)
  let aspect = Math.atan2(dzdy, -dzdx) * (180 / Math.PI)
  if (aspect < 0) aspect += 360

  // Calculate sky view factor (simplified)
  let skyViewFactor = 1.0
  const numDirections = 8
  const maxDistance = Math.min(rows, cols) / 4

  for (let dir = 0; dir < numDirections; dir++) {
    const angle = (dir * 360) / numDirections
    const dx = Math.cos((angle * Math.PI) / 180)
    const dy = Math.sin((angle * Math.PI) / 180)

    let maxElevationAngle = 0
    for (let dist = 1; dist < maxDistance; dist++) {
      const row = Math.round(centerRow + dy * dist)
      const col = Math.round(centerCol + dx * dist)

      if (row >= 0 && row < rows && col >= 0 && col < cols) {
        const heightDiff = elevationData[row][col] - elevationData[centerRow][centerCol]
        const distance = dist * resolution
        const elevationAngle = Math.atan(heightDiff / distance) * (180 / Math.PI)
        maxElevationAngle = Math.max(maxElevationAngle, elevationAngle)
      }
    }

    skyViewFactor -= Math.max(0, maxElevationAngle) / 90 / numDirections
  }

  // Calculate shading factor based on terrain
  const shadingFactor = Math.max(0.1, skyViewFactor * (1 - slope / 90))

  return {
    slope,
    aspect,
    shadingFactor,
    skyViewFactor: Math.max(0, skyViewFactor),
  }
}

/**
 * Calculate monthly solar production for a given location
 */
export function calculateMonthlySolarProduction(
  latitude: number,
  longitude: number,
  systemSize: number, // kW
  panelTilt: number = latitude,
  panelAzimuth = 180, // south-facing
  systemEfficiency = 0.85,
): number[] {
  const monthlyProduction: number[] = []

  for (let month = 0; month < 12; month++) {
    let monthlyTotal = 0
    const daysInMonth = new Date(2024, month + 1, 0).getDate()

    for (let day = 1; day <= daysInMonth; day++) {
      let dailyTotal = 0

      // Calculate hourly production
      for (let hour = 6; hour <= 18; hour++) {
        const date = new Date(2024, month, day, hour)
        const solarPos = calculateSolarPosition(latitude, longitude, date)

        if (solarPos.elevation > 0) {
          const irradiance = calculateSolarIrradiance(solarPos)

          // Calculate angle of incidence on tilted panel
          const panelTiltRad = (panelTilt * Math.PI) / 180
          const panelAzimuthRad = (panelAzimuth * Math.PI) / 180
          const solarElevationRad = (solarPos.elevation * Math.PI) / 180
          const solarAzimuthRad = (solarPos.azimuth * Math.PI) / 180

          const cosIncidence =
            Math.sin(solarElevationRad) * Math.cos(panelTiltRad) +
            Math.cos(solarElevationRad) * Math.sin(panelTiltRad) * Math.cos(solarAzimuthRad - panelAzimuthRad)

          const effectiveIrradiance = irradiance.global * Math.max(0, cosIncidence)

          // Convert to power (kW)
          const power = (effectiveIrradiance / 1000) * systemSize * systemEfficiency
          dailyTotal += power
        }
      }

      monthlyTotal += dailyTotal
    }

    monthlyProduction.push(monthlyTotal)
  }

  return monthlyProduction
}

/**
 * Comprehensive solar analysis for a location
 */
export function performSolarAnalysis(
  latitude: number,
  longitude: number,
  systemSize: number,
  elevationData?: number[][],
  options: {
    panelTilt?: number
    panelAzimuth?: number
    systemEfficiency?: number
    atmosphericTransmittance?: number
  } = {},
): SolarAnalysisResult {
  const { panelTilt = latitude, panelAzimuth = 180, systemEfficiency = 0.85, atmosphericTransmittance = 0.75 } = options

  // Current solar position
  const position = calculateSolarPosition(latitude, longitude)

  // Current irradiance
  const irradiance = calculateSolarIrradiance(position, atmosphericTransmittance)

  // Terrain analysis (if elevation data provided)
  const terrain = elevationData
    ? analyzeTerrainEffects(elevationData, latitude, longitude)
    : {
        slope: 0,
        aspect: 180,
        shadingFactor: 0.95,
        skyViewFactor: 1.0,
      }

  // Monthly production
  const monthlyProduction = calculateMonthlySolarProduction(
    latitude,
    longitude,
    systemSize,
    panelTilt,
    panelAzimuth,
    systemEfficiency * terrain.shadingFactor,
  )

  const annualProduction = monthlyProduction.reduce((sum, month) => sum + month, 0)
  const peakSunHours = annualProduction / (systemSize * 365)

  return {
    position,
    irradiance,
    terrain,
    peakSunHours,
    monthlyProduction,
    annualProduction,
  }
}

/**
 * Calculate optimal panel tilt for maximum annual production
 */
export function calculateOptimalTilt(latitude: number): number {
  // Simplified formula: optimal tilt ≈ latitude for annual optimization
  // For winter optimization: latitude + 15°
  // For summer optimization: latitude - 15°
  return Math.max(0, Math.min(60, latitude))
}

/**
 * Calculate shading losses from nearby objects
 */
export function calculateShadingLosses(
  objects: Array<{
    height: number // meters
    distance: number // meters
    azimuth: number // degrees from north
  }>,
  latitude: number,
): number {
  let totalShadingLoss = 0

  objects.forEach((obj) => {
    // Calculate shadow angle
    const shadowAngle = Math.atan(obj.height / obj.distance) * (180 / Math.PI)

    // Estimate shading impact based on object position relative to south
    const azimuthDiff = Math.abs(obj.azimuth - 180)
    const azimuthFactor = Math.max(0, 1 - azimuthDiff / 90)

    // Calculate seasonal shading (winter sun is lower)
    const winterSunAngle = 90 - latitude - 23.5
    const shadingFactor = shadowAngle > winterSunAngle ? 1 : shadowAngle / winterSunAngle

    totalShadingLoss += shadingFactor * azimuthFactor * 0.1 // 10% max loss per object
  })

  return Math.min(0.5, totalShadingLoss) // Cap at 50% total shading loss
}
