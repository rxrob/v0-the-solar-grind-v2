export interface TexasUtility {
  id: string
  name: string
  type: "cooperative" | "deregulated_tdu" | "municipal"
  region: string
  netMeteringPolicy: "full" | "avoided_cost" | "none"
  buybackRate: number // $/kWh
  buybackPercentage: number // % of retail rate
  retailRate: number // $/kWh
  monthlyFee: number // $ additional fee for solar
  connectionFee: number // $ base monthly fee
  demandCharges: boolean
  description: string
  notes?: string
  website?: string
}

export interface UtilitySearchFilters {
  searchTerm: string
  type: string
  policy: string
  region: string
}

export interface UtilityStats {
  totalUtilities: number
  cooperatives: number
  deregulatedTDUs: number
  fullNetMetering: number
  avoidedCost: number
  noBuyback: number
  averageBuybackRate: number
  averageRetailRate: number
}
