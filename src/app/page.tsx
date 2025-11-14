
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
import { useAuth as useAppAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mic, MicOff } from "lucide-react";
import { useFirebase } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";

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
  const { user } = useAppAuth();
  const router = useRouter();
  const { toast } = useToast();
  // Destructure firestore and loading states from useFirebase
  const { firestore, areServicesAvailable, isUserLoading } = useFirebase();

  const [isRecording, setIsRecording] = useState(false);
  const speechRecognitionRef = useRef<any>(null);

  const isLoading = !areServicesAvailable || isUserLoading;

  useEffect(() => {
    // Debug log to check the firestore instance on component mount
    console.log('Firebase services loaded. Firestore instance:', firestore);
  }, [firestore]);

  useEffect(() => {
    if (user && user.role === "warden") {
      router.replace("/data");
    }
  }, [user, router]);
  
  // This effect ensures an initial color is set in Firestore when the user loads the page and services are ready.
  useEffect(() => {
    if (firestore && user && areServicesAvailable) {
        const colorDocRef = doc(firestore, "esp32", "mood_color");
        setDoc(colorDocRef, { hex: selectedColor.color }).catch(error => {
          console.error("Failed to set initial color:", error);
        });
    }
  }, [user, firestore, areServicesAvailable, selectedColor.color]); 

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
     if (!user || !user.name || !firestore) {
      toast({ title: "User or database not found", variant: "destructive" });
      return;
    }

    const timestamp = new Date().toISOString();
    const submissionId = `${user.name.replace(/\s+/g, '_')}_${Date.now()}`;

    // Data for the Warden Dashboard
    const fullMoodData = {
      student_id: user.name,
      mood_name: moodText,
      mood_color: selectedColor.color,
      r: selectedColor.rgb.r,
      g: selectedColor.rgb.g,
      b: selectedColor.rgb.b,
      timestamp: timestamp,
      truthfulness: "Processing..."
    };
    
    // Data for local storage to pass to the game page
    const localMoodData = {
        text: moodText,
        student_id: user.name,
        mood_color: selectedColor.color,
        timestamp: timestamp,
    };

    try {
      // This writes the full data for the warden dashboard
      const docRef = doc(firestore, "moods", submissionId);
      await setDoc(docRef, fullMoodData);
      
      localStorage.setItem("latestMood", JSON.stringify(localMoodData));

      toast({
        title: "Mood Submitted!",
        description: "Now, let's play a quick game.",
      });

      router.push('/game');

    } catch (error) {
       console.error("Error writing to Firestore:", error);
       toast({
          title: "Submission Failed",
          description: "Could not save mood to the database.",
          variant: "destructive",
        });
    }
  };

  const handleColorChange = async (e: MouseEvent<HTMLDivElement>) => {
    // Add console logs for detailed debugging as requested
    console.log('handleColorChange triggered.'); 
    if (!colorWheelRef.current || !firestore) {
      console.log('handleColorChange returned early. Firestore available:', !!firestore);
      return;
    }

    const rect = colorWheelRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const angle = (Math.atan2(y, x) * 180 / Math.PI + 360 + 90) % 360;
    
    const segmentAngle = 360 / moodColors.length;
    const colorIndex = Math.floor(angle / segmentAngle);
    const newColor = moodColors[colorIndex];
    
    if (newColor.color !== selectedColor.color) {
      setSelectedColor(newColor);
      
      // --- Your requested logs ---
      console.log('Firestore instance available:', !!firestore);
      console.log('Attempting to set color:', newColor.color);
      // -------------------------

      const colorDocRef = doc(firestore, "esp32", "mood_color");
      setDoc(colorDocRef, { hex: newColor.color }).catch(error => {
        // This is the most important log as per your instructions
        console.error("Firestore write for ESP32 failed:", error);
      });
    }
  };
  
  const conicGradient = `conic-gradient(${moodColors
    .map((c, i) => {
      const segment = 360 / moodColors.length;
      return `${c.color} ${i * segment}deg ${(i + 1) * segment}deg`;
    })
    .join(", ")})`;

  // Render a loading state until Firebase is ready
  if (isLoading || !user || user.role !== 'student') {
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
              disabled={isLoading}
            />
             <Button
                variant="ghost"
                size="icon"
                className={cn("absolute right-2 top-1/2 -translate-y-1/2", isRecording && "text-red-500 hover:text-red-600")}
                onClick={toggleRecording}
                aria-label="Toggle recording"
                disabled={isLoading}
            >
                {isRecording ? <MicOff /> : <Mic />}
            </Button>
          </div>
          <div className="grid gap-2 items-center justify-center text-center">
            <label className="text-sm font-medium text-card-foreground">Choose a color</label>
            <div 
              ref={colorWheelRef}
              className={cn(
                "relative h-40 w-40 rounded-full border-4",
                isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              )}
              style={{ 
                backgroundImage: conicGradient,
                borderColor: selectedColor.color
              }}
              onMouseMove={!isLoading ? handleColorChange : undefined}
              onClick={!isLoading ? handleColorChange : undefined}
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
          <Button onClick={handleSubmit} className="w-full" variant="default" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit & Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    