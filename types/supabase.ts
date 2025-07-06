export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          subscription_type: "free" | "pro"
          pro_trial_used?: boolean
          single_reports_purchased?: number
          stripe_customer_id?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          subscription_type?: "free" | "pro"
          pro_trial_used?: boolean
          single_reports_purchased?: number
          stripe_customer_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          subscription_type?: "free" | "pro"
          pro_trial_used?: boolean
          single_reports_purchased?: number
          stripe_customer_id?: string
          updated_at?: string
        }
      }
      user_projects: {
        Row: {
          id: string
          user_id: string
          name: string
          address: string
          latitude?: number
          longitude?: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          address: string
          latitude?: number
          longitude?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          address?: string
          latitude?: number
          longitude?: number
          updated_at?: string
        }
      }
      solar_calculations: {
        Row: {
          id: string
          user_id: string
          project_id?: string
          calculation_type: string
          calculation_data: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string
          calculation_type: string
          calculation_data: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
          calculation_type?: string
          calculation_data?: any
        }
      }
    }
  }
}
