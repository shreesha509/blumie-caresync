
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
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mic, MicOff } from "lucide-react";
import { database } from "@/lib/firebase";
import { ref, set } from "firebase/database";
import { analyzeMood } from "@/ai/flows/mood-analysis-flow";

const moodColors = [
  { name: "Serene", color: "#64B5F6" },
  { name: "Calm", color: "#81C784" },
  { name: "Happy", color: "#FFD54F" },
  { name: "Energetic", color: "#FF8A65" },
  { name: "Creative", color: "#9575CD" },
];

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function Home() {
  const [moodText, setMoodText] = useState("");
  const [selectedColor, setSelectedColor] = useState(moodColors[0].color);
  const colorWheelRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isRecording, setIsRecording] = useState(false);
  const speechRecognitionRef = useRef<any>(null);

  useEffect(() => {
    if (user && user.role === "warden") {
      router.replace("/data");
    }
  }, [user, router]);
  
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      speechRecognitionRef.current = new SpeechRecognition();
      speechRecognitionRef.current.continuous = true;
      speechRecognitionRef.current.interimResults = true;
      speechRecognitionRef.current.lang = 'en-US';

      speechRecognitionRef.current.onstart = () => setIsRecording(true);
      speechRecognitionRef.current.onend = () => setIsRecording(false);
      speechRecognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        setMoodText(prevText => prevText + finalTranscript);
      };
      
       speechRecognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        toast({
          title: "Speech Recognition Error",
          description: `An error occurred: ${event.error}`,
          variant: "destructive",
        });
        setIsRecording(false);
      };
    }
  }, [toast]);
  
  const toggleRecording = () => {
    if (!speechRecognitionRef.current) {
        toast({
          title: "Speech Recognition Not Supported",
          description: "Your browser doesn't support this feature.",
          variant: "destructive",
        });
        return;
    }
    if (isRecording) {
      speechRecognitionRef.current.stop();
    } else {
      setMoodText('');
      speechRecognitionRef.current.start();
    }
  };

  const handleSubmit = async () => {
    if (isRecording) {
      speechRecognitionRef.current.stop();
    }
    if (!moodText.trim()) {
       toast({ title: "Please describe your mood", variant: "destructive" });
       return;
    }
     if (!user || !user.name) {
      toast({ title: "User not found", variant: "destructive" });
      return;
    }

    const moodData = {
      student_id: user.name,
      mood_name: moodText,
      mood_color: selectedColor,
      timestamp: new Date().toISOString(),
    };
    
    try {
        // Save initial data to Firebase
        await set(ref(database, 'blumie'), moodData);

        // Store data for the next pages
        localStorage.setItem("latestMood", JSON.stringify(moodData));

        toast({
          title: "Mood Submitted!",
          description: "Now, let's play a quick game.",
        });

        // Immediately navigate for a responsive UI
        router.push('/game');

    } catch (error) {
        console.error("Submission Error:", error);
        toast({
            title: "Error",
            description: "Could not save your mood.",
            variant: "destructive",
        });
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

  if (!user || user.role !== 'student') {
    return <div className="flex min-h-[calc(100dvh-3.5rem)] w-full flex-col items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] w-full flex-col items-center justify-center p-4 transition-colors duration-1000">
        <div className="mb-4 text-center">
            <h1 className="text-3xl font-bold font-headline tracking-tight">Welcome, {user.name}!</h1>
        </div>
      <Card className="w-full max-w-md animate-in fade-in slide-in-from-bottom-5 bg-card/80 backdrop-blur-sm">
        <CardHeader>
            <div>
              <CardTitle className="font-headline text-2xl">Share Your Current Mood</CardTitle>
              <CardDescription>
                Let your feelings flow. Express your mood and choose a color that reflects it.
              </CardDescription>
            </div>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="relative">
             <Textarea
              placeholder={isRecording ? "Listening..." : "e.g., Feeling peaceful and content..."}
              value={moodText}
              onChange={(e) => setMoodText(e.target.value)}
              rows={3}
              className="bg-background/80 pr-12"
            />
             <Button
                variant="ghost"
                size="icon"
                className={cn("absolute right-2 top-1/2 -translate-y-1/2", isRecording && "text-red-500 hover:text-red-600")}
                onClick={toggleRecording}
                aria-label="Toggle recording"
            >
                {isRecording ? <MicOff /> : <Mic />}
            </Button>
          </div>
          <div className="grid gap-2 items-center justify-center text-center">
            <label className="text-sm font-medium text-card-foreground">Choose a color</label>
            <div 
              ref={colorWheelRef}
              className="relative h-40 w-40 rounded-full cursor-pointer border-4"
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
          <Button onClick={handleSubmit} className="w-full" variant="default">
            Submit & Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
