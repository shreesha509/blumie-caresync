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

export default function DataPage() {
  return (
    <div className="container mx-auto max-w-4xl py-10 animate-in fade-in">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Your Wellness Data</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          An overview of your mood and biometric data.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Snapshot</CardTitle>
            <CardDescription>A summary of your vitals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HeartPulse className="h-6 w-6 text-red-500" />
                <span className="font-medium">Heart Rate</span>
              </div>
              <span className="font-mono text-lg">72 bpm</span>
            </div>
            <Separator />
             <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Footprints className="h-6 w-6 text-blue-500" />
                <span className="font-medium">Steps Taken</span>
              </div>
              <span className="font-mono text-lg">8,450</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
           <CardHeader>
            <CardTitle>Connect Your Data</CardTitle>
            <CardDescription>Sync with your health apps.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Get a complete picture of your wellness by connecting your Google Fit account.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="https://www.google.com/fit/" target="_blank" rel="noopener noreferrer">
                Connect to Google Fit <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Mood Over Time</CardTitle>
          <CardDescription>Your mood trends over the last week.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <MoodChart />
        </CardContent>
      </Card>
    </div>
  );
}
