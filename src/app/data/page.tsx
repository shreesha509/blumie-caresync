
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from 'date-fns';
import { database } from "@/lib/firebase";
import { ref, onValue, off } from "firebase/database";
import { MoodDataTable } from "@/components/MoodDataTable";
import { columns } from "@/components/columns";

// This interface matches the structure in Firebase, including analysis fields
export interface MoodData {
  student_id: string;
  mood_name: string;
  mood_color: string;
  timestamp: string;
  truthfulness?: 'Genuine' | 'Potentially Inconsistent' | 'Processing...';
  reasoning?: string;
  recommendation?: string;
}

export default function DataPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [latestMood, setLatestMood] = useState<MoodData | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodData[]>([]);

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
        // Create a history list. In a real app, you'd fetch a list of items.
        // For this app, we just show the single latest entry in the table.
        const historyData = [data];
        setLatestMood(data);
        setMoodHistory(historyData);
      } else {
        setLatestMood(null);
        setMoodHistory([]);
      }
    });

    // Cleanup subscription on unmount
    return () => off(moodRef, 'value', unsubscribe);
  }, []);

  if (!user || user.role !== 'warden') {
    return null; // Or a loading spinner
  }

  return (
    <div className="container mx-auto py-10 animate-in fade-in">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Wellness Dashboard</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          A real-time overview of the latest student mood submission.
        </p>
      </div>

      <div className="mt-10">
        <Card>
           <CardHeader>
            <CardTitle>Latest Student Mood</CardTitle>
            <CardDescription>
              {latestMood
                ? `Last updated: ${formatDistanceToNow(new Date(latestMood.timestamp))} ago`
                : "No mood submitted yet."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestMood ? (
              <>
                 <div className="flex items-center gap-4">
                  <UserIcon className="h-5 w-5 text-accent-foreground shrink-0" />
                  <p className="font-bold text-lg">{latestMood.student_id || 'Unknown Student'}</p>
                </div>
                <Separator />
                <div className="flex items-start gap-4">
                   <div className="w-4 h-4 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: latestMood.mood_color }} />
                  <p className="text-lg text-foreground">"{latestMood.mood_name}"</p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full py-10">
                <p className="text-muted-foreground">Waiting for student submission...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

       <Card className="mt-6">
        <CardHeader>
          <CardTitle>Student Mood History</CardTitle>
          <CardDescription>A log of all student mood submissions, including AI analysis.</CardDescription>
        </CardHeader>
        <CardContent>
           <MoodDataTable columns={columns} data={moodHistory} />
        </CardContent>
      </Card>
    </div>
  );
}
