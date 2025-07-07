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
          subscription_type: "free" | "pro"
          subscription_status: string | null
          stripe_customer_id: string | null
          single_reports_purchased: number
          single_reports_used: number
          pro_trial_used: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_type?: "free" | "pro"
          subscription_status?: string | null
          stripe_customer_id?: string | null
          single_reports_purchased?: number
          single_reports_used?: number
          pro_trial_used?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_type?: "free" | "pro"
          subscription_status?: string | null
          stripe_customer_id?: string | null
          single_reports_purchased?: number
          single_reports_used?: number
          pro_trial_used?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_projects: {
        Row: {
          id: string
          user_id: string
          project_name: string
          address: string
          latitude: number | null
          longitude: number | null
          system_size_kw: number | null
          annual_production_kwh: number | null
          estimated_savings: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_name: string
          address: string
          latitude?: number | null
          longitude?: number | null
          system_size_kw?: number | null
          annual_production_kwh?: number | null
          estimated_savings?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_name?: string
          address?: string
          latitude?: number | null
          longitude?: number | null
          system_size_kw?: number | null
          annual_production_kwh?: number | null
          estimated_savings?: number | null
          created_at?: string
          updated_at?: string
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
          user_id: string
          project_id: string | null
          calculation_type: "basic" | "advanced"
          input_data: Json
          results: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          calculation_type: "basic" | "advanced"
          input_data: Json
          results: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          calculation_type?: "basic" | "advanced"
          input_data?: Json
          results?: Json
          created_at?: string
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

export type UserInsert = TablesInsert<"users">
export type UserProjectInsert = TablesInsert<"user_projects">
export type SolarCalculationInsert = TablesInsert<"solar_calculations">

export type UserUpdate = TablesUpdate<"users">
export type UserProjectUpdate = TablesUpdate<"user_projects">
export type SolarCalculationUpdate = TablesUpdate<"solar_calculations">
