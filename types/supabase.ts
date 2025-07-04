export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          subscription_tier: "free" | "pro"
          subscription_status: "active" | "inactive" | "trialing" | "past_due" | "canceled"
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          subscription_tier?: "free" | "pro"
          subscription_status?: "active" | "inactive" | "trialing" | "past_due" | "canceled"
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          subscription_tier?: "free" | "pro"
          subscription_status?: "active" | "inactive" | "trialing" | "past_due" | "canceled"
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_projects: {
        Row: {
          id: string
          user_id: string
          name: string
          address: string
          coordinates: Json | null
          system_size_kw: number | null
          estimated_production: number | null
          estimated_savings: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          address: string
          coordinates?: Json | null
          system_size_kw?: number | null
          estimated_production?: number | null
          estimated_savings?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          address?: string
          coordinates?: Json | null
          system_size_kw?: number | null
          estimated_production?: number | null
          estimated_savings?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      solar_calculations: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          calculation_type: "basic" | "advanced" | "pro"
          input_data: Json
          results: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          calculation_type: "basic" | "advanced" | "pro"
          input_data: Json
          results: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          calculation_type?: "basic" | "advanced" | "pro"
          input_data?: Json
          results?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
