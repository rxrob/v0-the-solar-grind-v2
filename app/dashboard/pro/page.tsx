"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calculator,
  TrendingUp,
  Users,
  FileText,
  Sun,
  DollarSign,
  Zap,
  Crown,
  ArrowRight,
  MapPin,
  Building,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react"
import { useAuthReal } from "@/hooks/use-auth-real"
import Link from "next/link"

interface ProDashboardStats {
  totalCalculations: number
  monthlyCalculations: number
  totalSavings: number
  activeProjects: number
  completedProjects: number
  totalSystemCapacity: number
  averageProjectValue: number
  clientCount: number
}

interface ProProject {
  id: string
  name: string
  client: string
  location: string
  systemSize: number
  savings: number
  projectValue: number
  status: "completed" | "in_progress" | "planning"
  date: string
  completionDate?: string
}

export default function ProDashboardPage() {
  const { user, profile, loading } = useAuthReal()
  const router = useRouter()
  const [stats, setStats] = useState<ProDashboardStats>({
    totalCalculations: 0,
    monthlyCalculations: 0,
    totalSavings: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalSystemCapacity: 0,
    averageProjectValue: 0,
    clientCount: 0,
  })
  const [recentProjects, setRecentProjects] = useState<ProProject[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (profile?.subscription_type !== "pro" && !loading) {
      router.push("/dashboard")
      return
    }

    // Load pro dashboard data
    if (user && profile?.subscription_type === "pro") {
      loadProDashboardData()
    }
  }, [user, profile, loading, router])

  const loadProDashboardData = async () => {
    // Simulate loading comprehensive pro dashboard data
    setStats({
      totalCalculations: 47,
      monthlyCalculations: 47,
      totalSavings: 321060,
      activeProjects: 7,
      completedProjects: 8,
      totalSystemCapacity: 70.5,
      averageProjectValue: 105000,
      clientCount: 12,
    })

    setRecentProjects([
      {
        id: "1",
        name: "Johnson Residence Solar",
        client: "Johnson Family",
        location: "Sacramento, CA",
        systemSize: 8.5,
        savings: 2890,
        projectValue: 25500,
        status: "completed",
        date: "2024-01-15",
        completionDate: "2024-01-20",
      },
      {
        id: "2",
        name: "Green Valley Office",
        client: "Green Valley Corp",
        location: "Folsom, CA",
        systemSize: 25.0,
        savings: 8500,
        projectValue: 75000,
        status: "in_progress",
        date: "2024-01-10",
      },
      {
        id: "3",
        name: "Smith Family Home",
        client: "Smith Family",
        location: "Davis, CA",
        systemSize: 12.0,
        savings: 4080,
        projectValue: 36000,
        status: "completed",
        date: "2024-01-08",
        completionDate: "2024-01-18",
      },
      {
        id: "4",
        name: "Riverside Warehouse",
        client: "Riverside Industries",
        location: "Elk Grove, CA",
        systemSize: 50.0,
        savings: 17000,
        projectValue: 150000,
        status: "in_progress",
        date: "2024-01-05",
      },
      {
        id: "5",
        name: "Downtown Retail Store",
        client: "Metro Retail",
        location: "Citrus Heights, CA",
        systemSize: 18.0,
        savings: 6120,
        projectValue: 54000,
        status: "planning",
        date: "2024-01-03",
      },
    ])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Sun className="h-12 w-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your pro dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || profile?.subscription_type !== "pro") {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "planning":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "in_progress":
        return <Clock className="h-4 w-4" />
      case "planning":
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "in_progress":
        return "In Progress"
      case "planning":
        return "Planning"
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Sun className="h-8 w-8 text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Solar Grind Pro</h1>
                <p className="text-sm text-gray-600">Welcome back, {profile?.name || user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <Crown className="h-3 w-3 mr-1" />
                Pro Account
              </Badge>
              <Link href="/billing">
                <Button variant="outline">Manage Billing</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Total Client Savings</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">${stats.totalSavings.toLocaleString()}</div>
              <p className="text-xs text-blue-700">From {stats.completedProjects + stats.activeProjects} projects</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Monthly Calculations</CardTitle>
              <Calculator className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{stats.monthlyCalculations}</div>
              <p className="text-xs text-green-700">Unlimited • Pro feature</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">System Capacity</CardTitle>
              <Zap className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{stats.totalSystemCapacity} kW</div>
              <p className="text-xs text-purple-700">Total installed capacity</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Avg Project Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">${stats.averageProjectValue.toLocaleString()}</div>
              <p className="text-xs text-orange-700">Per installation</p>
            </CardContent>
          </Card>
        </div>

        {/* Project Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Completed Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.completedProjects}</div>
              <Progress
                value={(stats.completedProjects / (stats.completedProjects + stats.activeProjects)) * 100}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 text-blue-500 mr-2" />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">4</div>
              <Progress value={40} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                Planning Phase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">3</div>
              <Progress value={30} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="tools">Pro Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Projects</CardTitle>
                    <CardDescription>Manage your solar installation projects</CardDescription>
                  </div>
                  <Link href="/pro-calculator">
                    <Button>
                      <Calculator className="h-4 w-4 mr-2" />
                      New Project
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full">
                              <Building className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{project.name}</h3>
                              <p className="text-sm text-gray-600 mb-1">{project.client}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {project.location}
                                </div>
                                <div className="flex items-center">
                                  <Zap className="h-4 w-4 mr-1" />
                                  {project.systemSize} kW
                                </div>
                                <div className="flex items-center">
                                  <DollarSign className="h-4 w-4 mr-1" />${project.savings.toLocaleString()}/year
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <p className="font-semibold">${project.projectValue.toLocaleString()}</p>
                              <p className="text-xs text-gray-500">Project Value</p>
                            </div>
                            <Badge className={`${getStatusColor(project.status)} flex items-center space-x-1`}>
                              {getStatusIcon(project.status)}
                              <span>{getStatusText(project.status)}</span>
                            </Badge>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Management</CardTitle>
                <CardDescription>Manage your client relationships and projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Client Management</h3>
                  <p className="text-gray-600 mb-4">Track {stats.clientCount} active clients and their projects</p>
                  <Button>
                    <Users className="h-4 w-4 mr-2" />
                    View All Clients
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Analytics</CardTitle>
                  <CardDescription>Track your business performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Monthly Revenue</span>
                      <span className="text-lg font-bold">${(stats.averageProjectValue * 0.1).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Conversion Rate</span>
                      <span className="text-lg font-bold">68%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Avg. Project Size</span>
                      <span className="text-lg font-bold">
                        {(stats.totalSystemCapacity / (stats.completedProjects + stats.activeProjects)).toFixed(1)} kW
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Project Completion Rate</span>
                        <span className="text-sm font-bold">67%</span>
                      </div>
                      <Progress value={67} />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Client Satisfaction</span>
                        <span className="text-sm font-bold">94%</span>
                      </div>
                      <Progress value={94} />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Monthly Growth</span>
                        <span className="text-sm font-bold">23%</span>
                      </div>
                      <Progress value={23} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calculator className="h-5 w-5 mr-2 text-blue-600" />
                    Pro Calculator
                  </CardTitle>
                  <CardDescription>Advanced solar calculations with NREL integration</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/pro-calculator">
                    <Button className="w-full">
                      Launch Calculator
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-green-600" />
                    Report Generator
                  </CardTitle>
                  <CardDescription>Generate professional PDF reports for clients</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/reports">
                    <Button className="w-full bg-transparent" variant="outline">
                      Generate Report
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                    Terrain Analysis
                  </CardTitle>
                  <CardDescription>Advanced terrain and elevation analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/test-terrain">
                    <Button className="w-full bg-transparent" variant="outline">
                      Analyze Terrain
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
