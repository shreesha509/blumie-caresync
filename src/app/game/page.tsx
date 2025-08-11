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

export default function GamePage() {
  const [selectedValue, setSelectedValue] = useState("none");
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "student") {
      router.replace("/data");
    }
  }, [user, router]);


  const handleSubmit = () => {
    if (selectedValue && selectedValue !== "none") {
      toast({
        title: "Submission Successful!",
        description: `You selected: ${
          selectedValue.charAt(0).toUpperCase() + selectedValue.slice(1)
        }`,
      });
    } else {
      toast({
        title: "No selection made",
        description: "Please select an option before submitting.",
        variant: "destructive",
      });
    }
  };

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
  };
  
  if (!user || user.role !== 'student') {
    return null;
  }

  return (
    <div className="container mx-auto max-w-2xl py-10 animate-in fade-in">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Mindful Games</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          A space for reflection and self-discovery.
        </p>
      </div>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle>Quick Question</CardTitle>
          <CardDescription>
            Take a moment to reflect on your habits.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="coping-mechanism" className="font-semibold">
                  When you feel stressed, what's your go-to coping mechanism?
                </Label>
                <RadioGroup
                  defaultValue="none"
                  id="coping-mechanism"
                  className="pt-2"
                  onValueChange={handleValueChange}
                  value={selectedValue}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="breathing" id="r1" />
                    <Label htmlFor="r1">Deep breathing or meditation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="music" id="r2" />
                    <Label htmlFor="r2">Listening to music</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="talk" id="r3" />
                    <Label htmlFor="r3">Talking to a friend</Label>
                  </div>
                   <div className="flex items-center space-x-2">
                    <RadioGroupItem value="walk" id="r4" />
                    <Label htmlFor="r4">Going for a walk</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSubmit}>Submit Answer</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
