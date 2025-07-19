"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowDownIcon, ArrowUpIcon } from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Report } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

export const columns: ColumnDef<Report>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Created
          {column.getIsSorted() === "asc" ? (
            <ArrowDownIcon className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowUpIcon className="ml-2 h-4 w-4" />
          ) : null}
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return <div>{date.toLocaleDateString()}</div>
    },
  },
  {
    accessorKey: "prompt",
    header: "Prompt",
  },
  {
    accessorKey: "mood",
    header: "Mood",
    cell: ({ row }) => {
      const mood = row.getValue("mood") as string

      let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "secondary"

      if (mood === "happy") {
        badgeVariant = "default"
      } else if (mood === "sad") {
        badgeVariant = "secondary"
      } else if (mood === "angry") {
        badgeVariant = "destructive"
      }

      return <Badge variant={badgeVariant}>{mood}</Badge>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const report = row.original

      const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(report))
        toast("Copied report to clipboard")
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {}}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopy}>Copy</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

import { DataTable } from "@/components/ui/data-table"

interface ProReportsClientPageProps {
  reports: Report[]
}

export function ProReportsClientPage({ reports }: ProReportsClientPageProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Pro Reports</h1>
      <DataTable columns={columns} data={reports} />
    </div>
  )
}
