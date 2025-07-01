"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Eye, Calendar, MapPin } from "lucide-react"

interface Report {
  id: string
  title: string
  client: string
  location: string
  systemSize: number
  createdAt: string
  status: "generated" | "pending" | "error"
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    // Simulate API call
    setTimeout(() => {
      setReports([
        {
          id: "1",
          title: "Solar Analysis Report - Smith Residence",
          client: "John Smith",
          location: "Los Angeles, CA",
          systemSize: 8.5,
          createdAt: "2024-01-15",
          status: "generated",
        },
        {
          id: "2",
          title: "Solar Proposal - Johnson Home",
          client: "Sarah Johnson",
          location: "Phoenix, AZ",
          systemSize: 6.8,
          createdAt: "2024-01-10",
          status: "generated",
        },
        {
          id: "3",
          title: "Commercial Solar Study - Brown Corp",
          client: "Brown Corporation",
          location: "San Diego, CA",
          systemSize: 45.2,
          createdAt: "2024-01-05",
          status: "pending",
        },
      ])
      setLoading(false)
    }, 1000)
  }

  const handleDownload = (reportId: string) => {
    // Simulate download
    console.log("Downloading report:", reportId)
  }

  const handlePreview = (reportId: string) => {
    // Simulate preview
    console.log("Previewing report:", reportId)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      generated: "default",
      pending: "secondary",
      error: "destructive",
    } as const

    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>
  }

  if (loading) {
    return <div>Loading reports...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Generated Reports</h1>
        <p className="text-muted-foreground">View and download your solar analysis reports</p>
      </div>

      <div className="grid gap-6">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {report.title}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    <div className="flex items-center gap-4 text-sm">
                      <span>Client: {report.client}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {report.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardDescription>
                </div>
                {getStatusBadge(report.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">System Size</div>
                    <div className="font-semibold">{report.systemSize} kW</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Report Type</div>
                    <div className="font-semibold">{report.systemSize > 20 ? "Commercial" : "Residential"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Format</div>
                    <div className="font-semibold">PDF</div>
                  </div>
                </div>

                {report.status === "generated" && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handlePreview(report.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button size="sm" onClick={() => handleDownload(report.id)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}

                {report.status === "pending" && (
                  <div className="text-sm text-muted-foreground">Report generation in progress...</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reports.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="text-muted-foreground mb-4">No reports generated yet.</div>
            <Button>Create Your First Report</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
