
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoodData } from "@/app/data/page"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

export const columns: ColumnDef<MoodData>[] = [
  {
    accessorKey: "studentName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Student
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
     cell: ({ row }) => {
      const name = row.original.studentName || "Unknown"
      return <div className="font-medium">{name}</div>
    },
  },
  {
    accessorKey: "text",
    header: "Mood Description",
    cell: ({ row }) => <div className="italic text-muted-foreground">"{row.getValue("text")}"</div>,
  },
  {
    accessorKey: "analysis",
    header: "Gemini Analysis",
  },
  {
    accessorKey: "color",
    header: "Color",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div
          className="h-4 w-4 rounded-full border"
          style={{ backgroundColor: row.getValue("color") }}
        />
        {row.getValue("color")}
      </div>
    ),
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Timestamp
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("timestamp"))
      return <div>{format(date, "PPpp")}</div>
    },
  },
]
