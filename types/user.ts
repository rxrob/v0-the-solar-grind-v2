export interface User {
  id: string
  email: string
  full_name?: string
  subscription_type: "free" | "pro" | "ion"
  subscription_status: string
  single_reports_purchased: number
  single_reports_used: number
  pro_trial_used: boolean
  created_at: string
  updated_at: string
  user_metadata?: {
    subscription_type?: string
    full_name?: string
  }
}

export interface IonProject {
  id: string
  user_id: string
  project_name: string
  homeowner_name: string
  homeowner_email: string
  homeowner_phone: string
  address: string
  system_size_kw: number
  annual_production_kwh: number
  estimated_savings: number
  calculation_data?: any
  created_at: string
  updated_at: string
}
