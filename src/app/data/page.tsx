
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
import { HeartPulse, Footprints, Activity, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from 'date-fns';
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

export interface BlumieData {
  student_id: string;
  mood_name: string;
  mood_color: string;
  timestamp: string;
}

export default function DataPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [latestMood, setLatestMood] = useState<BlumieData | null>(null);

  useEffect(() => {
    if (user && user.role !== "warden") {
      router.replace("/");
    }
  }, [user, router]);
  
  useEffect(() => {
    const moodRef = ref(database, 'blumie');
    
    const unsubscribe = onValue(moodRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLatestMood(data);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (!user || user.role !== 'warden') {
    return null;
  }

  return (
    <div className="container mx-auto py-10 animate-in fade-in">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Wellness Dashboard</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          An overview of student mood and biometric data.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         <Card className="lg:col-span-1">
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
             <Separator />
             <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="h-6 w-6 text-green-500" />
                <span className="font-medium">Avg. Active Mins</span>
              </div>
              <span className="font-mono text-lg">45</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="flex flex-col lg:col-span-2">
           <CardHeader>
            <CardTitle>Latest Student Mood</CardTitle>
            <CardDescription>
              {latestMood
                ? `Last updated: ${formatDistanceToNow(new Date(latestMood.timestamp))} ago`
                : "No mood submitted yet."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
            {latestMood ? (
              <>
                 <div className="flex items-center gap-4">
                  <UserIcon className="h-5 w-5 text-accent-foreground shrink-0" />
                  <p className="font-bold text-lg">{latestMood.student_id || 'Unknown Student'}</p>
                </div>
                <Separator />
                <div className="flex items-start gap-4">
                   <div className="w-4 h-4 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: latestMood.mood_color }} />
                  <p className="text-sm text-muted-foreground italic">"{latestMood.mood_name}"</p>
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
          <CardTitle>Student Mood History</CardTitle>
          <CardDescription>A complete log of all student mood submissions.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground text-center py-8">Mood history table is under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
}
