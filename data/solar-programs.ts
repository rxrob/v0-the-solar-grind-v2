// Comprehensive solar program data for Texas utilities
// This maps utility names to their specific solar policies and rates

export interface SolarProgram {
  utilityName: string
  type: "cooperative" | "municipal" | "deregulated_tdu" | "iou"
  netMeteringPolicy: "full" | "avoided_cost" | "none" | "rep_dependent"
  buybackRate: number | "varies" // $/kWh or "varies" for deregulated
  buybackPercentage: number // % of retail rate
  retailRate: number // $/kWh typical rate
  dgFee: number // Monthly distributed generation fee
  connectionFee: number // Base monthly customer charge
  demandCharges: boolean
  solarRebates: boolean
  notes: string
  interconnectionFee?: number // One-time fee for solar connection
  maxSystemSize?: number // kW limit
  programStatus: "active" | "suspended" | "grandfathered"
  website?: string
  lastUpdated: string
}

export const solarPrograms: { [utilityName: string]: SolarProgram } = {
  // Electric Cooperatives
  "Bailey County Electric Cooperative": {
    utilityName: "Bailey County Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "none",
    buybackRate: 0.0,
    buybackPercentage: 0,
    retailRate: 0.08,
    dgFee: 0,
    connectionFee: 25,
    demandCharges: false,
    solarRebates: false,
    notes: "Allows interconnection but does not credit surplus to grid. Excess energy is donated to the cooperative.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Bandera Electric Cooperative": {
    utilityName: "Bandera Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0343,
    buybackPercentage: 43,
    retailRate: 0.0793,
    dgFee: 0,
    connectionFee: 20,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost buyback at 43% of retail rate. Credits applied monthly.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Bartlett Electric Cooperative": {
    utilityName: "Bartlett Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "full",
    buybackRate: 0.118,
    buybackPercentage: 100,
    retailRate: 0.118,
    dgFee: 0,
    connectionFee: 22,
    demandCharges: false,
    solarRebates: false,
    notes: "Full net metering with 1:1 credit for surplus generation. Monthly rollover of credits.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Big Country Electric Cooperative": {
    utilityName: "Big Country Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0567,
    buybackPercentage: 49,
    retailRate: 0.1147,
    dgFee: 0,
    connectionFee: 28,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost policy at 49% of retail rate. Excess generation credited at wholesale rates.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Bluebonnet Electric Cooperative": {
    utilityName: "Bluebonnet Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0616,
    buybackPercentage: 64,
    retailRate: 0.096,
    dgFee: 0,
    connectionFee: 25,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost compensation at 64% of retail rate. Good buyback rate among cooperatives.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Bowie-Cass Electric Cooperative": {
    utilityName: "Bowie-Cass Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "full",
    buybackRate: 0.1448,
    buybackPercentage: 100,
    retailRate: 0.1448,
    dgFee: 15,
    connectionFee: 20,
    demandCharges: false,
    solarRebates: false,
    notes: "Full net metering with 1:1 credit but charges $15/month DG fee.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Central Texas Electric Cooperative": {
    utilityName: "Central Texas Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "full",
    buybackRate: 0.112,
    buybackPercentage: 100,
    retailRate: 0.112,
    dgFee: 15,
    connectionFee: 25,
    demandCharges: false,
    solarRebates: false,
    notes: "Net metering with full credit but charges $15/month DG fee.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Cherokee County Electric Cooperative": {
    utilityName: "Cherokee County Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "full",
    buybackRate: 0.1293,
    buybackPercentage: 100,
    retailRate: 0.1293,
    dgFee: 15,
    connectionFee: 22,
    demandCharges: false,
    solarRebates: false,
    notes: "Net metering with 1:1 credit plus $15/month fee for solar customers.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Coleman County Electric Cooperative": {
    utilityName: "Coleman County Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "full",
    buybackRate: 0.084,
    buybackPercentage: 100,
    retailRate: 0.084,
    dgFee: 0,
    connectionFee: 24,
    demandCharges: false,
    solarRebates: false,
    notes: "Full retail credit for exports with no additional fees. One of the better cooperative policies.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Comanche County Electric Cooperative": {
    utilityName: "Comanche County Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.053,
    buybackPercentage: 39,
    retailRate: 0.135,
    dgFee: 0,
    connectionFee: 26,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost credit at 39% of retail rate. Lower buyback rate.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Concho Valley Electric Cooperative": {
    utilityName: "Concho Valley Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.06,
    buybackPercentage: 50,
    retailRate: 0.12,
    dgFee: 15.25,
    connectionFee: 25,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost buyback with $15.25/month solar charge. Additional fee makes economics less favorable.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Denton County Electric Cooperative (CoServ)": {
    utilityName: "Denton County Electric Cooperative (CoServ)",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0663,
    buybackPercentage: 58,
    retailRate: 0.1151,
    dgFee: 25,
    connectionFee: 30,
    demandCharges: false,
    solarRebates: true,
    notes: "Avoided-cost buyback with $25/month solar metering fee. Offers solar rebates to offset costs.",
    maxSystemSize: 25,
    programStatus: "active",
    website: "https://www.coserv.com/solar",
    lastUpdated: "2024-01-15",
  },

  "Deep East Texas Electric Cooperative": {
    utilityName: "Deep East Texas Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0439,
    buybackPercentage: 39,
    retailRate: 0.1125,
    dgFee: 10,
    connectionFee: 22,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost policy with $10/month DER fee. Lower compensation rate.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Fannin County Electric Cooperative": {
    utilityName: "Fannin County Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0719,
    buybackPercentage: 55,
    retailRate: 0.131,
    dgFee: 0,
    connectionFee: 25,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost buyback at 55% of retail rate with no additional fees.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Farmers Electric Cooperative (Texas)": {
    utilityName: "Farmers Electric Cooperative (Texas)",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.06,
    buybackPercentage: 56,
    retailRate: 0.107,
    dgFee: 5,
    connectionFee: 24,
    demandCharges: false,
    solarRebates: false,
    notes: "No net metering for new solar installations. Explicitly states avoided-cost only.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Fayette Electric Cooperative": {
    utilityName: "Fayette Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0428,
    buybackPercentage: 44,
    retailRate: 0.097,
    dgFee: 6,
    connectionFee: 23,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost policy with DG fee calculated as $0.75 per kW of solar capacity.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Fort Belknap Electric Cooperative": {
    utilityName: "Fort Belknap Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.07,
    buybackPercentage: 50,
    retailRate: 0.14,
    dgFee: 33.5,
    connectionFee: 35,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost buyback with very high $33.50/month solar fee. Economics are poor due to high fees.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Grayson-Collin Electric Cooperative": {
    utilityName: "Grayson-Collin Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "full",
    buybackRate: 0.127,
    buybackPercentage: 100,
    retailRate: 0.127,
    dgFee: 5,
    connectionFee: 28,
    demandCharges: false,
    solarRebates: false,
    notes: "Net metering with modest $5/month DG fee. One of the better cooperative policies.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Greenbelt Electric Cooperative": {
    utilityName: "Greenbelt Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.047,
    buybackPercentage: 33,
    retailRate: 0.14,
    dgFee: 0,
    connectionFee: 30,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost policy at only 33% of retail rate. Lower compensation.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Guadalupe Valley Electric Cooperative (GVEC)": {
    utilityName: "Guadalupe Valley Electric Cooperative (GVEC)",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.085,
    buybackPercentage: 79,
    retailRate: 0.1076,
    dgFee: 0,
    connectionFee: 25,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost buyback at 79% of retail rate. Credits close to retail but not full 1:1.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Hamilton County Electric Cooperative": {
    utilityName: "Hamilton County Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0354,
    buybackPercentage: 27,
    retailRate: 0.1307,
    dgFee: 0,
    connectionFee: 26,
    demandCharges: false,
    solarRebates: false,
    notes: "Low avoided-cost rate at only 27% of retail. Poor economics for solar.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Heart of Texas Electric Cooperative": {
    utilityName: "Heart of Texas Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0481,
    buybackPercentage: 36,
    retailRate: 0.1336,
    dgFee: 0,
    connectionFee: 28,
    demandCharges: false,
    solarRebates: false,
    notes: "Ended net metering for new installations. Confirms no net metering for new solar.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "HILCO Electric Cooperative": {
    utilityName: "HILCO Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "full",
    buybackRate: 0.1337,
    buybackPercentage: 100,
    retailRate: 0.1337,
    dgFee: 0,
    connectionFee: 25,
    demandCharges: false,
    solarRebates: false,
    notes: "Full retail credit for excess with no additional charges. Excellent cooperative policy.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Houston County Electric Cooperative": {
    utilityName: "Houston County Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.059,
    buybackPercentage: 39,
    retailRate: 0.151,
    dgFee: 15,
    connectionFee: 24,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost policy with $15/month DG charge. Additional fee reduces value.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "J-A-C Electric Cooperative": {
    utilityName: "J-A-C Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "none",
    buybackRate: 0.0,
    buybackPercentage: 0,
    retailRate: 0.125,
    dgFee: 11.5,
    connectionFee: 22,
    demandCharges: false,
    solarRebates: false,
    notes: "No net metering policy. Surplus generation is not compensated and charges fee for solar.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Jasper-Newton Electric Cooperative": {
    utilityName: "Jasper-Newton Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "full",
    buybackRate: 0.125,
    buybackPercentage: 100,
    retailRate: 0.125,
    dgFee: 15,
    connectionFee: 23,
    demandCharges: false,
    solarRebates: false,
    notes: "Net metering with 1:1 credit and $15/month DG fee.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Karnes Electric Cooperative": {
    utilityName: "Karnes Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.015,
    buybackPercentage: 14,
    retailRate: 0.1051,
    dgFee: 0,
    connectionFee: 24,
    demandCharges: false,
    solarRebates: false,
    notes: "Very low avoided-cost rate at only 14% of retail. Poor solar economics.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Lamar County Electric Cooperative": {
    utilityName: "Lamar County Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.06,
    buybackPercentage: 48,
    retailRate: 0.125,
    dgFee: 12.5,
    connectionFee: 26,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost policy with $12.50/month DG fee.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Lamb County Electric Cooperative": {
    utilityName: "Lamb County Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.04,
    buybackPercentage: 50,
    retailRate: 0.08,
    dgFee: 0,
    connectionFee: 28,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost compensation at 50% of retail rate.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Lighthouse Electric Cooperative": {
    utilityName: "Lighthouse Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "none",
    buybackRate: 0.0,
    buybackPercentage: 0,
    retailRate: 0.095,
    dgFee: 0,
    connectionFee: 32,
    demandCharges: false,
    solarRebates: false,
    notes: "No net metering policy. Energy sent to grid is uncompensated.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Lyntegar Electric Cooperative": {
    utilityName: "Lyntegar Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.046,
    buybackPercentage: 51,
    retailRate: 0.09,
    dgFee: 0,
    connectionFee: 29,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost policy at 51% of retail rate.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Magic Valley Electric Cooperative": {
    utilityName: "Magic Valley Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "full",
    buybackRate: 0.111,
    buybackPercentage: 100,
    retailRate: 0.111,
    dgFee: 0,
    connectionFee: 26,
    demandCharges: false,
    solarRebates: false,
    notes: "Full retail credit for surplus generation with no additional fees.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Medina Electric Cooperative": {
    utilityName: "Medina Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0499,
    buybackPercentage: 46,
    retailRate: 0.1083,
    dgFee: 0,
    connectionFee: 24,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost buyback at 46% of retail rate.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Navarro County Electric Cooperative": {
    utilityName: "Navarro County Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.051,
    buybackPercentage: 39,
    retailRate: 0.13,
    dgFee: 0,
    connectionFee: 27,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost policy at 39% of retail rate.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Navasota Valley Electric Cooperative": {
    utilityName: "Navasota Valley Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "full",
    buybackRate: 0.11,
    buybackPercentage: 100,
    retailRate: 0.11,
    dgFee: 0,
    connectionFee: 25,
    demandCharges: false,
    solarRebates: false,
    notes: "Full 100% credit for surplus generation with no fees.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "North Plains Electric Cooperative": {
    utilityName: "North Plains Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "full",
    buybackRate: 0.0973,
    buybackPercentage: 100,
    retailRate: 0.0973,
    dgFee: 18,
    connectionFee: 30,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost rate equals retail rate, effectively net metering. $18/month DG meter fee.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Nueces Electric Cooperative": {
    utilityName: "Nueces Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0625,
    buybackPercentage: 42,
    retailRate: 0.15,
    dgFee: 19.5,
    connectionFee: 28,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost buyback with $19.50/month solar fee.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Panola-Harrison Electric Cooperative": {
    utilityName: "Panola-Harrison Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0573,
    buybackPercentage: 65,
    retailRate: 0.088,
    dgFee: 0,
    connectionFee: 23,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost policy at 65% of retail rate.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Pedernales Electric Cooperative (PEC)": {
    utilityName: "Pedernales Electric Cooperative (PEC)",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.06,
    buybackPercentage: 58,
    retailRate: 0.1038,
    dgFee: 0,
    connectionFee: 25,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost buyback at cooperative's avoided power cost. Does not offer full retail net metering.",
    maxSystemSize: 25,
    programStatus: "active",
    website: "https://www.pec.coop/solar",
    lastUpdated: "2024-01-15",
  },

  "Rio Grande Electric Cooperative": {
    utilityName: "Rio Grande Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.055,
    buybackPercentage: 39,
    retailRate: 0.141,
    dgFee: 0,
    connectionFee: 38.75,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost policy with high base charge but no solar fee.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Rusk County Electric Cooperative": {
    utilityName: "Rusk County Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.066,
    buybackPercentage: 63,
    retailRate: 0.105,
    dgFee: 0,
    connectionFee: 24,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost buyback at 63% of retail rate.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Sam Houston Electric Cooperative": {
    utilityName: "Sam Houston Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.045,
    buybackPercentage: 35,
    retailRate: 0.129,
    dgFee: 0,
    connectionFee: 26,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost policy, no full net metering. Buyback rider at avoided-cost rates (4-5¢/kWh in 2023).",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "San Bernard Electric Cooperative": {
    utilityName: "San Bernard Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0655,
    buybackPercentage: 47,
    retailRate: 0.14,
    dgFee: 0,
    connectionFee: 27,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost policy at 47% of retail rate.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "San Patricio Electric Cooperative": {
    utilityName: "San Patricio Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "full",
    buybackRate: 0.141,
    buybackPercentage: 100,
    retailRate: 0.141,
    dgFee: 12,
    connectionFee: 28,
    demandCharges: false,
    solarRebates: false,
    notes: "Net metering with full 1:1 credit and $12/month DG fee.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "South Plains Electric Cooperative": {
    utilityName: "South Plains Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "full",
    buybackRate: 0.0974,
    buybackPercentage: 100,
    retailRate: 0.0974,
    dgFee: 11.47,
    connectionFee: 29,
    demandCharges: false,
    solarRebates: false,
    notes: "Net metering with 100% credit and $11.47/month solar charge.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Southwest Rural Electric Association": {
    utilityName: "Southwest Rural Electric Association",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.03,
    buybackPercentage: 24,
    retailRate: 0.125,
    dgFee: 24,
    connectionFee: 32,
    demandCharges: false,
    solarRebates: false,
    notes: "Low avoided-cost rate with $24/month solar fee. Poor economics.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Southwest Texas Electric Cooperative": {
    utilityName: "Southwest Texas Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.035,
    buybackPercentage: 34,
    retailRate: 0.103,
    dgFee: 0,
    connectionFee: 26,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost buyback at 34% of retail rate.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Swisher Electric Cooperative": {
    utilityName: "Swisher Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.024,
    buybackPercentage: 26,
    retailRate: 0.092,
    dgFee: 15,
    connectionFee: 31,
    demandCharges: false,
    solarRebates: false,
    notes: "Low avoided-cost rate with $15/month DG fee.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Taylor Electric Cooperative": {
    utilityName: "Taylor Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.025,
    buybackPercentage: 20,
    retailRate: 0.125,
    dgFee: 0,
    connectionFee: 39.95,
    demandCharges: false,
    solarRebates: false,
    notes: "Very low avoided-cost rate at only 20% of retail. High base fee but no additional solar charge.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Tri-County Electric Cooperative": {
    utilityName: "Tri-County Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "full",
    buybackRate: 0.1443,
    buybackPercentage: 100,
    retailRate: 0.1443,
    dgFee: 12,
    connectionFee: 25,
    demandCharges: false,
    solarRebates: false,
    notes: "Net metering with full retail credit and $12/month solar rider. Openly promotes solar buyback program.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Trinity Valley Electric Cooperative": {
    utilityName: "Trinity Valley Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0768,
    buybackPercentage: 73,
    retailRate: 0.1048,
    dgFee: 0,
    connectionFee: 24,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost policy at 73% of retail rate.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "United Electric Cooperative Services": {
    utilityName: "United Electric Cooperative Services",
    type: "cooperative",
    netMeteringPolicy: "full",
    buybackRate: 0.14,
    buybackPercentage: 100,
    retailRate: 0.14,
    dgFee: 18.5,
    connectionFee: 27,
    demandCharges: false,
    solarRebates: false,
    notes: "Net metering with 1:1 credit and $18.50/month solar metering fee.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Upshur Rural Electric Cooperative": {
    utilityName: "Upshur Rural Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "full",
    buybackRate: 0.105,
    buybackPercentage: 100,
    retailRate: 0.105,
    dgFee: 0,
    connectionFee: 23,
    demandCharges: false,
    solarRebates: false,
    notes: "Net metering with full credit, no additional DG fees. Excellent cooperative policy.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Victoria Electric Cooperative": {
    utilityName: "Victoria Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.04,
    buybackPercentage: 41,
    retailRate: 0.0981,
    dgFee: 10,
    connectionFee: 26,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost buyback with $10/month solar charge.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Wharton County Electric Cooperative": {
    utilityName: "Wharton County Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0469,
    buybackPercentage: 32,
    retailRate: 0.1468,
    dgFee: 15,
    connectionFee: 28,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost policy with $15/month DG customer charge.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Wise Electric Cooperative": {
    utilityName: "Wise Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "full",
    buybackRate: 0.13,
    buybackPercentage: 100,
    retailRate: 0.13,
    dgFee: 10,
    connectionFee: 27,
    demandCharges: false,
    solarRebates: false,
    notes: "Net metering with full retail credit and $10/month solar rider.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "Wood County Electric Cooperative": {
    utilityName: "Wood County Electric Cooperative",
    type: "cooperative",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.091,
    buybackPercentage: 69,
    retailRate: 0.1317,
    dgFee: 0,
    connectionFee: 25,
    demandCharges: false,
    solarRebates: false,
    notes: "Avoided-cost policy at 69% of retail rate.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  // Deregulated TDUs
  "Oncor Electric Delivery": {
    utilityName: "Oncor Electric Delivery",
    type: "deregulated_tdu",
    netMeteringPolicy: "rep_dependent",
    buybackRate: "varies",
    buybackPercentage: 100,
    retailRate: 0.12,
    dgFee: 0,
    connectionFee: 15,
    demandCharges: false,
    solarRebates: true,
    notes:
      "TDU only - net metering through REP solar plans. Must choose REP with solar buyback plan for 1:1 credit. Oncor offers solar+battery rebates.",
    maxSystemSize: 2000,
    programStatus: "active",
    website: "https://www.oncor.com/solar",
    lastUpdated: "2024-01-15",
  },

  "CenterPoint Energy": {
    utilityName: "CenterPoint Energy",
    type: "deregulated_tdu",
    netMeteringPolicy: "rep_dependent",
    buybackRate: "varies",
    buybackPercentage: 100,
    retailRate: 0.11,
    dgFee: 0,
    connectionFee: 12,
    demandCharges: false,
    solarRebates: false,
    notes:
      "TDU only - compensation through REP solar plans. CenterPoint installs bi-directional meter, REP provides buyback credit.",
    maxSystemSize: 2000,
    programStatus: "active",
    website: "https://www.centerpointenergy.com/solar",
    lastUpdated: "2024-01-15",
  },

  "AEP Texas": {
    utilityName: "AEP Texas",
    type: "deregulated_tdu",
    netMeteringPolicy: "rep_dependent",
    buybackRate: "varies",
    buybackPercentage: 100,
    retailRate: 0.1,
    dgFee: 0,
    connectionFee: 18,
    demandCharges: false,
    solarRebates: true,
    notes:
      "TDU only - does not purchase excess energy directly. AEP Texas offers upfront solar rebates but no net metering billing. Choose REP with buyback plan.",
    maxSystemSize: 2000,
    programStatus: "active",
    website: "https://www.aeptexas.com/solar",
    lastUpdated: "2024-01-15",
  },

  "Texas-New Mexico Power (TNMP)": {
    utilityName: "Texas-New Mexico Power (TNMP)",
    type: "deregulated_tdu",
    netMeteringPolicy: "rep_dependent",
    buybackRate: "varies",
    buybackPercentage: 100,
    retailRate: 0.09,
    dgFee: 0,
    connectionFee: 227,
    demandCharges: false,
    solarRebates: false,
    notes:
      "TDU only - compensation through REP plans. TNMP charges ~$227 for DG meter installation. Buyback through REP selection.",
    interconnectionFee: 227,
    maxSystemSize: 2000,
    programStatus: "active",
    website: "https://www.tnmp.com/solar",
    lastUpdated: "2024-01-15",
  },

  // Municipal Utilities
  "Austin Energy": {
    utilityName: "Austin Energy",
    type: "municipal",
    netMeteringPolicy: "full",
    buybackRate: 0.097,
    buybackPercentage: 100,
    retailRate: 0.097,
    dgFee: 0,
    connectionFee: 10,
    demandCharges: false,
    solarRebates: true,
    notes: "Full net metering with 1:1 credit. Offers solar rebates and performance-based incentives.",
    maxSystemSize: 20,
    programStatus: "active",
    website: "https://austinenergy.com/solar",
    lastUpdated: "2024-01-15",
  },

  "CPS Energy": {
    utilityName: "CPS Energy",
    type: "municipal",
    netMeteringPolicy: "full",
    buybackRate: 0.089,
    buybackPercentage: 100,
    retailRate: 0.089,
    dgFee: 0,
    connectionFee: 12,
    demandCharges: false,
    solarRebates: true,
    notes: "Net metering with full retail credit. Offers solar rebates up to $2,500.",
    maxSystemSize: 25,
    programStatus: "active",
    website: "https://www.cpsenergy.com/solar",
    lastUpdated: "2024-01-15",
  },

  "Bryan Texas Utilities": {
    utilityName: "Bryan Texas Utilities",
    type: "municipal",
    netMeteringPolicy: "full",
    buybackRate: 0.095,
    buybackPercentage: 100,
    retailRate: 0.095,
    dgFee: 0,
    connectionFee: 15,
    demandCharges: false,
    solarRebates: false,
    notes: "Net metering with 1:1 credit for residential customers.",
    maxSystemSize: 25,
    programStatus: "active",
    lastUpdated: "2024-01-15",
  },

  "El Paso Electric": {
    utilityName: "El Paso Electric",
    type: "iou",
    netMeteringPolicy: "full",
    buybackRate: 0.11,
    buybackPercentage: 100,
    retailRate: 0.11,
    dgFee: 0,
    connectionFee: 13,
    demandCharges: false,
    solarRebates: true,
    notes: "Net metering with full retail credit. Serves both Texas and New Mexico.",
    maxSystemSize: 30,
    programStatus: "active",
    website: "https://www.epelectric.com/solar",
    lastUpdated: "2024-01-15",
  },

  // Special Cases
  "Xcel Energy": {
    utilityName: "Xcel Energy",
    type: "iou",
    netMeteringPolicy: "full",
    buybackRate: 0.085,
    buybackPercentage: 100,
    retailRate: 0.085,
    dgFee: 0,
    connectionFee: 11,
    demandCharges: false,
    solarRebates: true,
    notes: "Net metering with full retail credit. Serves portions of the Texas Panhandle.",
    maxSystemSize: 120,
    programStatus: "active",
    website: "https://www.xcelenergy.com/solar",
    lastUpdated: "2024-01-15",
  },
}

export function getSolarProgram(utilityName: string): SolarProgram | null {
  return solarPrograms[utilityName] || null
}

export function calculateMonthlySolarSavings(
  monthlyUsageKwh: number,
  systemSizeKw: number,
  monthlyProductionKwh: number,
  retailRate: number,
  buybackRate: number | string,
  dgFee = 0,
  connectionFee = 0,
): {
  grossSavings: number
  netSavings: number
  exportCredits: number
  fees: number
} {
  // Handle "varies" buyback rate for deregulated areas
  const effectiveBuybackRate = typeof buybackRate === "string" ? retailRate : buybackRate

  // Calculate solar production offset
  const usageOffset = Math.min(monthlyUsageKwh, monthlyProductionKwh)
  const excessProduction = Math.max(0, monthlyProductionKwh - monthlyUsageKwh)

  // Calculate savings
  const offsetSavings = usageOffset * retailRate
  const exportCredits = excessProduction * effectiveBuybackRate
  const grossSavings = offsetSavings + exportCredits

  // Calculate fees
  const totalFees = dgFee + connectionFee
  const netSavings = grossSavings - totalFees

  return {
    grossSavings: Math.round(grossSavings * 100) / 100,
    netSavings: Math.round(netSavings * 100) / 100,
    exportCredits: Math.round(exportCredits * 100) / 100,
    fees: totalFees,
  }
}

export function getUtilityType(utilityName: string): string {
  const program = getSolarProgram(utilityName)
  if (!program) return "unknown"

  switch (program.type) {
    case "cooperative":
      return "Electric Cooperative"
    case "municipal":
      return "Municipal Utility"
    case "deregulated_tdu":
      return "Deregulated TDU"
    case "iou":
      return "Investor-Owned Utility"
    default:
      return "Unknown"
  }
}

export function getPolicyDescription(policy: string): string {
  switch (policy) {
    case "full":
      return "Full Net Metering (1:1 credit)"
    case "avoided_cost":
      return "Avoided Cost Buyback"
    case "none":
      return "No Solar Buyback"
    case "rep_dependent":
      return "REP Dependent (Deregulated)"
    default:
      return "Unknown Policy"
  }
}

export function getBestUtilitiesForSolar(limit = 10): SolarProgram[] {
  return Object.values(solarPrograms)
    .filter((program) => program.programStatus === "active")
    .sort((a, b) => {
      // Sort by net metering policy first (full > avoided_cost > none)
      const policyScore = (policy: string) => {
        switch (policy) {
          case "full":
            return 3
          case "avoided_cost":
            return 2
          case "rep_dependent":
            return 1
          case "none":
            return 0
          default:
            return 0
        }
      }

      const aPolicyScore = policyScore(a.netMeteringPolicy)
      const bPolicyScore = policyScore(b.netMeteringPolicy)

      if (aPolicyScore !== bPolicyScore) {
        return bPolicyScore - aPolicyScore
      }

      // Then by buyback percentage
      return b.buybackPercentage - a.buybackPercentage
    })
    .slice(0, limit)
}

export function getWorstUtilitiesForSolar(limit = 10): SolarProgram[] {
  return Object.values(solarPrograms)
    .filter((program) => program.programStatus === "active")
    .sort((a, b) => {
      // Sort by effective cost (fees + low buyback)
      const effectiveCost = (program: SolarProgram) => {
        return program.dgFee + (program.buybackPercentage === 0 ? 100 : 100 - program.buybackPercentage)
      }

      return effectiveCost(b) - effectiveCost(a)
    })
    .slice(0, limit)
}
