export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          subscription_type: "free" | "pro"
          subscription_status: string | null
          pro_trial_used: boolean | null
          single_reports_purchased: number | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          subscription_type?: "free" | "pro"
          subscription_status?: string | null
          pro_trial_used?: boolean | null
          single_reports_purchased?: number | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          subscription_type?: "free" | "pro"
          subscription_status?: string | null
          pro_trial_used?: boolean | null
          single_reports_purchased?: number | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
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
          system_size: number | null
          annual_production: number | null
          cost_estimate: number | null
          savings_estimate: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_name: string
          address: string
          system_size?: number | null
          annual_production?: number | null
          cost_estimate?: number | null
          savings_estimate?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_name?: string
          address?: string
          system_size?: number | null
          annual_production?: number | null
          cost_estimate?: number | null
          savings_estimate?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      solar_calculations: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          calculation_type: string
          input_data: Json
          result_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          calculation_type: string
          input_data: Json
          result_data: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          calculation_type?: string
          input_data?: Json
          result_data?: Json
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
