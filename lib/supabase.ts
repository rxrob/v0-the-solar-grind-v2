import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

// Client for browser usage
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations (only if service role key is available)
export const supabaseAdmin = supabaseServiceRoleKey
  ? createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

// Named export for createClient (required for compatibility)
export const createClient = () => supabase

// Server client for server components
export const createServerClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// Database types with comprehensive user management
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone?: string
          company?: string
          account_type: "free" | "pro" | "admin" | "enterprise"
          subscription_status: "active" | "inactive" | "cancelled" | "past_due" | "trialing"
          subscription_plan: "free" | "pro" | "enterprise"
          stripe_customer_id?: string
          stripe_subscription_id?: string
          trial_ends_at?: string
          pro_trial_used: boolean
          calculations_used: number
          monthly_calculation_limit: number
          email_verified: boolean
          last_login?: string
          login_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone?: string
          company?: string
          account_type?: "free" | "pro" | "admin" | "enterprise"
          subscription_status?: "active" | "inactive" | "cancelled" | "past_due" | "trialing"
          subscription_plan?: "free" | "pro" | "enterprise"
          stripe_customer_id?: string
          stripe_subscription_id?: string
          trial_ends_at?: string
          pro_trial_used?: boolean
          calculations_used?: number
          monthly_calculation_limit?: number
          email_verified?: boolean
          last_login?: string
          login_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string
          company?: string
          account_type?: "free" | "pro" | "admin" | "enterprise"
          subscription_status?: "active" | "inactive" | "cancelled" | "past_due" | "trialing"
          subscription_plan?: "free" | "pro" | "enterprise"
          stripe_customer_id?: string
          stripe_subscription_id?: string
          trial_ends_at?: string
          pro_trial_used?: boolean
          calculations_used?: number
          monthly_calculation_limit?: number
          email_verified?: boolean
          last_login?: string
          login_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id?: string
          session_token: string
          expires_at: string
          ip_address?: string
          user_agent?: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          session_token: string
          expires_at: string
          ip_address?: string
          user_agent?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_token?: string
          expires_at?: string
          ip_address?: string
          user_agent?: string
          created_at?: string
        }
      }
      user_projects: {
        Row: {
          id: string
          user_id?: string
          user_email: string
          customer_name: string
          project_name: string
          property_address: string
          system_size_kw: number
          annual_production_kwh: number
          system_cost: number
          net_cost: number
          annual_savings: number
          status: "active" | "completed" | "cancelled" | "on_hold"
          notes?: string
          installation_date?: string
          completion_date?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          user_email: string
          customer_name: string
          project_name: string
          property_address: string
          system_size_kw: number
          annual_production_kwh: number
          system_cost: number
          net_cost: number
          annual_savings: number
          status?: "active" | "completed" | "cancelled" | "on_hold"
          notes?: string
          installation_date?: string
          completion_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_email?: string
          customer_name?: string
          project_name?: string
          property_address?: string
          system_size_kw?: number
          annual_production_kwh?: number
          system_cost?: number
          net_cost?: number
          annual_savings?: number
          status?: "active" | "completed" | "cancelled" | "on_hold"
          notes?: string
          installation_date?: string
          completion_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      solar_calculations: {
        Row: {
          id: number
          user_id?: string
          user_email: string
          address: string
          coordinates: string
          monthly_kwh: number
          electricity_rate: number
          results: any
          calculation_type: "basic" | "advanced" | "pro"
          system_size_kw?: number
          annual_production_kwh?: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id?: string
          user_email: string
          address: string
          coordinates: string
          monthly_kwh: number
          electricity_rate: number
          results: any
          calculation_type?: "basic" | "advanced" | "pro"
          system_size_kw?: number
          annual_production_kwh?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          user_email?: string
          address?: string
          coordinates?: string
          monthly_kwh?: number
          electricity_rate?: number
          results?: any
          calculation_type?: "basic" | "advanced" | "pro"
          system_size_kw?: number
          annual_production_kwh?: number
          created_at?: string
          updated_at?: string
        }
      }
      usage_tracking: {
        Row: {
          id: number
          user_id?: string
          user_email: string
          calculation_type: string
          ip_address?: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id?: string
          user_email: string
          calculation_type: string
          ip_address?: string
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          user_email?: string
          calculation_type?: string
          ip_address?: string
          created_at?: string
        }
      }
    }
    Views: {
      user_dashboard_stats: {
        Row: {
          email: string
          name: string
          account_type: string
          subscription_plan: string
          calculations_used: number
          monthly_calculation_limit: number
          total_projects: number
          total_calculations: number
          total_estimated_savings: number
          avg_system_size: number
        }
      }
    }
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_user_login: {
        Args: {
          user_email: string
        }
        Returns: undefined
      }
      track_calculation_usage: {
        Args: {
          user_email: string
          calc_type: string
          user_ip?: string
        }
        Returns: undefined
      }
      check_user_calculation_limit: {
        Args: {
          user_email: string
        }
        Returns: boolean
      }
      get_user_account_info: {
        Args: {
          user_email: string
        }
        Returns: {
          email: string
          name: string
          account_type: string
          subscription_plan: string
          subscription_status: string
          calculations_used: number
          monthly_limit: number
          calculations_remaining: number
          total_projects: number
          total_savings: number
        }[]
      }
      update_user_references: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
  }
}

