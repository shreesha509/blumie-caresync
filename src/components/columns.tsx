
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoodData } from "@/app/data/page" // Adjusted to MoodData
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

export const columns: ColumnDef<MoodData>[] = [
  {
    accessorKey: "student_id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Student ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
     cell: ({ row }) => {
      const name = row.original.student_id || "Unknown"
      return <div className="font-medium">{name}</div>
    },
  },
  {
    accessorKey: "mood_name",
    header: "Mood Description",
    cell: ({ row }) => <div className="italic text-muted-foreground">"{row.getValue("mood_name")}"</div>,
  },
  {
    accessorKey: "mood_color",
    header: "Color",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div
          className="h-4 w-4 rounded-full border"
          style={{ backgroundColor: row.getValue("mood_color") }}
        />
        {row.getValue("mood_color")}
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
