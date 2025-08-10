"use client";

import { useState } from "react";
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

  const handleSubmit = () => {
    if (moodText.trim() || selectedColor) {
      setSubmittedMood({ text: moodText, color: selectedColor });
    }
  };

  return (
    <div
      className="flex min-h-[calc(100dvh-3.5rem)] w-full flex-col items-center justify-center p-4 transition-colors duration-1000"
      style={{ backgroundColor: submittedMood ? submittedMood.color : undefined }}
    >
      {submittedMood ? (
        <div className="relative text-center animate-in fade-in">
          <h1 className="text-5xl font-bold font-headline text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {submittedMood.text || "Feeling a new way"}
          </h1>
           <Button
              variant="outline"
              onClick={() => setSubmittedMood(null)}
              className="mt-8 bg-black/20 text-white border-white/50 hover:bg-black/40 hover:text-white"
            >
              Set a new mood
            </Button>
        </div>
      ) : (
        <Card className="w-full max-w-md animate-in fade-in slide-in-from-bottom-5">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">How are you feeling?</CardTitle>
            <CardDescription>
              Describe your current mood and pick a color that represents it.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <Textarea
              placeholder="e.g., Feeling peaceful and content..."
              value={moodText}
              onChange={(e) => setMoodText(e.target.value)}
              rows={3}
              className="bg-background"
            />
            <div className="grid gap-2">
              <label className="text-sm font-medium text-card-foreground">Choose a color</label>
              <div className="flex flex-wrap gap-3">
                {moodColors.map(({ name, color }) => (
                  <button
                    key={name}
                    type="button"
                    aria-label={name}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "h-10 w-10 rounded-full border-2 transition-all duration-200",
                      selectedColor === color
                        ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "border-transparent hover:border-muted-foreground/50"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmit} className="w-full" variant="default">
              Set Mood
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
