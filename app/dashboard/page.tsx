"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Sun,
  Calculator,
  FileText,
  TrendingUp,
  Zap,
  DollarSign,
  Home,
  LogOut,
  Plus,
  Eye,
  Edit,
  Download,
  AlertCircle,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getCurrentUser, signOut } from "@/app/actions/auth-real"

interface User {
  id: string
  email: string
  name: string
  accountType: string
  subscriptionStatus: string
  subscriptionPlan: string
  calculationsUsed: number
  monthlyLimit: number
  emailVerified: boolean
}

interface Project {
  id: string
  customer_name: string
  project_name: string
  property_address: string
  system_size_kw: number
  annual_production_kwh: number
  system_cost: number
  net_cost: number
  annual_savings: number
  status: string
  created_at: string
}

interface Calculation {
  id: number
  address: string
  monthly_kwh: number
  electricity_rate: number
  calculation_type: string
  system_size_kw: number
  annual_production_kwh: number
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setIsLoading(true)
      const userData = await getCurrentUser()

      if (!userData) {
        router.push("/login")
        return
      }

      setUser(userData)

      // Load sample data for Rob's admin account
      if (userData.email === "rob@mysolarai.com") {
        setProjects([
          {
            id: "1",
            customer_name: "John Smith",
            project_name: "Residential Solar Installation",
            property_address: "123 Main St, San Francisco, CA",
            system_size_kw: 8.5,
            annual_production_kwh: 12750,
            system_cost: 25500,
            net_cost: 17850,
            annual_savings: 2340,
            status: "active",
            created_at: "2024-01-15",
          },
          {
            id: "2",
            customer_name: "Sarah Johnson",
            project_name: "Commercial Solar Array",
            property_address: "456 Business Ave, Los Angeles, CA",
            system_size_kw: 25.0,
            annual_production_kwh: 37500,
            system_cost: 75000,
            net_cost: 52500,
            annual_savings: 6900,
            status: "completed",
            created_at: "2024-02-20",
          },
          {
            id: "3",
            customer_name: "Mike Davis",
            project_name: "Home Solar System",
            property_address: "789 Oak St, San Diego, CA",
            system_size_kw: 6.2,
            annual_production_kwh: 9300,
            system_cost: 18600,
            net_cost: 13020,
            annual_savings: 1710,
            status: "active",
            created_at: "2024-03-10",
          },
        ])

        setCalculations([
          {
            id: 1,
            address: "123 Main St, San Francisco, CA",
            monthly_kwh: 850,
            electricity_rate: 0.28,
            calculation_type: "advanced",
            system_size_kw: 8.5,
            annual_production_kwh: 12750,
            created_at: "2024-01-15",
          },
          {
            id: 2,
            address: "456 Business Ave, Los Angeles, CA",
            monthly_kwh: 2500,
            electricity_rate: 0.24,
            calculation_type: "pro",
            system_size_kw: 25.0,
            annual_production_kwh: 37500,
            created_at: "2024-02-20",
          },
          {
            id: 3,
            address: "789 Oak St, San Diego, CA",
            monthly_kwh: 620,
            electricity_rate: 0.32,
            calculation_type: "basic",
            system_size_kw: 6.2,
            annual_production_kwh: 9300,
            created_at: "2024-03-10",
          },
        ])
      } else {
        // For regular users, show empty state or load their actual data
        setProjects([])
        setCalculations([])
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      setError("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      const result = await signOut()

      if (result?.error) {
        setError(result.error)
      } else {
        router.push("/login")
      }
    } catch (error) {
      console.error("Sign out error:", error)
      setError("Failed to sign out")
    } finally {
      setIsSigningOut(false)
    }
  }

  const getAccountTypeBadge = (accountType: string) => {
    switch (accountType) {
      case "admin":
        return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
      case "pro":
        return <Badge className="bg-blue-100 text-blue-800">Pro</Badge>
      case "free":
        return <Badge className="bg-gray-100 text-gray-800">Free</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      case "on_hold":
        return <Badge className="bg-yellow-100 text-yellow-800">On Hold</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-8 w-8 mx-auto text-red-600" />
          <p className="text-gray-600">Please sign in to access your dashboard</p>
          <Button onClick={() => router.push("/login")}>Go to Login</Button>
        </div>
      </div>
    )
  }

