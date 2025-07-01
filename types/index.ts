export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  subscription_tier: "free" | "pro" | "enterprise"
  subscription_status: "active" | "inactive" | "cancelled" | "past_due"
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  tier: "free" | "pro" | "enterprise"
  status: "active" | "inactive" | "cancelled" | "past_due"
  current_period_start?: string
  current_period_end?: string
  created_at: string
  updated_at: string
}

export interface SolarCalculation {
  id: string
  user_id?: string
  address: string
  latitude: number
  longitude: number
  monthly_bill: number
  roof_area?: number
  system_size?: number
  panel_efficiency?: number
  tilt_angle?: number
  azimuth_angle?: number
  shading_factor?: number
  electricity_rate?: number
  net_metering?: boolean
  created_at: string
  updated_at: string
}

export interface SolarResults {
  annual_production: number
  annual_savings: number
  system_cost: number
  payback_period: number
  roi_25_years: number
  co2_offset: number
  equivalent_trees: number
  monthly_production: number[]
  monthly_savings: number[]
  system_specifications: {
    recommended_size: number
    number_of_panels: number
    panel_wattage: number
    inverter_size: number
    roof_area_needed: number
  }
  financial_analysis: {
    total_cost: number
    federal_tax_credit: number
    state_incentives: number
    net_cost: number
    monthly_payment: number
    break_even_year: number
    lifetime_savings: number
    npv: number
    irr: number
  }
}

export interface SolarPanel {
  id: string
  manufacturer: string
  model: string
  wattage: number
  efficiency: number
  temperature_coefficient: number
  warranty_years: number
  price_per_watt: number
  dimensions: {
    length: number
    width: number
    thickness: number
  }
  weight: number
  cell_type: "monocrystalline" | "polycrystalline" | "thin-film"
  created_at: string
  updated_at: string
}

export interface Inverter {
  id: string
  manufacturer: string
  model: string
  type: "string" | "power_optimizer" | "microinverter"
  max_dc_power: number
  max_ac_power: number
  efficiency: number
  warranty_years: number
  price: number
  mppt_channels: number
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  description?: string
  address: string
  latitude: number
  longitude: number
  status: "planning" | "design" | "permitting" | "installation" | "completed" | "monitoring"
  system_size: number
  estimated_annual_production: number
  estimated_cost: number
  installation_date?: string
  commissioning_date?: string
  created_at: string
  updated_at: string
}

export interface EnergyData {
  id: string
  project_id: string
  timestamp: string
  production_kwh: number
  consumption_kwh?: number
  grid_import_kwh?: number
  grid_export_kwh?: number
  battery_charge_kwh?: number
  battery_discharge_kwh?: number
  battery_soc?: number
  weather_conditions?: string
  irradiance?: number
  temperature?: number
  created_at: string
}

export interface SystemAlert {
  id: string
  project_id: string
  type: "performance" | "maintenance" | "fault" | "weather" | "grid"
  severity: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  status: "active" | "acknowledged" | "resolved"
  created_at: string
  resolved_at?: string
}

export interface MaintenanceRecord {
  id: string
  project_id: string
  type: "inspection" | "cleaning" | "repair" | "replacement" | "upgrade"
  description: string
  performed_by: string
  cost?: number
  scheduled_date: string
  completed_date?: string
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  notes?: string
  created_at: string
  updated_at: string
}

export interface ComponentHealth {
  id: string
  project_id: string
  component_type: "panel" | "inverter" | "battery" | "monitoring" | "wiring"
  component_id: string
  health_score: number
  status: "excellent" | "good" | "fair" | "poor" | "critical"
  last_inspection: string
  next_maintenance: string
  issues?: string[]
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface GeocodingResult {
  address: string
  latitude: number
  longitude: number
  formatted_address: string
  place_id: string
  types: string[]
}

export interface WeatherData {
  temperature: number
  humidity: number
  wind_speed: number
  wind_direction: number
  cloud_cover: number
  visibility: number
  uv_index: number
  conditions: string
  timestamp: string
}

export interface SolarIrradiance {
  ghi: number // Global Horizontal Irradiance
  dni: number // Direct Normal Irradiance
  dhi: number // Diffuse Horizontal Irradiance
  timestamp: string
}

export interface FinancialAnalysis {
  system_cost: number
  federal_tax_credit: number
  state_incentives: number
  utility_rebates: number
  net_cost: number
  financing_options: {
    cash: {
      upfront_cost: number
      monthly_savings: number
      payback_period: number
      lifetime_savings: number
    }
    loan: {
      loan_amount: number
      interest_rate: number
      term_years: number
      monthly_payment: number
      total_interest: number
      net_savings: number
    }
    lease: {
      monthly_payment: number
      escalation_rate: number
      total_payments: number
      savings_vs_utility: number
    }
  }
  roi_analysis: {
    simple_payback: number
    discounted_payback: number
    npv: number
    irr: number
    lcoe: number
  }
}
