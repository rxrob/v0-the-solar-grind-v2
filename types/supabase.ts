export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          subscription_type: "free" | "pro"
          pro_trial_used: boolean | null
          single_reports_purchased: number | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          subscription_type?: "free" | "pro"
          pro_trial_used?: boolean | null
          single_reports_purchased?: number | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          subscription_type?: "free" | "pro"
          pro_trial_used?: boolean | null
          single_reports_purchased?: number | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_projects: {
        Row: {
          id: string
          user_id: string
          project_name: string
          address: string
          latitude: number
          longitude: number
          system_size: number
          annual_production: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_name: string
          address: string
          latitude: number
          longitude: number
          system_size: number
          annual_production: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_name?: string
          address?: string
          latitude?: number
          longitude?: number
          system_size?: number
          annual_production?: number
          created_at?: string
          updated_at?: string
        }
      }
      solar_calculations: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          calculation_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          calculation_data: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          calculation_data?: Json
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
