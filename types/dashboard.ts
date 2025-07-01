// Dashboard-specific type definitions

export interface DashboardData {
  totalCalculations: number
  monthlyCalculations: number
  reportsGenerated: number
  totalSavings: number
  recentCalculations: RecentCalculation[]
}

export interface RecentCalculation {
  id: string
  property_address: string
  system_size_kw: number
  annual_savings: number
  created_at: string
}

export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalSavings: number
  monthlyUsage: {
    basic: number
    pro: number
  }
}

export interface ProjectSummary {
  id: string
  customerName: string
  propertyAddress: string
  systemSizeKw: number
  status: "draft" | "active" | "completed" | "cancelled" | "in_progress"
  annualSavings: number
  createdAt: string
  updatedAt: string
}

export interface UsageSummary {
  currentMonth: {
    basic: number
    pro: number
  }
  limits: {
    basic: number
    pro: number
  }
  percentageUsed: {
    basic: number
    pro: number
  }
}
