
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoodData } from "@/app/data/page" // Adjusted to MoodData
import { ArrowUpDown, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

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
    accessorKey: "truthfulness",
    header: "Truthfulness",
    cell: ({ row }) => {
      const truthfulness = row.original.truthfulness;
      if (!truthfulness) return <span className="text-muted-foreground">N/A</span>;
      
      if (truthfulness === "Processing...") {
        return (
           <Badge variant="outline" className="flex items-center gap-1.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Processing...
          </Badge>
        )
      }
      
      const isGenuine = truthfulness === "Genuine";
      
      return (
        <Badge variant={isGenuine ? "secondary" : "destructive"} className="flex items-center gap-1.5">
          {isGenuine ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
          {truthfulness}
        </Badge>
      );
    },
  },
  {
    accessorKey: "reasoning",
    header: "AI Reasoning",
    cell: ({ row }) => {
       const reasoning = row.original.reasoning;
       if (!row.original.truthfulness || row.original.truthfulness === "Processing...") {
         return <span className="text-muted-foreground">...</span>
       }
       return <div className="text-sm max-w-xs truncate">{reasoning || "N/A"}</div>
    }
  },
  {
    accessorKey: "recommendation",
    header: "AI Recommendation",
     cell: ({ row }) => {
       const recommendation = row.original.recommendation;
       if (!row.original.truthfulness || row.original.truthfulness === "Processing...") {
         return <span className="text-muted-foreground">...</span>
       }
       return <div className="text-sm font-semibold max-w-xs truncate">{recommendation || "N/A"}</div>
    }
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
