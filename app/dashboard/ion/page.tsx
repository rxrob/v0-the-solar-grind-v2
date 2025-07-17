"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Zap,
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Building2,
  Handshake,
  Calculator,
  Download,
  Plus,
  Eye,
  Target,
  Award,
  Briefcase,
} from "lucide-react"
import { createClient } from "@/lib/supabase-browser"
import Link from "next/link"

interface IonProject {
  id: string
  project_name: string
  homeowner_name: string
  homeowner_email: string
  homeowner_phone: string
  address: string
  system_size_kw: number
  annual_production_kwh: number
  estimated_savings: number
  deal_status: string
  loan_amount?: number
  monthly_payment?: number
  financing_type?: string
  created_at: string
}

interface DashboardStats {
  totalProjects: number
  totalCapacity: number
  totalSavings: number
  pipelineValue: number
  averageDealSize: number
  conversionRate: number
}

export default function IonDashboard() {
  const [projects, setProjects] = useState<IonProject[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalCapacity: 0,
    totalSavings: 0,
    pipelineValue: 0,
    averageDealSize: 0,
    conversionRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchUserAndProjects()
  }, [])

  const fetchUserAndProjects = async () => {
    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      if (!currentUser) return

      setUser(currentUser)

      // Fetch Ion projects
      const { data: projectsData, error } = await supabase
        .from("ion_projects")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching projects:", error)
        return
      }

      setProjects(projectsData || [])

      // Calculate stats
      const totalProjects = projectsData?.length || 0
      const totalCapacity = projectsData?.reduce((sum, p) => sum + p.system_size_kw, 0) || 0
      const totalSavings = projectsData?.reduce((sum, p) => sum + p.estimated_savings, 0) || 0
      const pipelineValue = projectsData?.reduce((sum, p) => sum + (p.loan_amount || 0), 0) || 0
      const averageDealSize = totalProjects > 0 ? pipelineValue / totalProjects : 0
      const installedProjects = projectsData?.filter((p) => p.deal_status === "installed").length || 0
      const conversionRate = totalProjects > 0 ? (installedProjects / totalProjects) * 100 : 0

      setStats({
        totalProjects,
        totalCapacity,
        totalSavings,
        pipelineValue,
        averageDealSize,
        conversionRate,
      })
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "prospect":
        return "bg-gray-500"
      case "qualified":
        return "bg-blue-500"
      case "proposal":
        return "bg-yellow-500"
      case "contract":
        return "bg-orange-500"
      case "installed":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "prospect":
        return <Users className="w-4 h-4" />
      case "qualified":
        return <Target className="w-4 h-4" />
      case "proposal":
        return <FileText className="w-4 h-4" />
      case "contract":
        return <Handshake className="w-4 h-4" />
      case "installed":
        return <Award className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading Ion Solar Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header with Ion Solar Branding */}
      <div className="bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-600 p-6 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">iON Solar Dashboard</h1>
                <p className="text-orange-100">Professional Solar Sales Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-white/20 text-white border-white/30">
                <Briefcase className="w-4 h-4 mr-2" />
                Ion Professional
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Projects</CardTitle>
              <Building2 className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalProjects}</div>
              <p className="text-xs text-slate-400">Active deals in pipeline</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Capacity</CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalCapacity.toFixed(1)} kW</div>
              <p className="text-xs text-slate-400">Solar capacity sold</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Pipeline Value</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${stats.pipelineValue.toLocaleString()}</div>
              <p className="text-xs text-slate-400">Total deal value</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-slate-400">Prospect to install</p>
            </CardContent>
          </Card>
        </div>

        {/* Professional Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-orange-600/20 to-yellow-600/20 backdrop-blur-sm border-orange-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Handshake className="w-5 h-5 mr-2 text-orange-400" />
                Lender Portal
              </CardTitle>
              <CardDescription className="text-orange-100">
                Connect with financing partners and manage loan applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">Access Lender Network</Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-blue-400" />
                Contractor Network
              </CardTitle>
              <CardDescription className="text-blue-100">
                Manage installation partners and track project progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Manage Contractors</Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm border-green-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-green-400" />
                Pro Calculator
              </CardTitle>
              <CardDescription className="text-green-100">
                Advanced solar calculations with Ion Solar branding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/pro-calculator/step-1">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Calculation
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Recent Projects</CardTitle>
                <CardDescription className="text-slate-400">Your latest solar deals and their status</CardDescription>
              </div>
              <Link href="/dashboard/ion/clients">
                <Button
                  variant="outline"
                  className="border-orange-500 text-orange-400 hover:bg-orange-500/10 bg-transparent"
                >
                  View All Projects
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No projects yet</p>
                <Link href="/pro-calculator/step-1">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Project
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 5).map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Badge className={`${getStatusColor(project.deal_status)} text-white`}>
                          {getStatusIcon(project.deal_status)}
                          <span className="ml-1 capitalize">{project.deal_status || "prospect"}</span>
                        </Badge>
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{project.project_name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {project.homeowner_name}
                          </span>
                          <span className="flex items-center">
                            <Zap className="w-3 h-3 mr-1" />
                            {project.system_size_kw} kW
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" />${project.estimated_savings.toLocaleString()} savings
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/pro-calculator/step-1">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:border-orange-500/50 transition-colors cursor-pointer">
              <CardContent className="p-4 text-center">
                <Plus className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-white font-medium">New Project</p>
                <p className="text-xs text-slate-400">Start solar calculation</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/ion/clients">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-white font-medium">Manage Clients</p>
                <p className="text-xs text-slate-400">View all homeowners</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/ion/reports">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:border-green-500/50 transition-colors cursor-pointer">
              <CardContent className="p-4 text-center">
                <FileText className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-white font-medium">Generate Reports</p>
                <p className="text-xs text-slate-400">Professional PDFs</p>
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:border-purple-500/50 transition-colors cursor-pointer">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-white font-medium">Analytics</p>
              <p className="text-xs text-slate-400">Performance metrics</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
