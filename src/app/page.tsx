
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
import { useFirebase, errorEmitter, FirestorePermissionError } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";

const moodColors = [
  { name: "Serene", color: "#64B5F6", rgb: { r: 100, g: 181, b: 246 } },  // Light Blue
  { name: "Happy", color: "#81C784", rgb: { r: 129, g: 199, b: 132 } }, // Light Green
  { name: "Creative", color: "#FFD54F", rgb: { r: 255, g: 213, b: 79 } }, // Amber
  { name: "Passionate", color: "#F06292", rgb: { r: 240, g: 98, b: 146 } },    // Pink
  { name: "Anxious", color: "#E57373", rgb: { r: 229, g: 115, b: 115 } }, // Light Red
  { name: "Sad", color: "#7986CB", rgb: { r: 121, g: 134, b: 203 } },     // Indigo
  { name: "Focused", color: "#4DB6AC", rgb: { r: 77, g: 182, b: 172 } }, // Teal
  { name: "Neutral", color: "#90A4AE", rgb: { r: 144, g: 164, b: 174 } },// Blue Grey
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
  const { firestore, isUserLoading, areServicesAvailable } = useFirebase();

  const [isRecording, setIsRecording] = useState(false);
  const speechRecognitionRef = useRef<any>(null);

  useEffect(() => {
    if (user && user.role === "warden") {
      router.replace("/data");
    }
  }, [user, router]);
  
  useEffect(() => {
    // This effect ensures the color is updated in Firestore ONLY when services
    // are available AND the user is authenticated.
    if (areServicesAvailable && user && firestore) {
        const colorData = { hex: selectedColor.color, ...selectedColor.rgb };
        const docRef = doc(firestore, 'esp32', 'mood_color');
        
        setDoc(docRef, colorData, { merge: true }).catch(error => {
          const contextualError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: colorData,
          });
          errorEmitter.emit('permission-error', contextualError);
        });
    }
  }, [areServicesAvailable, user, selectedColor, firestore]);

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

    // Data for the Warden Dashboard (Firestore)
    const fullMoodData = {
      student_id: user.name,
      mood_name: moodText,
      mood_color: selectedColor.color,
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

    const docRef = doc(firestore, "moods", submissionId);
    setDoc(docRef, fullMoodData)
      .then(() => {
        localStorage.setItem("latestMood", JSON.stringify(localMoodData));
        toast({
          title: "Mood Submitted!",
          description: "Now, let's play a quick game.",
        });
        router.push('/game');
      })
      .catch((error) => {
        const contextualError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'create',
          requestResourceData: fullMoodData,
        });
        errorEmitter.emit('permission-error', contextualError);
      });
  };

  const handleColorChange = (e: MouseEvent<HTMLDivElement>) => {
    if (!colorWheelRef.current || !firestore) {
        return;
    }

    // Do not allow color change if user is not authenticated
    if (!user) {
        toast({ title: "Please wait", description: "Authenticating..." });
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
      
      const docRef = doc(firestore, 'esp32', 'mood_color');
      const colorData = { hex: newColor.color, ...newColor.rgb };
      setDoc(docRef, colorData, { merge: true }).catch(error => {
        const contextualError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: colorData,
        });
        errorEmitter.emit('permission-error', contextualError);
      });
    }
  };
  
  const conicGradient = `conic-gradient(${moodColors
    .map((c, i) => {
      const segment = 360 / moodColors.length;
      return `${c.color} ${i * segment}deg ${(i + 1) * segment}deg`;
    })
    .join(", ")})`;

  if (isUserLoading || !user || user.role !== 'student') {
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
              disabled={isUserLoading}
            />
             <Button
                variant="ghost"
                size="icon"
                className={cn("absolute right-2 top-1/2 -translate-y-1/2", isRecording && "text-red-500 hover:text-red-600")}
                onClick={toggleRecording}
                aria-label="Toggle recording"
                disabled={isUserLoading}
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
                isUserLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              )}
              style={{ 
                backgroundImage: conicGradient,
                borderColor: selectedColor.color
              }}
              onMouseMove={!isUserLoading ? handleColorChange : undefined}
              onClick={!isUserLoading ? handleColorChange : undefined}
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
          <Button onClick={handleSubmit} className="w-full" variant="default" disabled={isUserLoading || !areServicesAvailable}>
            {(isUserLoading || !areServicesAvailable) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit & Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
