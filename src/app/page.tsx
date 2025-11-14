
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

const moodColors = [
  { name: "Red", color: "#FF0000", rgb: { r: 255, g: 0, b: 0 } },
  { name: "Green", color: "#00FF00", rgb: { r: 0, g: 255, b: 0 } },
  { name: "Blue", color: "#0000FF", rgb: { r: 0, g: 0, b: 255 } },
  { name: "Yellow", color: "#FFFF00", rgb: { r: 255, g: 255, b: 0 } },
  { name: "Cyan", color: "#00FFFF", rgb: { r: 0, g: 255, b: 255 } },
  { name: "Magenta", color: "#FF00FF", rgb: { r: 255, g: 0, b: 255 } },
  { name: "White", color: "#FFFFFF", rgb: { r: 255, g: 255, b: 255 } },
  { name: "Off", color: "#000000", rgb: { r: 0, g: 0, b: 0 } },
];

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function Home() {
  const [moodText, setMoodText] = useState("");
  const [selectedColor, setSelectedColor] = useState(moodColors[0]);
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
  
  // This useEffect runs once on page load to set a default color in Firebase
  useEffect(() => {
    if (user && user.name) {
       const initialColor = moodColors[0];
       const initialFullData = {
          student_id: user.name,
          mood_name: "Awaiting submission...",
          mood_color: initialColor.color,
          r: initialColor.rgb.r,
          g: initialColor.rgb.g,
          b: initialColor.rgb.b,
          timestamp: new Date().toISOString(),
          truthfulness: "Processing..."
      };
      
      const esp32ColorData = initialColor.color;

      // Set the default state for the dashboard and the ESP32 in two separate calls
      set(ref(database, 'blumie'), initialFullData);
      set(ref(database, 'blumie/mood_color'), esp32ColorData);
    }
  }, [user]);

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

    const timestamp = new Date().toISOString();

    const fullMoodData = {
      student_id: user.name,
      mood_name: moodText,
      mood_color: selectedColor.color,
      r: selectedColor.rgb.r,
      g: selectedColor.rgb.g,
      b: selectedColor.rgb.b,
      timestamp: timestamp,
    };
    
    const localMoodData = {
        text: moodText,
        student_id: user.name,
        mood_color: selectedColor.color,
        timestamp: timestamp,
    };

    const esp32ColorData = selectedColor.color;
    
    try {
      // Write data in two separate calls to avoid ancestor-path error
      // 1. Write full data for the dashboard
      await set(ref(database, 'blumie'), fullMoodData);
      // 2. Write simple data for the ESP32
      await set(ref(database, 'blumie/mood_color'), esp32ColorData);
      
      localStorage.setItem("latestMood", JSON.stringify(localMoodData));

      toast({
        title: "Mood Submitted!",
        description: "Now, let's play a quick game.",
      });

      router.push('/game');

    } catch (error) {
       console.error("Error writing to Firebase:", error);
       toast({
          title: "Submission Failed",
          description: "Could not save mood to the database.",
          variant: "destructive",
        });
    }
  };

  const handleColorChange = (e: MouseEvent<HTMLDivElement>) => {
    if (!colorWheelRef.current) return;

    const rect = colorWheelRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const angle = (Math.atan2(y, x) * 180 / Math.PI + 360 + 90) % 360;
    
    const segmentAngle = 360 / moodColors.length;
    const colorIndex = Math.floor(angle / segmentAngle);
    const newColor = moodColors[colorIndex];
    
    if (newColor.color !== selectedColor.color) {
      setSelectedColor(newColor);
      // Live update the color for the ESP32 as it's being selected
      const esp32ColorData = newColor.color;
      set(ref(database, 'blumie/mood_color'), esp32ColorData);
    }
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
    <div 
      className="flex min-h-[calc(100dvh-3.5rem)] w-full flex-col items-center justify-center p-4 transition-colors duration-1000"
       style={{ 
        backgroundColor: `${selectedColor.color}1A`,
        boxShadow: `inset 0 0 10rem 5rem ${selectedColor.color === "#000000" ? 'transparent' : selectedColor.color}33`,
      }}
    >
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
                borderColor: selectedColor.color
              }}
              onMouseMove={handleColorChange}
              onClick={handleColorChange}
            >
               <div 
                 className="absolute inset-0 rounded-full transition-all duration-200"
                 style={{
                   boxShadow: `0 0 15px 5px ${selectedColor.color}, inset 0 0 15px 5px ${selectedColor.color}`
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
