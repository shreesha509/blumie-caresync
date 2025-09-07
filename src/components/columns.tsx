
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoodData } from "@/app/data/page"
import { ArrowUpDown, CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Badge } from "./ui/badge"

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
    accessorKey: "truthfulness",
    header: "Mood Validity",
    cell: ({ row }) => {
        const truthfulness = row.original.truthfulness;
        if (!truthfulness) return <div className="text-muted-foreground/50">N/A</div>;

        return truthfulness === "Genuine" ? (
             <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                Genuine
            </Badge>
        ) : (
            <Badge variant="destructive" className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200">
                <AlertTriangle className="mr-2 h-4 w-4 text-yellow-600" />
                Inconsistent
            </Badge>
        )
    }
  },
  {
    accessorKey: "reasoning",
    header: "Gemini Analysis",
    cell: ({ row }) => {
      return row.original.reasoning || row.original.analysis
    }
  },
  {
    accessorKey: "recommendation",
    header: "Recommendation",
    cell: ({ row }) => {
      const recommendation = row.original.recommendation;
      if (!recommendation) return <div className="text-muted-foreground/50">N/A</div>;

      return (
        <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0" />
            <span className="font-medium">{recommendation}</span>
        </div>
      )
    }
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
