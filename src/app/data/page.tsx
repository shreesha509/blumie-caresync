
"use client";

import { useEffect, useState, useMemo } from "react";
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
import { User as UserIcon, ShieldAlert, HeartPulse, Thermometer, Droplets } from "lucide-react";
import { useAuth as useAppAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { useCollection, useMemoFirebase, useFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { MoodDataTable } from "@/components/MoodDataTable";
import { columns } from "@/components/columns";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export interface MoodData {
  id: string; 
  student_id: string;
  mood_name: string;
  mood_color: string;
  timestamp: string;
  truthfulness?: "Genuine" | "Potentially Inconsistent" | "Processing..." | "Error";
  reasoning?: string;
  recommendation?: string;
  alertCaretaker?: boolean;
}

export interface BiometricData {
  id: string;
  student_id: string;
  heartbeat: number;
  temperature: number;
  spo2: number;
  timestamp: string;
}

export default function DataPage() {
  const { user } = useAppAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { firestore, isUserLoading } = useFirebase();

  const [latestMood, setLatestMood] = useState<MoodData | null>(null);
  const [latestBiometrics, setLatestBiometrics] = useState<BiometricData | null>(null);

  useEffect(() => {
    if (!isUserLoading && (!user || user.role !== "warden")) {
      router.replace("/");
    }
  }, [user, isUserLoading, router]);
  
  const moodHistoryQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      // Query to get all documents from the 'moods' collection, ordered by timestamp
      return query(collection(firestore, "moods"), orderBy("timestamp", "desc"));
  }, [firestore]);

  const { data: moodHistory = [], isLoading: isMoodHistoryLoading } = useCollection<MoodData>(moodHistoryQuery);

   const biometricsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Query to get the latest document from the 'biometrics' collection
    return query(collection(firestore, "biometrics"), orderBy("timestamp", "desc"), limit(1));
  }, [firestore]);

  const { data: biometricsData = [], isLoading: isBiometricsLoading } = useCollection<BiometricData>(biometricsQuery);


  useEffect(() => {
    if (moodHistory && moodHistory.length > 0) {
      const newLatestMood = moodHistory[0];
      
      // We only want to show the toast if the alert status has just changed to true
      const hasAlertedPreviously = latestMood?.id === newLatestMood.id && latestMood?.alertCaretaker;

      if (newLatestMood.alertCaretaker && !hasAlertedPreviously) {
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
      setLatestMood(newLatestMood);
    }
  }, [moodHistory, toast, latestMood]);

  useEffect(() => {
    if (biometricsData && biometricsData.length > 0) {
      setLatestBiometrics(biometricsData[0]);
    }
  }, [biometricsData]);


  if (isUserLoading || !user || user.role !== "warden") {
    return (
      <div className="flex min-h-[calc(100dvh-3.5rem)] w-full flex-col items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  // helper: badge for truthfulness
  const renderTruthfulness = (status?: MoodData["truthfulness"]) => {
    if (!status || status === "Processing...") {
      return <Badge variant="outline">Processing...</Badge>
    }
    if (status === "Error") {
      return <Badge variant="destructive">Error</Badge>
    }
    if (status === "Genuine") {
        return <Badge variant="secondary">Genuine</Badge>;
    }
    if (status === "Potentially Inconsistent") {
        return <Badge variant="destructive">Inconsistent</Badge>;
    }
    return <Badge>{status}</Badge>;
  };
  
  return (
    <div className="container mx-auto py-10 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight">
          Wellness Dashboard
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          A real-time console of student submissions from Firestore.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
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
                     <Separator />
                    <div>
                      <h4 className="font-semibold">AI Analysis</h4>
                      <p className="text-sm text-muted-foreground">{latestMood.reasoning || "Awaiting analysis..."}</p>
                    </div>
                     <div>
                      <h4 className="font-semibold">AI Recommendation</h4>
                      <p className="text-sm">{latestMood.recommendation || "Awaiting analysis..."}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full py-10">
                     {isMoodHistoryLoading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <p className="text-muted-foreground">
                          Waiting for student mood submission...
                        </p>
                      )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mood History Table */}
            <Card>
                <CardHeader>
                <CardTitle>Student Mood History</CardTitle>
                <CardDescription>
                    A log of all student mood submissions from Firestore, including AI analysis.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <MoodDataTable columns={columns} data={moodHistory || []} />
                </CardContent>
            </Card>
        </div>

        {/* Biometrics Card */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Live Biometrics</CardTitle>
                    <CardDescription>
                        {latestBiometrics
                            ? `Last reading: ${formatDistanceToNow(new Date(latestBiometrics.timestamp), { addSuffix: true })}`
                            : "Waiting for sensor data..."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isBiometricsLoading && !latestBiometrics && (
                         <div className="flex items-center justify-center h-full py-10">
                            <Loader2 className="animate-spin" />
                         </div>
                    )}
                    {latestBiometrics ? (
                        <>
                            <div className="flex items-center gap-4">
                                <UserIcon className="h-5 w-5 text-accent-foreground shrink-0" />
                                <p className="font-bold text-lg">{latestBiometrics.student_id}</p>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <HeartPulse className="mx-auto h-8 w-8 text-red-500" />
                                    <p className="mt-2 text-2xl font-bold">{latestBiometrics.heartbeat}</p>
                                    <p className="text-xs text-muted-foreground">BPM</p>
                                </div>
                                <div>
                                    <Thermometer className="mx-auto h-8 w-8 text-blue-500" />
                                    <p className="mt-2 text-2xl font-bold">{latestBiometrics.temperature.toFixed(1)}</p>
                                    <p className="text-xs text-muted-foreground">°C</p>
                                </div>
                                <div>
                                    <Droplets className="mx-auto h-8 w-8 text-cyan-500" />
                                    <p className="mt-2 text-2xl font-bold">{latestBiometrics.spo2}</p>
                                    <p className="text-xs text-muted-foreground">% SpO2</p>
                                </div>
                            </div>
                        </>
                    ) : (
                         !isBiometricsLoading && <p className="text-sm text-center text-muted-foreground py-10">No biometric data received from any device yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}
