"use client"

import { ReportGenerator } from "@/components/report-generator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Crown, CheckCircle, Star } from "lucide-react"

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-yellow-600 bg-clip-text text-transparent">
            Professional Solar Reports
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create stunning, professional solar analysis reports that impress your customers and close more deals
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  Standard Reports
                </CardTitle>
                <Badge variant="secondary">Free</Badge>
              </div>
              <CardDescription>
                Professional solar analysis reports with essential metrics and clean design
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">System sizing and specifications</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Financial analysis and ROI calculations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Environmental impact metrics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Professional PDF export</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Clean, modern design</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-6 w-6 text-yellow-600" />
                  Enhanced Reports
                </CardTitle>
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Pro
                </Badge>
              </div>
              <CardDescription>
                Premium reports with advanced analytics, stunning visuals, and comprehensive market insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Everything in Standard Reports</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Advanced performance metrics & analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Detailed site assessment & property analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Multiple financing options & scenarios</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Comprehensive warranty information</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Market analysis & competitive positioning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Premium visual design with gradients & effects</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Interactive charts and visualizations</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Report Generator */}
        <ReportGenerator />
      </div>
    </div>
  )
}
