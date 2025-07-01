"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Plus, MapPin, Zap, Calendar, MoreHorizontal, Eye, Edit, Download, Trash2 } from "lucide-react"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  location: string
  systemSize: number
  annualSavings: number
  status: "active" | "pending" | "completed" | "cancelled"
  createdAt: string
  projectValue: number
  installDate: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    // Simulate API call
    setTimeout(() => {
      setClients([
        {
          id: "1",
          name: "Smith Residence",
          email: "john.smith@email.com",
          phone: "(555) 123-4567",
          location: "Los Angeles, CA",
          systemSize: 8.5,
          annualSavings: 1800,
          status: "active",
          createdAt: "2024-01-15",
          projectValue: 25500,
          installDate: "2024-02-15",
        },
        {
          id: "2",
          name: "Johnson Home",
          email: "sarah.johnson@email.com",
          phone: "(555) 234-5678",
          location: "Phoenix, AZ",
          systemSize: 6.8,
          annualSavings: 1650,
          status: "pending",
          createdAt: "2024-01-10",
          projectValue: 20400,
          installDate: "2024-03-01",
        },
        {
          id: "3",
          name: "Brown Family",
          email: "mike.brown@email.com",
          phone: "(555) 345-6789",
          location: "San Diego, CA",
          systemSize: 12.2,
          annualSavings: 2400,
          status: "completed",
          createdAt: "2024-01-05",
          projectValue: 36600,
          installDate: "2024-01-28",
        },
        {
          id: "4",
          name: "Davis Corporation",
          email: "lisa.davis@company.com",
          phone: "(555) 456-7890",
          location: "Austin, TX",
          systemSize: 25.6,
          annualSavings: 4200,
          status: "active",
          createdAt: "2024-01-20",
          projectValue: 76800,
          installDate: "2024-04-15",
        },
        {
          id: "5",
          name: "Wilson Residence",
          email: "robert.wilson@email.com",
          phone: "(555) 567-8901",
          location: "Denver, CO",
          systemSize: 9.4,
          annualSavings: 2100,
          status: "cancelled",
          createdAt: "2024-01-12",
          projectValue: 28200,
          installDate: "2024-03-20",
        },
      ])
      setLoading(false)
    }, 1000)
  }

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    } as const

    return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>
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

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-96 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Client Projects</h1>
            <p className="text-muted-foreground">Manage your solar installation projects</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Projects</CardTitle>
                <CardDescription>A comprehensive list of all client projects and their status</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">System Size</TableHead>
                  <TableHead className="text-right">Project Value</TableHead>
                  <TableHead className="text-right">Annual Savings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Install Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-muted-foreground">ID: {client.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{client.email}</div>
                        <div className="text-sm text-muted-foreground">{client.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {client.location}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        {client.systemSize} kW
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(client.projectValue)}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(client.annualSavings)}
                    </TableCell>
                    <TableCell>{getStatusBadge(client.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(client.installDate)}
                      </div>
                    </TableCell>
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
            </Table>

            {filteredClients.length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  {searchTerm ? "No clients found matching your search." : "No clients yet."}
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
