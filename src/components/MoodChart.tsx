"use client";

import { useState, useEffect } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const generateChartData = () => [
  { name: "Mon", mood: Math.floor(Math.random() * 5) + 1 },
  { name: "Tue", mood: Math.floor(Math.random() * 5) + 1 },
  { name: "Wed", mood: Math.floor(Math.random() * 5) + 1 },
  { name: "Thu", mood: Math.floor(Math.random() * 5) + 1 },
  { name: "Fri", mood: Math.floor(Math.random() * 5) + 1 },
  { name: "Sat", mood: Math.floor(Math.random() * 5) + 1 },
  { name: "Sun", mood: Math.floor(Math.random() * 5) + 1 },
];

export default function MoodChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    setData(generateChartData());
  }, []);

  if (data.length === 0) {
    return (
      <Skeleton className="h-[350px] w-full" />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
          domain={[0, 5]}
          ticks={[1, 2, 3, 4, 5]}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted))' }}
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
            borderRadius: 'var(--radius)',
           }}
        />
        <Bar dataKey="mood" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