// Utility functions for common operations
export async function getUserByEmail(email: string) {
  const client = supabase
  const { data, error } = await client.from("users").select("*").eq("email", email).single()
  if (error) throw error
  return data
}

export async function createUser(userData: Database["public"]["Tables"]["users"]["Insert"]) {
  const client = supabase
  const { data, error } = await client.from("users").insert(userData).select().single()
  if (error) throw error
  return data
}

export async function getUserProjects(userEmail: string) {
  const client = supabase
  const { data, error } = await client
    .from("user_projects")
    .select("*")
    .eq("user_email", userEmail)
    .order("updated_at", { ascending: false })

  if (error) throw error
  return data
}

export async function saveCalculation(calculationData: Database["public"]["Tables"]["solar_calculations"]["Insert"]) {
  const client = supabase
  const { data, error } = await client.from("solar_calculations").insert(calculationData).select().single()
  if (error) throw error
  return data
}

export async function getUserDashboardStats(userEmail: string) {
  const client = supabase
  const { data, error } = await client.from("user_dashboard_stats").select("*").eq("email", userEmail).single()
  if (error) throw error
  return data
}

// Real-time subscriptions
export function subscribeToUserProjects(userEmail: string, callback: (payload: any) => void) {
  const client = supabase
  return client
    .channel("user_projects")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "user_projects",
        filter: `user_email=eq.${userEmail}`,
      },
      callback,
    )
    .subscribe()
}

// Check if Supabase is available
export function isSupabaseAvailable(): boolean {
  return !!supabaseUrl && !!supabaseAnonKey
}

// Account type helpers
export function getAccountTypeDisplayName(accountType: string): string {
  switch (accountType) {
    case "free":
      return "Free"
    case "pro":
      return "Professional"
    case "admin":
      return "Administrator"
    case "enterprise":
      return "Enterprise"
    default:
      return "Unknown"
  }
}

export function getAccountTypeLimits(accountType: string): { calculations: number; features: string[] } {
  switch (accountType) {
    case "free":
      return {
        calculations: 10,
        features: ["Basic solar calculations", "Energy savings estimates", "System sizing"],
      }
    case "pro":
      return {
        calculations: 100,
        features: ["Advanced solar analysis", "Detailed financial projections", "Custom reports", "Priority support"],
      }
    case "admin":
    case "enterprise":
      return {
        calculations: 999999,
        features: ["Unlimited calculations", "All pro features", "Admin dashboard", "User management", "API access"],
      }
    default:
      return { calculations: 0, features: [] }
  }
}

// Default export
export default supabase