  const calculationUsagePercentage = (user.calculationsUsed / user.monthlyLimit) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Sun className="h-8 w-8 text-yellow-500" />
              <h1 className="text-xl font-bold text-gray-900">Solar Grind V2</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-gray-500">{user.email}</p>
                  {getAccountTypeBadge(user.accountType)}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex items-center space-x-2 bg-transparent"
              >
                {isSigningOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h2>
          <p className="text-gray-600">Here's an overview of your solar projects and calculations.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
              <p className="text-xs text-muted-foreground">Active solar installations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calculations Used</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user.calculationsUsed}/{user.monthlyLimit}
              </div>
              <div className="mt-2">
                <Progress value={calculationUsagePercentage} className="h-2" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {user.monthlyLimit - user.calculationsUsed} remaining this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${projects.reduce((sum, project) => sum + project.annual_savings, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Annual savings across all projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Energy Production</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(projects.reduce((sum, project) => sum + project.annual_production_kwh, 0) / 1000).toFixed(1)}
                MWh
              </div>
              <p className="text-xs text-muted-foreground">Annual production capacity</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                <span>Basic Calculator</span>
              </CardTitle>
              <CardDescription>Quick solar system sizing and savings estimate</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/basic-calculator">
                <Button className="w-full">Start Calculation</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>Advanced Analysis</span>
              </CardTitle>
              <CardDescription>Detailed solar analysis with financial projections</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/calculator">
                <Button className="w-full bg-transparent" variant="outline">
                  Advanced Tools
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <span>Generate Report</span>
              </CardTitle>
              <CardDescription>Create professional solar proposals</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/reports">
                <Button className="w-full bg-transparent" variant="outline">
                  Create Report
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Projects and Calculations */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="calculations">Calculations</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Projects</CardTitle>
                    <CardDescription>Manage your solar installation projects</CardDescription>
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center py-8">
                    <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                    <p className="text-gray-600 mb-4">Start by creating your first solar project</p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Project
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{project.project_name}</h4>
                            <p className="text-sm text-gray-600">{project.customer_name}</p>
                          </div>
                          {getStatusBadge(project.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{project.property_address}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">System Size</p>
                            <p className="font-medium">{project.system_size_kw} kW</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Annual Production</p>
                            <p className="font-medium">{project.annual_production_kwh.toLocaleString()} kWh</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Net Cost</p>
                            <p className="font-medium">${project.net_cost.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Annual Savings</p>
                            <p className="font-medium text-green-600">${project.annual_savings.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            Report
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calculations" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Calculations</CardTitle>
                    <CardDescription>View your solar calculation history</CardDescription>
                  </div>
                  <Button size="sm">
                    <Calculator className="h-4 w-4 mr-2" />
                    New Calculation
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {calculations.length === 0 ? (
                  <div className="text-center py-8">
                    <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No calculations yet</h3>
                    <p className="text-gray-600 mb-4">Start by running your first solar calculation</p>
                    <Button>
                      <Calculator className="h-4 w-4 mr-2" />
                      Start Calculating
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {calculations.map((calculation) => (
                      <div key={calculation.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{calculation.address}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(calculation.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800 capitalize">{calculation.calculation_type}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Monthly Usage</p>
                            <p className="font-medium">{calculation.monthly_kwh} kWh</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Electricity Rate</p>
                            <p className="font-medium">${calculation.electricity_rate}/kWh</p>
                          </div>
                          <div>
                            <p className="text-gray-500">System Size</p>
                            <p className="font-medium">{calculation.system_size_kw} kW</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Annual Production</p>
                            <p className="font-medium">{calculation.annual_production_kwh?.toLocaleString()} kWh</p>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View Results
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
