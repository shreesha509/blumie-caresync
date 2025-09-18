
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, ShieldAlert, HeartPulse, Activity, Wind, Mic } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { MoodDataTable } from "@/components/MoodDataTable";
import { columns } from "@/components/columns";
import { useToast } from "@/hooks/use-toast";

export interface MoodData {
  student_id: string;
  mood_name: string;
  mood_color: string;
  timestamp: string;
  truthfulness?: "Genuine" | "Potentially Inconsistent" | "Processing..." | "Error";
  reasoning?: string;
  recommendation?: string;
  alertCaretaker?: boolean;
  // Sensor data
  watch_heart_rate?: number;
  watch_blood_pressure?: string;
  watch_spo2?: number;
  watch_gsr?: number;
  lamp_heart_rate?: number;
  lamp_spo2?: number;
  lamp_gsr?: number;
}

export default function DataPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [latestMood, setLatestMood] = useState<MoodData | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodData[]>([]);
  const previousMoodState = useRef<MoodData | null>(null);

  // Restrict access (only wardens)
  useEffect(() => {
    if (user && user.role !== "warden") {
      router.replace("/");
    }
  }, [user, router]);

  // Listen for real-time mood updates
  useEffect(() => {
    const moodRef = ref(database, "blumie");

    const unsubscribe = onValue(moodRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const newMood: MoodData = data;

        setLatestMood(newMood);

        // keep history sorted (newest first), capped at 50
        setMoodHistory((prev) => {
          const updated = [newMood, ...prev];
          return updated
            .filter(
              (item, index, self) =>
                index === self.findIndex((m) => m.timestamp === item.timestamp) // avoid duplicates
            )
            .sort(
              (a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )
            .slice(0, 50);
        });

        // Trigger caretaker alert only when flag flips to true
        const wasAlerted = previousMoodState.current?.alertCaretaker;
        if (newMood.alertCaretaker && !wasAlerted) {
          toast({
            variant: "destructive",
            title: (
              <div className="flex items-center gap-2">
                <ShieldAlert /> High-Risk Alert
              </div>
            ),
            description: `AI analysis for ${newMood.student_id || "Unknown Student"} requires attention. An SMS has been sent to the primary caretaker.`,
            duration: 10000,
          });
        }

        previousMoodState.current = newMood;
      } else {
        setLatestMood(null);
        setMoodHistory([]);
        previousMoodState.current = null;
      }
    });

    return () => unsubscribe();
  }, [toast]);

  if (!user || user.role !== "warden") return null;

  // helper: badge for truthfulness
  const renderTruthfulness = (status?: MoodData["truthfulness"]) => {
    if (!status) return null;
    
    if (status === "Processing...") {
      return <Badge variant="outline">Processing...</Badge>
    }
    if (status === "Error") {
      return <Badge variant="destructive">Error</Badge>
    }
    if (status === "Genuine") {
        return <Badge variant="secondary">Genuine</Badge>;
    }
    if (status === "Potentially Inconsistent") {
        return <Badge variant="destructive">Potentially Inconsistent</Badge>;
    }
    return <Badge>{status}</Badge>;
  };
  
  const SensorReading = ({ icon: Icon, label, value, unit }: { icon: React.ElementType, label: string, value?: string | number, unit?: string }) => (
    <div className="flex items-center gap-4 p-2 rounded-lg transition-colors hover:bg-muted/50">
        <Icon className="h-6 w-6 text-accent" />
        <div className="flex-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-bold text-lg">
                {value ?? "Waiting..."}
                {value && unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
            </p>
        </div>
    </div>
  );


  return (
    <div className="container mx-auto py-10 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight">
          Wellness Dashboard
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          A real-time overview of the latest student mood submission.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
            {/* Latest Mood */}
            <Card>
              <CardHeader>
                <CardTitle>Latest Student Mood</CardTitle>
                <CardDescription>
                  {latestMood
                    ? `Last updated: ${formatDistanceToNow(
                        new Date(latestMood.timestamp),
                        { addSuffix: true }
                      )}`
                    : "No mood submitted yet."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {latestMood ? (
                  <>
                    <div className="flex items-center gap-4">
                      <UserIcon className="h-5 w-5 text-accent-foreground shrink-0" />
                      <p className="font-bold text-lg">
                        {latestMood.student_id || "Unknown Student"}
                      </p>
                      {renderTruthfulness(latestMood.truthfulness)}
                    </div>
                    <Separator />
                    <div className="flex items-start gap-4">
                      <div
                        className="w-4 h-4 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: latestMood.mood_color }}
                      />
                      <p className="text-lg text-foreground">
                        “{latestMood.mood_name}”
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full py-10">
                    <p className="text-muted-foreground">
                      Waiting for student submission...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Mood History Table */}
            <Card>
                <CardHeader>
                <CardTitle>Student Mood History</CardTitle>
                <CardDescription>
                    A log of all student mood submissions, including AI analysis.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <MoodDataTable columns={columns} data={moodHistory} />
                </CardContent>
            </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
             {/* Biometric Data from Watch */}
             <Card>
                <CardHeader>
                    <CardTitle>Biometric Data (Watch)</CardTitle>
                    <CardDescription>Data from student's wearable.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <SensorReading icon={HeartPulse} label="Heart Rate" value={latestMood?.watch_heart_rate} unit="BPM" />
                    <SensorReading icon={Activity} label="Blood Pressure" value={latestMood?.watch_blood_pressure} unit="mmHg"/>
                    <SensorReading icon={Wind} label="Pulse Oximeter (SpO₂)" value={latestMood?.watch_spo2} unit="%"/>
                    <SensorReading icon={Activity} label="Galvanic Skin Response" value={latestMood?.watch_gsr} unit="Siemens"/>
                </CardContent>
            </Card>
             {/* Data from Lamp */}
             <Card>
                <CardHeader>
                    <CardTitle>Live Sensor Data (Lamp)</CardTitle>
                    <CardDescription>Real-time data from the lamp hardware.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                     <SensorReading icon={Mic} label="Voice Description" value={latestMood?.mood_name ? `"${latestMood.mood_name}"` : undefined} />
                     <Separator className="my-2"/>
                     <SensorReading icon={HeartPulse} label="Heartbeat" value={latestMood?.lamp_heart_rate} unit="BPM" />
                     <SensorReading icon={Wind} label="Pulse Oximeter" value={latestMood?.lamp_spo2} unit="%"/>
                     <SensorReading icon={Activity} label="GSR" value={latestMood?.lamp_gsr} unit="Siemens"/>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
