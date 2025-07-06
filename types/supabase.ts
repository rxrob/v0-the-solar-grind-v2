export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          subscription_tier: "free" | "pro" | "enterprise"
          subscription_status: "active" | "inactive" | "cancelled" | "past_due"
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          created_at: string
          updated_at: string
          last_sign_in_at: string | null
          email_confirmed_at: string | null
          phone: string | null
          raw_app_meta_data: Json | null
          raw_user_meta_data: Json | null
          is_super_admin: boolean
          banned_until: string | null
          deleted_at: string | null
          company: string | null
          pro_trial_used: boolean
          single_reports_purchased: number
          subscription_type: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: "free" | "pro" | "enterprise"
          subscription_status?: "active" | "inactive" | "cancelled" | "past_due"
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
          last_sign_in_at?: string | null
          email_confirmed_at?: string | null
          phone?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          is_super_admin?: boolean
          banned_until?: string | null
          deleted_at?: string | null
          company?: string | null
          pro_trial_used?: boolean
          single_reports_purchased?: number
          subscription_type?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: "free" | "pro" | "enterprise"
          subscription_status?: "active" | "inactive" | "cancelled" | "past_due"
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
          last_sign_in_at?: string | null
          email_confirmed_at?: string | null
          phone?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          is_super_admin?: boolean
          banned_until?: string | null
          deleted_at?: string | null
          company?: string | null
          pro_trial_used?: boolean
          single_reports_purchased?: number
          subscription_type?: string
        }
        Relationships: []
      }
      user_projects: {
        Row: {
          id: string
          user_id: string
          project_name: string
          address: string
          latitude: number
          longitude: number
          system_size_kw: number
          annual_production_kwh: number
          estimated_cost: number
          estimated_savings: number
          payback_period_years: number
          project_data: Json | null
          created_at: string
          updated_at: string | null
          is_archived: boolean
          tags: string[] | null
        }
        Insert: {
          id?: string
          user_id: string
          project_name: string
          address: string
          latitude: number
          longitude: number
          system_size_kw: number
          annual_production_kwh: number
          estimated_cost: number
          estimated_savings: number
          payback_period_years: number
          project_data?: Json | null
          created_at?: string
          updated_at?: string | null
          is_archived?: boolean
          tags?: string[] | null
        }
        Update: {
          id?: string
          user_id?: string
          project_name?: string
          address?: string
          latitude?: number
          longitude?: number
          system_size_kw?: number
          annual_production_kwh?: number
          estimated_cost?: number
          estimated_savings?: number
          payback_period_years?: number
          project_data?: Json | null
          created_at?: string
          updated_at?: string | null
          is_archived?: boolean
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "user_projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      solar_calculations: {
        Row: {
          id: string
          user_id: string | null
          project_id: string | null
          calculation_type: string | null
          input_data: Json | null
          results: Json | null
          created_at: string
          updated_at: string
          is_public: boolean
          calculation_version: string
          annual_energy_production: number | null
          annual_savings: number | null
          payback_period: number | null
          system_size: number | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          project_id?: string | null
          calculation_type?: string | null
          input_data?: Json | null
          results?: Json | null
          created_at?: string
          updated_at?: string
          is_public?: boolean
          calculation_version?: string
          annual_energy_production?: number | null
          annual_savings?: number | null
          payback_period?: number | null
          system_size?: number | null
        }
        Update: {
          id?: string
          user_id?: string | null
          project_id?: string | null
          calculation_type?: string | null
          input_data?: Json | null
          results?: Json | null
          created_at?: string
          updated_at?: string
          is_public?: boolean
          calculation_version?: string
          annual_energy_production?: number | null
          annual_savings?: number | null
          payback_period?: number | null
          system_size?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "solar_calculations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solar_calculations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_tier: "free" | "pro" | "enterprise"
      subscription_status: "active" | "inactive" | "cancelled" | "past_due"
      calculation_type: "basic" | "advanced" | "pro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    ? (Database["public"]["Tables"] & Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof Database["public"]["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof Database["public"]["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends keyof Database["public"]["Enums"] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never

// Helper types for common operations
export type User = Tables<"users">
export type UserProject = Tables<"user_projects">
export type SolarCalculation = Tables<"solar_calculations">
export type UsageTracking = Tables<"usage_tracking">

export type UserInsert = TablesInsert<"users">
export type UserProjectInsert = TablesInsert<"user_projects">
export type SolarCalculationInsert = TablesInsert<"solar_calculations">
export type UsageTrackingInsert = TablesInsert<"usage_tracking">

export type UserUpdate = TablesUpdate<"users">
export type UserProjectUpdate = TablesUpdate<"user_projects">
export type SolarCalculationUpdate = TablesUpdate<"solar_calculations">
export type UsageTrackingUpdate = TablesUpdate<"usage_tracking">
