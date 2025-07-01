// Core Solar Analysis Types
export interface SolarCalculationInput {
  address: string
  monthlyKwh: number
  electricityRate: number
  utilityCompany?: string
  roofType?: RoofType
  roofAge?: RoofAge
  shadingLevel?: ShadingLevel
  hasPool?: boolean
  hasEV?: boolean
  planningAdditions?: boolean
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface SolarCalculationResult {
  systemSizeKw: number
  panelsNeeded: number
  panelWattage: number
  annualProductionKwh: number
  systemCost: number
  netCost: number
  annualSavings: number
  monthlySavings: number
  roiYears: number
  co2OffsetTons: number
  treesEquivalent: number
  peakSunHours?: number
  efficiency?: number
  degradationRate?: number
  warrantyYears?: number
}

export interface AdvancedSolarAnalysis extends SolarCalculationResult {
  monthlyProduction: number[]
  seasonalVariation: {
    spring: number
    summer: number
    fall: number
    winter: number
  }
  weatherImpact: {
    cloudCover: number
    temperature: number
    precipitation: number
  }
  roofAnalysis: {
    suitableArea: number
    orientation: string
    tilt: number
    shadingPercentage: number
  }
  financialProjection: {
    year: number
    production: number
    savings: number
    cumulativeSavings: number
  }[]
}

export interface ProSolarAnalysis extends AdvancedSolarAnalysis {
  detailedFinancing: {
    cashPurchase: FinancingOption
    solarLoan: FinancingOption
    lease: FinancingOption
    ppa: FinancingOption
  }
  incentiveBreakdown: {
    federalTaxCredit: number
    stateTaxCredit: number
    localRebates: number
    utilityIncentives: number
    totalIncentives: number
  }
  maintenanceSchedule: MaintenanceItem[]
  performanceGuarantee: {
    year: number
    guaranteedProduction: number
    actualProduction: number
  }[]
}

// Supporting Types
export type RoofType = "asphalt_shingle" | "metal" | "tile" | "flat" | "slate" | "wood_shake" | "other"

export type RoofAge = "new" | "1-5_years" | "5-10_years" | "10-15_years" | "15-20_years" | "over_20_years"

export type ShadingLevel = "none" | "minimal" | "moderate" | "significant" | "heavy"

export type SubscriptionTier = "free" | "pro" | "enterprise"

export type CalculationType = "basic" | "advanced" | "pro"

// User and Project Types
export interface User {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  subscriptionTier: SubscriptionTier
  subscriptionStatus: "active" | "inactive" | "cancelled" | "past_due"
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  trialEndsAt?: string
  proTrialUsed: boolean
  calculationsUsed: number
  monthlyCalculationLimit: number
  createdAt: string
  updatedAt: string
}

export interface UserProject {
  id: string
  userId: string
  projectName: string
  address?: string
  systemSizeKw?: number
  annualProductionKwh?: number
  estimatedSavings?: number
  projectData?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface SolarCalculation {
  id: string
  userId: string
  projectId?: string
  calculationType: CalculationType
  inputData: SolarCalculationInput
  resultData: SolarCalculationResult | AdvancedSolarAnalysis | ProSolarAnalysis
  createdAt: string
}

// Financing Types
export interface FinancingOption {
  type: "cash" | "loan" | "lease" | "ppa"
  monthlyPayment: number
  totalCost: number
  totalSavings: number
  netBenefit: number
  paybackPeriod: number
  terms?: {
    loanTerm?: number
    interestRate?: number
    downPayment?: number
    leaseTerm?: number
    escalationRate?: number
    ppaRate?: number
  }
}

export interface MaintenanceItem {
  year: number
  task: string
  estimatedCost: number
  required: boolean
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface GeocodeResult {
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  components: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
}

export interface WeatherData {
  location: string
  coordinates: {
    lat: number
    lng: number
  }
  peakSunHours: number
  averageTemperature: number
  cloudCover: number
  precipitation: number
  seasonalVariation: {
    spring: number
    summer: number
    fall: number
    winter: number
  }
}

export interface UtilityData {
  company: string
  averageRate: number
  tieredRates?: {
    tier1: { limit: number; rate: number }
    tier2: { limit: number; rate: number }
    tier3: { limit: number; rate: number }
  }
  timeOfUseRates?: {
    peak: number
    offPeak: number
    superOffPeak: number
  }
  netMeteringPolicy: {
    available: boolean
    creditRate: number
    rolloverPolicy: string
  }
  interconnectionFee?: number
  monthlyServiceCharge: number
}

// Chart and Visualization Types
export interface ChartDataPoint {
  name: string
  value: number
  color?: string
}

export interface MonthlyProductionData {
  month: string
  production: number
  consumption: number
  netUsage: number
  savings: number
}

export interface FinancialProjectionData {
  year: number
  production: number
  savings: number
  cumulativeSavings: number
  systemValue: number
  maintenanceCost: number
}

// Form and UI Types
export interface FormErrors {
  [key: string]: string | undefined
}

export interface LoadingState {
  isLoading: boolean
  message?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: FormErrors
}

// Report Generation Types
export interface ReportData {
  customer: {
    name: string
    email: string
    phone?: string
    address: string
  }
  property: {
    address: string
    roofType: RoofType
    roofAge: RoofAge
    shadingLevel: ShadingLevel
    coordinates?: {
      lat: number
      lng: number
    }
  }
  analysis: ProSolarAnalysis
  recommendations: string[]
  nextSteps: string[]
  generatedAt: string
  validUntil: string
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  sections: ReportSection[]
  isDefault: boolean
}

export interface ReportSection {
  id: string
  title: string
  type: "text" | "chart" | "table" | "image"
  content: any
  order: number
  required: boolean
}

// Error Types
export interface SolarError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: string
}

export interface ValidationError extends SolarError {
  field: string
  value: any
}

// Configuration Types
export interface SolarConfig {
  panelWattage: number
  systemEfficiency: number
  degradationRate: number
  warrantyYears: number
  costPerWatt: number
  federalTaxCredit: number
  installationCostMultiplier: number
}

export interface ApiConfig {
  googleMapsApiKey: string
  nrelApiKey: string
  weatherApiKey: string
  geocodingApiKey: string
  elevationApiKey: string
}

// Dashboard Types
export interface DashboardStats {
  totalProjects: number
  totalCalculations: number
  totalSavingsCalculated: number
  totalSystemsDesigned: number
  averageSystemSize: number
  averageRoi: number
  monthlyGrowth: number
  conversionRate: number
}

export interface DashboardProject {
  id: string
  customerName: string
  address: string
  systemSize: number
  estimatedSavings: number
  status: "active" | "completed" | "cancelled"
  createdAt: string
  lastUpdated: string
}

// Export all types for easy importing
export type {
  SolarCalculationInput,
  SolarCalculationResult,
  AdvancedSolarAnalysis,
  ProSolarAnalysis,
  RoofType,
  RoofAge,
  ShadingLevel,
  SubscriptionTier,
  CalculationType,
  User,
  UserProject,
  SolarCalculation,
  FinancingOption,
  MaintenanceItem,
  ApiResponse,
  GeocodeResult,
  WeatherData,
  UtilityData,
  ChartDataPoint,
  MonthlyProductionData,
  FinancialProjectionData,
  FormErrors,
  LoadingState,
  ValidationResult,
  ReportData,
  ReportTemplate,
  ReportSection,
  SolarError,
  ValidationError,
  SolarConfig,
  ApiConfig,
  DashboardStats,
  DashboardProject,
}
