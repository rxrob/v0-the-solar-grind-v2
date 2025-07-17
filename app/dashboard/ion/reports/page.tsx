"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser } from "@/lib/supabase-browser"
import { FileText, Download, Eye, Calendar, Users, DollarSign, Sun, TrendingUp, Zap, Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface IonProject {
  id: string
  project_name: string
  homeowner_name: string
  homeowner_email: string
  address: string
  system_size_kw: number
  annual_production_kwh: number
  estimated_savings: number
  deal_status: string
  loan_amount: number
  monthly_payment: number
  created_at: string
}

export default function IonReportsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<IonProject[]>([])
  const [filteredProjects, setFilteredProjects] = useState<IonProject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { user } = await getCurrentUser()
        if (!user) {
          router.push("/login")
          return
        }

        const response = await fetch(`/api/ion-projects?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setProjects(data.projects || [])
          setFilteredProjects(data.projects || [])
        }
      } catch (error) {
        console.error("Error fetching projects:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [router])

  useEffect(() => {
    const filtered = projects.filter(
      (project) =>
        project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.homeowner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.address.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredProjects(filtered)
  }, [searchTerm, projects])

  const handleDownloadPDF = async (projectId: string, projectName: string) => {
    setDownloadingIds((prev) => new Set(prev).add(projectId))

    try {
      const response = await fetch(`/api/generate-ion-report?projectId=${projectId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `ion-solar-${projectName.replace(/\s+/g, "-").toLowerCase()}-report.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error downloading PDF:", error)
    } finally {
      setDownloadingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(projectId)
        return newSet
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "prospect":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "qualified":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "proposal":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "contract":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "installed":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-orange-900/20 to-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      </div>
    )
  }

  const totalReports = projects.length
  const totalCapacity = projects.reduce((sum, p) => sum + (p.system_size_kw || 0), 0)
  const totalSavings = projects.reduce((sum, p) => sum + (p.estimated_savings || 0), 0)
  const totalRevenue = projects.reduce((sum, p) => sum + (p.loan_amount || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900/10 to-slate-900 text-white">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
                  Report Center
                </h1>
                <p className="text-slate-400 mt-1">Generate unlimited professional solar reports</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-2">
                <Zap className="h-4 w-4 mr-2" />
                Unlimited Reports
              </Badge>
              <Button
                onClick={() => router.push("/pro-calculator")}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Report
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-orange-500/20 hover:shadow-lg hover:shadow-orange-500/10 transition-all backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Reports</CardTitle>
              <FileText className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{totalReports}</div>
              <p className="text-xs text-slate-400">Professional reports generated</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-orange-500/20 hover:shadow-lg hover:shadow-orange-500/10 transition-all backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Capacity</CardTitle>
              <Sun className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{totalCapacity.toFixed(1)} kW</div>
              <p className="text-xs text-slate-400">Solar systems analyzed</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-orange-500/20 hover:shadow-lg hover:shadow-orange-500/10 transition-all backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Client Savings</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">${totalSavings.toLocaleString()}</div>
              <p className="text-xs text-slate-400">Annual savings projected</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-orange-500/20 hover:shadow-lg hover:shadow-orange-500/10 transition-all backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Deal Value</CardTitle>
              <DollarSign className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-slate-400">Total pipeline value</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="bg-slate-800/50 border-orange-500/20 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Search className="h-5 w-5 mr-2 text-orange-500" />
              Search Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by project name, homeowner, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
            />
          </CardContent>
        </Card>

        {/* Reports List */}
        <Card className="bg-slate-800/50 border-orange-500/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <FileText className="h-5 w-5 mr-2 text-orange-500" />
              Available Reports ({filteredProjects.length})
            </CardTitle>
            <CardDescription className="text-slate-300">
              Professional solar analysis reports ready for download
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredProjects.length > 0 ? (
              <div className="space-y-4">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-6 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:bg-slate-700/50 transition-all"
                  >
                    <div className="flex items-center space-x-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                        <FileText className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg">{project.project_name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-slate-400 mt-1">
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {project.homeowner_name}
                          </span>
                          <span className="flex items-center">
                            <Sun className="h-3 w-3 mr-1" />
                            {project.system_size_kw} kW System
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />${project.loan_amount?.toLocaleString()} Deal
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(project.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{project.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge className={`${getStatusColor(project.deal_status)} mb-2`}>
                          {project.deal_status?.toUpperCase()}
                        </Badge>
                        <p className="text-sm text-slate-400">
                          Annual Production: {project.annual_production_kwh?.toLocaleString()} kWh
                        </p>
                        <p className="text-sm text-green-400">
                          Annual Savings: ${project.estimated_savings?.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-600 bg-transparent"
                          onClick={() => router.push(`/dashboard/ion/deals/${project.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                          onClick={() => handleDownloadPDF(project.id, project.project_name)}
                          disabled={downloadingIds.has(project.id)}
                        >
                          {downloadingIds.has(project.id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg mb-2">
                  {searchTerm ? "No reports found matching your search" : "No reports available yet"}
                </p>
                <p className="text-slate-500 mb-6">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Start by creating your first solar analysis to generate professional reports"}
                </p>
                <Button
                  onClick={() => router.push("/pro-calculator")}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Report
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
