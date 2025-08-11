"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { HeartPulse, Footprints, Activity } from "lucide-react";
import MoodChart from '@/components/MoodChart';
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from 'date-fns';

interface MoodData {
  text: string;
  color: string;
  analysis: string;
  timestamp: string;
}

export default function DataPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [latestMood, setLatestMood] = useState<MoodData | null>(null);

  useEffect(() => {
    if (user && user.role !== "warden") {
      router.replace("/");
    }
  }, [user, router]);
  
  useEffect(() => {
    // This effect runs only on the client
    const storedMood = localStorage.getItem("latestMood");
    if (storedMood) {
      setLatestMood(JSON.parse(storedMood));
    }

    const handleStorageChange = () => {
       const updatedMood = localStorage.getItem("latestMood");
       if (updatedMood) {
         setLatestMood(JSON.parse(updatedMood));
       }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // If the user is not loaded yet, or is not a warden, render nothing.
  // This prevents content flashes and protects the route.
  if (!user || user.role !== 'warden') {
    return null;
  }

  // This JSX will only be rendered if the user is a warden.
  return (
    <div className="container mx-auto max-w-4xl py-10 animate-in fade-in">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Wellness Dashboard</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          An overview of student mood and biometric data.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
         <Card>
          <CardHeader>
            <CardTitle>Today's Vitals</CardTitle>
            <CardDescription>A summary of student biometrics.</CardDescription>
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
        
        <Card className="flex flex-col">
           <CardHeader>
            <CardTitle>Student Mood Analysis</CardTitle>
            <CardDescription>
              {latestMood
                ? `Last updated: ${formatDistanceToNow(new Date(latestMood.timestamp))} ago`
                : "No mood submitted yet."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
            {latestMood ? (
              <>
                <div className="flex items-start gap-4">
                   <div className="w-4 h-4 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: latestMood.color }} />
                  <p className="text-sm text-muted-foreground italic">"{latestMood.text}"</p>
                </div>
                <Separator />
                <div className="flex items-start gap-4">
                  <Activity className="h-5 w-5 text-accent-foreground mt-0.5 shrink-0" />
                  <p className="font-medium">{latestMood.analysis}</p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Waiting for student submission...</p>
              </div>
            )}
          </CardContent>
           <CardFooter>
            <Button disabled className="w-full">
              Real-time Analysis by Gemini
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
