"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser } from "@/lib/supabase-browser"
import {
  Search,
  Users,
  Mail,
  Phone,
  MapPin,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  DollarSign,
  Sun,
  Calendar,
} from "lucide-react"

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
  financing_type: string
  loan_amount: number
  monthly_payment: number
  created_at: string
}

export default function IonClientsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<IonProject[]>([])
  const [filteredProjects, setFilteredProjects] = useState<IonProject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

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
        project.homeowner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.homeowner_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.project_name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredProjects(filtered)
  }, [searchTerm, projects])

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

  const handleDownloadPDF = async (projectId: string) => {
    try {
      const response = await fetch(`/api/generate-ion-report?projectId=${projectId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `ion-solar-report-${projectId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error downloading PDF:", error)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this client project?")) return

    try {
      const response = await fetch(`/api/ion-projects/${projectId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setProjects(projects.filter((p) => p.id !== projectId))
      }
    } catch (error) {
      console.error("Error deleting project:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-orange-900/20 to-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900/10 to-slate-900 text-white">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
                  Client Management
                </h1>
                <p className="text-slate-400 mt-1">Manage homeowner information and solar projects</p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/pro-calculator")}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Client Project
            </Button>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-orange-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Search className="h-5 w-5 mr-2 text-orange-500" />
                  Search Clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Search by name, email, address, or project..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-800/50 border-orange-500/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{projects.length}</div>
              <p className="text-xs text-slate-400">Active homeowners</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-orange-500/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Pipeline Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${projects.reduce((sum, p) => sum + (p.loan_amount || 0), 0).toLocaleString()}
              </div>
              <p className="text-xs text-slate-400">Total deal value</p>
            </CardContent>
          </Card>
        </div>

        {/* Client List */}
        <Card className="bg-slate-800/50 border-orange-500/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Users className="h-5 w-5 mr-2 text-orange-500" />
              Client Projects ({filteredProjects.length})
            </CardTitle>
            <CardDescription className="text-slate-300">
              Comprehensive view of all homeowner solar projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredProjects.length > 0 ? (
              <div className="space-y-4">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="p-6 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:bg-slate-700/50 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-white text-lg">{project.homeowner_name}</h3>
                            <Badge className={getStatusColor(project.deal_status)}>
                              {project.deal_status?.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-400">
                            <div className="space-y-2">
                              <p className="flex items-center">
                                <Mail className="h-4 w-4 mr-2 text-orange-500" />
                                {project.homeowner_email}
                              </p>
                              <p className="flex items-center">
                                <Phone className="h-4 w-4 mr-2 text-orange-500" />
                                {project.homeowner_phone}
                              </p>
                              <p className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                                {project.address}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="flex items-center">
                                <Sun className="h-4 w-4 mr-2 text-yellow-500" />
                                {project.system_size_kw} kW System
                              </p>
                              <p className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-2 text-green-500" />$
                                {project.loan_amount?.toLocaleString()} Deal Value
                              </p>
                              <p className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                                {new Date(project.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-slate-800/50 rounded-lg">
                            <p className="text-sm font-medium text-white mb-1">Project: {project.project_name}</p>
                            <div className="flex items-center space-x-4 text-xs text-slate-400">
                              <span>Annual Production: {project.annual_production_kwh?.toLocaleString()} kWh</span>
                              <span>Annual Savings: ${project.estimated_savings?.toLocaleString()}</span>
                              <span>Monthly Payment: ${project.monthly_payment}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
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
                          variant="outline"
                          className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white bg-transparent"
                          onClick={() => handleDownloadPDF(project.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white bg-transparent"
                          onClick={() => router.push(`/dashboard/ion/deals/${project.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white bg-transparent"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg mb-2">
                  {searchTerm ? "No clients found matching your search" : "No clients yet"}
                </p>
                <p className="text-slate-500 mb-6">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Start by creating your first solar analysis and client project"}
                </p>
                <Button
                  onClick={() => router.push("/pro-calculator")}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Client Project
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
