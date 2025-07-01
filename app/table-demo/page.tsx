"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  MoreHorizontal,
  ArrowUpDown,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  Sun,
  Zap,
  DollarSign,
  Calendar,
  MapPin,
} from "lucide-react"

interface SolarProject {
  id: string
  customerName: string
  address: string
  systemSize: number
  panelCount: number
  estimatedCost: number
  annualSavings: number
  status: "pending" | "approved" | "installed" | "completed"
  installDate: string
  roi: number
}

interface Invoice {
  id: string
  customer: string
  amount: number
  status: "paid" | "pending" | "overdue"
  method: string
  date: string
}

const solarProjects: SolarProject[] = [
  {
    id: "PROJ-001",
    customerName: "John Smith",
    address: "123 Solar St, Austin, TX",
    systemSize: 8.5,
    panelCount: 24,
    estimatedCost: 25500,
    annualSavings: 1850,
    status: "completed",
    installDate: "2024-01-15",
    roi: 13.8,
  },
  {
    id: "PROJ-002",
    customerName: "Sarah Johnson",
    address: "456 Green Ave, Dallas, TX",
    systemSize: 12.2,
    panelCount: 36,
    estimatedCost: 36600,
    annualSavings: 2650,
    status: "installed",
    installDate: "2024-02-20",
    roi: 15.2,
  },
  {
    id: "PROJ-003",
    customerName: "Mike Brown",
    address: "789 Eco Blvd, Houston, TX",
    systemSize: 6.8,
    panelCount: 20,
    estimatedCost: 20400,
    annualSavings: 1420,
    status: "approved",
    installDate: "2024-03-10",
    roi: 12.1,
  },
  {
    id: "PROJ-004",
    customerName: "Lisa Davis",
    address: "321 Renewable Rd, San Antonio, TX",
    systemSize: 15.6,
    panelCount: 44,
    estimatedCost: 46800,
    annualSavings: 3200,
    status: "pending",
    installDate: "2024-04-05",
    roi: 16.8,
  },
  {
    id: "PROJ-005",
    customerName: "Robert Wilson",
    address: "654 Clean Energy Ct, Fort Worth, TX",
    systemSize: 9.4,
    panelCount: 28,
    estimatedCost: 28200,
    annualSavings: 2100,
    status: "completed",
    installDate: "2024-01-28",
    roi: 14.5,
  },
]

const invoices: Invoice[] = [
  {
    id: "INV-001",
    customer: "John Smith",
    amount: 25500,
    status: "paid",
    method: "Credit Card",
    date: "2024-01-15",
  },
  {
    id: "INV-002",
    customer: "Sarah Johnson",
    amount: 36600,
    status: "paid",
    method: "Bank Transfer",
    date: "2024-02-20",
  },
  {
    id: "INV-003",
    customer: "Mike Brown",
    amount: 20400,
    status: "pending",
    method: "Check",
    date: "2024-03-10",
  },
  {
    id: "INV-004",
    customer: "Lisa Davis",
    amount: 46800,
    status: "overdue",
    method: "Credit Card",
    date: "2024-04-05",
  },
]

export default function TableDemo() {
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredProjects = solarProjects.filter((project) => {
    const matchesSearch =
      project.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSelectProject = (projectId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId],
    )
  }

  const handleSelectAll = () => {
    setSelectedProjects(selectedProjects.length === filteredProjects.length ? [] : filteredProjects.map((p) => p.id))
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      approved: "default",
      installed: "outline",
      completed: "default",
    } as const

    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-blue-100 text-blue-800",
      installed: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]} className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getInvoiceStatusBadge = (status: string) => {
    const colors = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      overdue: "bg-red-100 text-red-800",
    }

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const totalProjectValue = filteredProjects.reduce((sum, project) => sum + project.estimatedCost, 0)
  const totalAnnualSavings = filteredProjects.reduce((sum, project) => sum + project.annualSavings, 0)

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Table Components Demo</h1>
          <p className="text-muted-foreground mt-1">Comprehensive examples of table usage in Solar Grind V2</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Solar Projects Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5" />
                Solar Installation Projects
              </CardTitle>
              <CardDescription>Manage and track your solar installation projects</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Projects</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("approved")}>Approved</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("installed")}>Installed</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("completed")}>Completed</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {selectedProjects.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{selectedProjects.length} selected</span>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Bulk Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of your recent solar installation projects.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProjects.length === filteredProjects.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="h-auto p-0 font-medium">
                    Project ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">System Size</TableHead>
                <TableHead className="text-right">Panels</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Annual Savings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Install Date</TableHead>
                <TableHead className="text-right">ROI %</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id} className={selectedProjects.includes(project.id) ? "bg-muted/50" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProjects.includes(project.id)}
                      onCheckedChange={() => handleSelectProject(project.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{project.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{project.customerName}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {project.address}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      {project.systemSize} kW
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{project.panelCount}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(project.estimatedCost)}</TableCell>
                  <TableCell className="text-right text-green-600 font-medium">
                    {formatCurrency(project.annualSavings)}
                  </TableCell>
                  <TableCell>{getStatusBadge(project.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {formatDate(project.installDate)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-green-600">{project.roi}%</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Project
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download Report
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={6}>Total</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(totalProjectValue)}</TableCell>
                <TableCell className="text-right font-medium text-green-600">
                  {formatCurrency(totalAnnualSavings)}
                </TableCell>
                <TableCell colSpan={4}></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Recent Invoices
          </CardTitle>
          <CardDescription>A list of your recent invoices and payment status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.customer}</TableCell>
                  <TableCell>{getInvoiceStatusBadge(invoice.status)}</TableCell>
                  <TableCell>{invoice.method}</TableCell>
                  <TableCell>{formatDate(invoice.date)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(invoice.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5}>Total</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(invoices.reduce((sum, invoice) => sum + invoice.amount, 0))}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      {/* Simple Equipment Table */}
      <Card>
        <CardHeader>
          <CardTitle>Solar Equipment Catalog</CardTitle>
          <CardDescription>Available solar panels and equipment specifications</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Wattage</TableHead>
                <TableHead className="text-right">Efficiency</TableHead>
                <TableHead className="text-right">Warranty</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">SunPower</TableCell>
                <TableCell>Maxeon 3</TableCell>
                <TableCell>Monocrystalline</TableCell>
                <TableCell className="text-right">400W</TableCell>
                <TableCell className="text-right">22.6%</TableCell>
                <TableCell className="text-right">25 years</TableCell>
                <TableCell className="text-right">$350</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">LG</TableCell>
                <TableCell>NeON R</TableCell>
                <TableCell>Monocrystalline</TableCell>
                <TableCell className="text-right">365W</TableCell>
                <TableCell className="text-right">21.7%</TableCell>
                <TableCell className="text-right">25 years</TableCell>
                <TableCell className="text-right">$320</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Canadian Solar</TableCell>
                <TableCell>HiKu6</TableCell>
                <TableCell>Monocrystalline</TableCell>
                <TableCell className="text-right">445W</TableCell>
                <TableCell className="text-right">20.9%</TableCell>
                <TableCell className="text-right">20 years</TableCell>
                <TableCell className="text-right">$280</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Jinko Solar</TableCell>
                <TableCell>Tiger Pro</TableCell>
                <TableCell>Monocrystalline</TableCell>
                <TableCell className="text-right">420W</TableCell>
                <TableCell className="text-right">21.2%</TableCell>
                <TableCell className="text-right">20 years</TableCell>
                <TableCell className="text-right">$260</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
