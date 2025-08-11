"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, HeartPulse, Footprints } from "lucide-react";
import MoodChart from '@/components/MoodChart';
import { useAuth } from "@/context/AuthContext";

export default function DataPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if user is logged in and not a warden
    if (user && user.role !== "warden") {
      router.replace("/");
    }
  }, [user, router]);

  // Don't render anything if the user is not a warden or not logged in yet.
  // This prevents brief flashes of content.
  if (!user || user.role !== 'warden') {
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl py-10 animate-in fade-in">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Wellness Data</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          An overview of student mood and biometric data.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Snapshot</CardTitle>
            <CardDescription>A summary of student vitals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HeartPulse className="h-6 w-6 text-red-500" />
                <span className="font-medium">Avg. Heart Rate</span>
              </div>
              <span className="font-mono text-lg">78 bpm</span>
            </div>
            <Separator />
             <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Footprints className="h-6 w-6 text-blue-500" />
                <span className="font-medium">Avg. Steps Taken</span>
              </div>
              <span className="font-mono text-lg">6,200</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
           <CardHeader>
            <CardTitle>Data Source</CardTitle>
            <CardDescription>Student data is synced from their apps.</CardDescription>
          </Header>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Students connect their health apps to provide this anonymized overview.
            </p>
          </CardContent>
          <CardFooter>
            <Button disabled className="w-full">
              Connected to Google Fit
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Aggregate Mood Over Time</CardTitle>
          <CardDescription>Overall mood trends for all students over the last week.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <MoodChart />
        </CardContent>
      </Card>
    </div>
  );
}
