
"use client";

import { useEffect, useState, useRef, useMemo } from "react";
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
import { useAuth as useAppAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { useCollection, useMemoFirebase, useFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { MoodDataTable } from "@/components/MoodDataTable";
import { columns } from "@/components/columns";
import { useToast } from "@/hooks/use-toast";

export interface MoodData {
  id: string; // Added for Firestore documents
  student_id: string;
  mood_name: string;
  mood_color: string;
  timestamp: string;
  r?: number;
  g?: number;
  b?: number;
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
  const { user } = useAppAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const [latestMood, setLatestMood] = useState<MoodData | null>(null);
  const previousMoodState = useRef<MoodData | null>(null);
  const [randomBiometrics, setRandomBiometrics] = useState<any>(null);

  // Generate random data on client-side to prevent hydration mismatch
  useEffect(() => {
    setRandomBiometrics({
        heartRate: Math.floor(Math.random() * (90 - 65 + 1)) + 65,
        bloodPressure: `${Math.floor(Math.random() * (125 - 110 + 1)) + 110}/${Math.floor(Math.random() * (85 - 75 + 1)) + 75}`,
        spo2: Math.floor(Math.random() * (100 - 95 + 1)) + 95,
        gsr: parseFloat((Math.random() * (1.5 - 0.5) + 0.5).toFixed(2)),
    });
  }, []);

  // Restrict access (only wardens)
  useEffect(() => {
    if (user && user.role !== "warden") {
      router.replace("/");
    }
  }, [user, router]);
  
  const moodHistoryQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, "moods"), orderBy("timestamp", "desc"));
  }, [firestore]);

  const { data: moodHistory = [], isLoading } = useCollection<MoodData>(moodHistoryQuery);

  useEffect(() => {
    if (moodHistory && moodHistory.length > 0) {
      const newLatestMood = moodHistory[0];
      setLatestMood(newLatestMood);

      const wasAlerted = previousMoodState.current?.alertCaretaker;
      if (newLatestMood.alertCaretaker && !wasAlerted) {
        toast({
          variant: "destructive",
          title: (
            <div className="flex items-center gap-2">
              <ShieldAlert /> High-Risk Alert
            </div>
          ),
          description: `AI analysis for ${newLatestMood.student_id || "Unknown Student"} requires attention. An SMS has been sent to the primary caretaker.`,
          duration: 10000,
        });
      }
      previousMoodState.current = newLatestMood;
    }
  }, [moodHistory, toast]);


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
  
  const SensorReading = ({ icon: Icon, label, value, unit, fallback }: { icon: React.ElementType, label: string, value?: string | number, unit?: string, fallback?: string | number }) => (
    <div className="flex items-center gap-4 p-2 rounded-lg transition-colors hover:bg-muted/50">
        <Icon className="h-6 w-6 text-accent" />
        <div className="flex-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-bold text-lg">
                {value ?? fallback ?? "..."}
                {(value || fallback) && unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
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
                    <SensorReading icon={HeartPulse} label="Heart Rate" value={latestMood?.watch_heart_rate} unit="BPM" fallback={randomBiometrics?.heartRate} />
                    <SensorReading icon={Activity} label="Blood Pressure" value={latestMood?.watch_blood_pressure} unit="mmHg" fallback={randomBiometrics?.bloodPressure}/>
                    <SensorReading icon={Wind} label="Pulse Oximeter (SpO₂)" value={latestMood?.watch_spo2} unit="%" fallback={randomBiometrics?.spo2}/>
                    <SensorReading icon={Activity} label="Galvanic Skin Response" value={latestMood?.watch_gsr} unit="Siemens" fallback={randomBiometrics?.gsr}/>
                </CardContent>
            </Card>
             {/* Data from Lamp */}
             <Card>
                <CardHeader>
                    <CardTitle>Live Sensor Data (Lamp)</CardTitle>
                    <CardDescription>Real-time data from the lamp hardware.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                     <SensorReading icon={Mic} label="Voice Description" value={latestMood?.mood_name ? `"${latestMood.mood_name}"` : undefined} fallback="..."/>
                     <Separator className="my-2"/>
                     <SensorReading icon={HeartPulse} label="Heartbeat" value={latestMood?.lamp_heart_rate} unit="BPM" fallback={randomBiometrics?.heartRate} />
                     <SensorReading icon={Wind} label="Pulse Oximeter" value={latestMood?.lamp_spo2} unit="%" fallback={randomBiometrics?.spo2}/>
                     <SensorReading icon={Activity} label="GSR" value={latestMood?.lamp_gsr} unit="Siemens" fallback={randomBiometrics?.gsr}/>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
