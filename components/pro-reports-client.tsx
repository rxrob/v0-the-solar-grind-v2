"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Eye, Calendar, MapPin } from "lucide-react"
import type { Report } from "@/types"

interface ProReportsClientPageProps {
  reports: Report[]
}

export function ProReportsClientPage({ reports }: ProReportsClientPageProps) {
  const handleDownload = (reportId: string) => {
    // Simulate download
    console.log("Downloading report:", reportId)
  }

  const handlePreview = (reportId: string) => {
    // Simulate preview
    console.log("Previewing report:", reportId)
  }

  const getStatusBadge = (status: Report["status"]) => {
    const variants = {
      generated: "default",
      pending: "secondary",
      error: "destructive",
    } as const

    return <Badge variant={variants[status]}>{status}</Badge>
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
