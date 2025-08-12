
"use client";

import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { analyzeMoodConsistency } from "@/ai/flows/mood-consistency-flow";
import type { MoodConsistencyOutput } from "@/ai/schemas/mood-consistency";


const scenario = {
  question: "You just found out a surprise test is happening in your next class. How do you feel?",
  options: [
    { value: "nervous", label: "A little nervous, but I'll manage." },
    { value: "excited", label: "Excited for the challenge!" },
    { value: "anxious", label: "Completely overwhelmed and anxious." },
    { value: "indifferent", label: "Indifferent, it doesn't bother me." },
  ],
};

export default function GamePage() {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "student") {
      router.replace("/data");
    }
    // Also redirect if there's no mood entry to work with
    const latestMood = localStorage.getItem("latestMood");
    if (!latestMood) {
        toast({
            title: "No mood submitted",
            description: "Please submit your mood first.",
            variant: "destructive"
        });
        router.replace("/");
    }
  }, [user, router, toast]);

  const handleSubmit = async () => {
    if (!selectedValue) {
      toast({
        title: "No selection made",
        description: "Please select an option before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
        const storedMoodData = localStorage.getItem("latestMood");
        if (!storedMoodData) throw new Error("Mood data not found.");
        
        const latestMood = JSON.parse(storedMoodData);
        
        const analysis: MoodConsistencyOutput = await analyzeMoodConsistency({
            mood: latestMood.text,
            gameResponse: selectedValue
        });

        // Update the latest mood entry with the game response and new analysis
        const updatedMoodData = {
            ...latestMood,
            gameResponse: selectedValue,
            analysis: analysis.summary, 
        };

        localStorage.setItem("latestMood", JSON.stringify(updatedMoodData));

        // Update the history record as well
        const history = JSON.parse(localStorage.getItem("moodHistory") || "[]");
        if (history.length > 0) {
            history[0] = updatedMoodData; // Update the most recent entry
            localStorage.setItem("moodHistory", JSON.stringify(history));
        }

      toast({
        title: "Thank You for Your Response!",
        description: "Your wellness data has been updated.",
      });

      router.push('/'); // Go back to the main mood page

    } catch(error) {
        toast({
            title: "Analysis Failed",
            description: "Could not process your response. Please try again.",
            variant: "destructive",
        });
        console.error(error);
    } finally {
        setIsLoading(false);
    }
  };
  
  if (!user || user.role !== 'student') {
    return null;
  }

  return (
    <div className="container mx-auto max-w-2xl py-10 animate-in fade-in">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight">One Last Question...</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Let's reflect on a quick scenario.
        </p>
      </div>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle>Scenario</CardTitle>
          <CardDescription>
            This helps us understand your state of mind better.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="coping-mechanism" className="font-semibold">
                  {scenario.question}
                </Label>
                <RadioGroup
                  id="coping-mechanism"
                  className="pt-2"
                  onValueChange={setSelectedValue}
                  value={selectedValue || ""}
                >
                  {scenario.options.map((option) => (
                     <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="animate-spin" />}
            {isLoading ? "Analyzing..." : "Submit & Finish"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
