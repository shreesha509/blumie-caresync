
"use client";

import { useState, useRef, MouseEvent, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { analyzeMood } from "@/ai/flows/mood-analysis-flow";
import type { MoodAnalysisOutput } from "@/ai/schemas/mood-analysis";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const moodColors = [
  { name: "Serene", color: "#64B5F6" },
  { name: "Calm", color: "#81C784" },
  { name: "Happy", color: "#FFD54F" },
  { name: "Energetic", color: "#FF8A65" },
  { name: "Creative", color: "#9575CD" },
];

export default function Home() {
  const [moodText, setMoodText] = useState("");
  const [selectedColor, setSelectedColor] = useState(moodColors[0].color);
  const [submittedMood, setSubmittedMood] = useState<{ text: string; color: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const colorWheelRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect if user is logged in and is a warden
    if (user && user.role === "warden") {
      router.replace("/data");
    }
  }, [user, router]);

  const handleSubmit = async () => {
    if (!moodText.trim()) {
       toast({
        title: "Please describe your mood",
        description: "Your mood description is needed for the analysis.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const analysis: MoodAnalysisOutput = await analyzeMood({ mood: moodText });
      const moodData = {
        text: moodText,
        color: selectedColor,
        analysis: analysis.summary,
        timestamp: new Date().toISOString(),
      };
      
      localStorage.setItem("latestMood", JSON.stringify(moodData));
      
      setSubmittedMood({ text: moodText, color: selectedColor });
    } catch (error) {
       toast({
        title: "Analysis Failed",
        description: "Could not analyze the mood. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleColorWheelClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!colorWheelRef.current) return;

    const rect = colorWheelRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const angle = (Math.atan2(y, x) * 180 / Math.PI + 360 + 90) % 360;
    
    const segmentAngle = 360 / moodColors.length;
    const colorIndex = Math.floor(angle / segmentAngle);
    
    setSelectedColor(moodColors[colorIndex].color);
  };
  
  const conicGradient = `conic-gradient(${moodColors
    .map((c, i) => {
      const segment = 360 / moodColors.length;
      return `${c.color} ${i * segment}deg ${(i + 1) * segment}deg`;
    })
    .join(", ")})`;

  // Don't render anything if the user is not a student or not logged in yet.
  // This prevents brief flashes of content before redirection.
  if (!user || user.role !== 'student') {
    return null;
  }

  return (
    <div
      className="flex min-h-[calc(100dvh-3.5rem)] w-full flex-col items-center justify-center p-4 bg-cover bg-center transition-colors duration-1000"
      style={{ 
        backgroundColor: submittedMood ? submittedMood.color : undefined,
        backgroundImage: submittedMood ? 'none' : "url('https://placehold.co/1920x1080.png')", 
      }}
      data-ai-hint="anime landscape"
    >
      {submittedMood ? (
        <div className="relative text-center animate-in fade-in">
          <h1 className="text-5xl font-bold font-headline text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            Thank you for sharing.
          </h1>
           <Button
              variant="outline"
              onClick={() => {
                setSubmittedMood(null);
                setMoodText('');
              }}
              className="mt-8 bg-black/20 text-white border-white/50 hover:bg-black/40 hover:text-white"
            >
              Set a new mood
            </Button>
        </div>
      ) : (
        <Card className="w-full max-w-md animate-in fade-in slide-in-from-bottom-5 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">How are you feeling?</CardTitle>
            <CardDescription>
              Describe your current mood and pick a color that represents it.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <Textarea
              placeholder="e.g., Feeling peaceful and content, although a little tired from studying..."
              value={moodText}
              onChange={(e) => setMoodText(e.target.value)}
              rows={3}
              className="bg-background/80"
              disabled={isLoading}
            />
            <div className="grid gap-2 items-center justify-center text-center">
              <label className="text-sm font-medium text-card-foreground">Choose a color</label>
              <div 
                ref={colorWheelRef}
                className={cn("relative h-40 w-40 rounded-full cursor-pointer border-4", isLoading && "opacity-50 pointer-events-none")}
                style={{ 
                  backgroundImage: conicGradient,
                  borderColor: selectedColor
                }}
                onClick={handleColorWheelClick}
              >
                 <div 
                   className="absolute inset-0 rounded-full transition-all duration-200"
                   style={{
                     boxShadow: `0 0 15px 5px ${selectedColor}, inset 0 0 15px 5px ${selectedColor}`
                   }}
                  />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmit} className="w-full" variant="default" disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin" />}
              {isLoading ? "Analyzing..." : "Set Mood"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
