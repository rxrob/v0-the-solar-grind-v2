"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Calendar, Users, Wrench, TrendingUp, AlertTriangle, CheckCircle, Clock, Sun } from "lucide-react"

interface ProjectTask {
  id: string
  projectId: string
  task: string
  assignee: string
  status: "pending" | "in-progress" | "completed" | "blocked"
  dueDate: string
  priority: "low" | "medium" | "high"
}

interface ProjectMilestone {
  id: string
  projectId: string
  milestone: string
  targetDate: string
  completedDate?: string
  status: "upcoming" | "in-progress" | "completed" | "overdue"
}

interface TeamMember {
  id: string
  name: string
  role: string
  activeProjects: number
  completedTasks: number
  efficiency: number
  availability: "available" | "busy" | "unavailable"
}

const projectTasks: ProjectTask[] = [
  {
    id: "TASK-001",
    projectId: "PROJ-001",
    task: "Site Survey and Assessment",
    assignee: "Mike Johnson",
    status: "completed",
    dueDate: "2024-01-10",
    priority: "high",
  },
  {
    id: "TASK-002",
    projectId: "PROJ-001",
    task: "Permit Application Submission",
    assignee: "Sarah Davis",
    status: "completed",
    dueDate: "2024-01-15",
    priority: "high",
  },
  {
    id: "TASK-003",
    projectId: "PROJ-002",
    task: "Equipment Procurement",
    assignee: "Tom Wilson",
    status: "in-progress",
    dueDate: "2024-02-01",
    priority: "medium",
  },
  {
    id: "TASK-004",
    projectId: "PROJ-002",
    task: "Installation Scheduling",
    assignee: "Lisa Brown",
    status: "pending",
    dueDate: "2024-02-05",
    priority: "medium",
  },
  {
    id: "TASK-005",
    projectId: "PROJ-003",
    task: "Electrical Inspection",
    assignee: "Mike Johnson",
    status: "blocked",
    dueDate: "2024-01-25",
    priority: "high",
  },
]

const projectMilestones: ProjectMilestone[] = [
  {
    id: "MILE-001",
    projectId: "PROJ-001",
    milestone: "Permits Approved",
    targetDate: "2024-01-20",
    completedDate: "2024-01-18",
    status: "completed",
  },
  {
    id: "MILE-002",
    projectId: "PROJ-001",
    milestone: "Installation Complete",
    targetDate: "2024-02-15",
    status: "in-progress",
  },
  {
    id: "MILE-003",
    projectId: "PROJ-002",
    milestone: "Equipment Delivery",
    targetDate: "2024-02-10",
    status: "upcoming",
  },
  {
    id: "MILE-004",
    projectId: "PROJ-003",
    milestone: "Final Inspection",
    targetDate: "2024-01-30",
    status: "overdue",
  },
]

const teamMembers: TeamMember[] = [
  {
    id: "TEAM-001",
    name: "Mike Johnson",
    role: "Lead Installer",
    activeProjects: 3,
    completedTasks: 24,
    efficiency: 95,
    availability: "busy",
  },
  {
    id: "TEAM-002",
    name: "Sarah Davis",
    role: "Project Manager",
    activeProjects: 5,
    completedTasks: 18,
    efficiency: 88,
    availability: "available",
  },
  {
    id: "TEAM-003",
    name: "Tom Wilson",
    role: "Procurement Specialist",
    activeProjects: 2,
    completedTasks: 12,
    efficiency: 92,
    availability: "available",
  },
  {
    id: "TEAM-004",
    name: "Lisa Brown",
    role: "Installation Coordinator",
    activeProjects: 4,
    completedTasks: 21,
    efficiency: 90,
    availability: "busy",
  },
]

export default function ProjectManagement() {
  const [selectedTab, setSelectedTab] = useState("tasks")

  const getTaskStatusBadge = (status: string) => {
    const variants = {
      pending: { color: "bg-gray-100 text-gray-800", icon: Clock },
      "in-progress": { color: "bg-blue-100 text-blue-800", icon: TrendingUp },
      completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      blocked: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
    }

    const variant = variants[status as keyof typeof variants]
    const Icon = variant.icon

    return (
      <Badge className={variant.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    }

    return (
      <Badge className={colors[priority as keyof typeof colors]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    )
  }

  const getMilestoneStatusBadge = (status: string) => {
    const variants = {
      upcoming: { color: "bg-gray-100 text-gray-800", icon: Clock },
      "in-progress": { color: "bg-blue-100 text-blue-800", icon: TrendingUp },
      completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      overdue: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
    }

    const variant = variants[status as keyof typeof variants]
    const Icon = variant.icon

    return (
      <Badge className={variant.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getAvailabilityBadge = (availability: string) => {
    const colors = {
      available: "bg-green-100 text-green-800",
      busy: "bg-yellow-100 text-yellow-800",
      unavailable: "bg-red-100 text-red-800",
    }

    return (
      <Badge className={colors[availability as keyof typeof colors]}>
        {availability.charAt(0).toUpperCase() + availability.slice(1)}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Management</h1>
          <p className="text-muted-foreground mt-1">
            Track tasks, milestones, and team performance across all solar projects
          </p>
        </div>
        <Button>
          <Sun className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="milestones" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Milestones
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Tasks</CardTitle>
              <CardDescription>Track and manage tasks across all active projects</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.task}</TableCell>
                      <TableCell>{task.projectId}</TableCell>
                      <TableCell>{task.assignee}</TableCell>
                      <TableCell>{getTaskStatusBadge(task.status)}</TableCell>
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(task.dueDate)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Milestones</CardTitle>
              <CardDescription>Key milestones and deadlines across all projects</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Milestone</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Target Date</TableHead>
                    <TableHead>Completed Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectMilestones.map((milestone) => (
                    <TableRow key={milestone.id}>
                      <TableCell className="font-medium">{milestone.milestone}</TableCell>
                      <TableCell>{milestone.projectId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(milestone.targetDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {milestone.completedDate ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(milestone.completedDate)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getMilestoneStatusBadge(milestone.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
              <CardDescription>Monitor team member workload and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Active Projects</TableHead>
                    <TableHead className="text-right">Completed Tasks</TableHead>
                    <TableHead>Efficiency</TableHead>
                    <TableHead>Availability</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell className="text-right">{member.activeProjects}</TableCell>
                      <TableCell className="text-right">{member.completedTasks}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={member.efficiency} className="w-16 h-2" />
                          <span className="text-sm font-medium">{member.efficiency}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{getAvailabilityBadge(member.availability)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
