
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
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { analyzeMoodTruthfulness } from "@/ai/flows/mood-truthfulness-flow";
import type { MoodTruthfulnessOutput } from "@/ai/schemas/mood-truthfulness";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { Progress } from "@/components/ui/progress";


const allQuestions = [
  { id: "q1", question: "You just found out a surprise test is happening in your next class. How do you feel?", options: ["Nervous", "Excited", "Anxious", "Indifferent"] },
  { id: "q2", question: "A friend cancels plans with you last minute. What's your immediate reaction?", options: ["Understanding", "Annoyed", "Relieved", "Hurt"] },
  { id: "q3", question: "You have a completely free afternoon with no obligations. What are you most likely to do?", options: ["Rest/Nap", "Socialize", "Hobby", "Catch up on work"] },
  { id: "q4", question: "How often have you felt overwhelmed by your schoolwork this past week?", options: ["Rarely", "Sometimes", "Often", "Constantly"] },
  { id: "q5", "question": "You receive some unexpected praise from a teacher. How does it make you feel?", options: ["Proud", "Suspicious", "Uncomfortable", "Happy"] },
  { id: "q6", question: "How easy has it been for you to fall asleep at night recently?", options: ["Very easy", "Average", "Difficult", "Very difficult"] },
  { id: "q7", question: "Thinking about your energy levels right now, which best describes them?", options: ["High energy", "Steady", "Low energy", "Drained"] },
  { id: "q8", question: "How connected do you feel to your friends and family at the moment?", options: ["Very connected", "Somewhat connected", "Disconnected", "Isolated"] },
  { id: "q9", question: "You make a mistake on an important assignment. What is your first thought?", options: ["'I can fix this.'", "'I'm a failure.'", "'It's not a big deal.'", "'I'll get criticized.'"] },
  { id: "q10", question: "Right now, what are you most looking forward to?", options: ["An upcoming event", "Just getting through the day", "Seeing a friend/family", "Nothing in particular"] },
  { id: "q11", question: "How do you typically handle stress?", options: ["Exercise", "Talk to someone", "Keep it to myself", "Ignore it"] },
  { id: "q12", question: "What is your proudest recent accomplishment?", options: ["Academic success", "Personal growth", "Helping someone", "I don't feel proud"] },
  { id: "q13", question: "How do you feel in social situations?", options: ["Energized", "Anxious", "Comfortable", "It depends"] },
  { id: "q14", question: "How often do you make time for hobbies you enjoy?", options: ["Daily", "Weekly", "Rarely", "Never"] },
  { id: "q15", question: "How would you describe your current motivation level?", options: ["Very high", "Moderate", "Low", "Non-existent"] },
  { id: "q16", question: "How do you react to criticism?", options: ["Constructively", "Defensively", "I get upset", "I ignore it"] },
  { id: "q17", question: "What part of your daily routine do you enjoy the most?", options: ["Morning", "Afternoon", "Evening", "None of it"] },
  { id: "q18", question: "How optimistic do you feel about your future?", options: ["Very optimistic", "Somewhat optimistic", "Pessimistic", "Unsure"] },
  { id: "q19", question: "How do you feel when you're alone?", options: ["Peaceful", "Lonely", "Bored", "Productive"] },
  { id: "q20", question: "If you could change one thing about your life right now, what would it be?", options: ["My workload", "My social life", "My habits", "Nothing"] },
];

const shuffleArray = (array: any[]) => {
    let newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

export default function GamePage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questions, setQuestions] = useState<{id: string; question: string; options: string[]}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    setQuestions(shuffleArray(allQuestions).slice(0, 10));
  }, []);

  useEffect(() => {
    if (user && user.role !== "student") {
      router.replace("/data");
    }
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

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])


  const handleOptionChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };
  
  const allQuestionsAnswered = questions.length > 0 && Object.keys(answers).length === questions.length;

  const handleSubmit = async () => {
    if (!allQuestionsAnswered) {
      toast({
        title: "Incomplete Game",
        description: "Please answer all questions before submitting.",
        variant: "destructive",
      });
      return;
    }
    if (!user?.name) {
       toast({
        title: "User Not Found",
        description: "Could not identify the current user.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
        const storedMoodData = localStorage.getItem("latestMood");
        if (!storedMoodData) throw new Error("Mood data not found.");
        
        const latestMood = JSON.parse(storedMoodData);
        
        const answerPayload = {
            answer1: answers[questions[0].id],
            answer2: answers[questions[1].id],
            answer3: answers[questions[2].id],
            answer4: answers[questions[3].id],
            answer5: answers[questions[4].id],
            answer6: answers[questions[5].id],
            answer7: answers[questions[6].id],
            answer8: answers[questions[7].id],
            answer9: answers[questions[8].id],
            answer10: answers[questions[9].id],
        };

        const analysis: MoodTruthfulnessOutput = await analyzeMoodTruthfulness({
            studentName: user.name,
            mood: latestMood.text,
            answers: answerPayload
        });

        const updatedMoodData = {
            ...latestMood,
            gameResponse: answerPayload,
            analysis: analysis.reasoning, // Keep initial analysis as fallback
            truthfulness: analysis.truthfulness,
            reasoning: analysis.reasoning,
            recommendation: analysis.recommendation,
        };

        localStorage.setItem("latestMood", JSON.stringify(updatedMoodData));

        const history = JSON.parse(localStorage.getItem("moodHistory") || "[]");
        if (history.length > 0) {
            history[0] = updatedMoodData; 
            localStorage.setItem("moodHistory", JSON.stringify(history));
        }

      toast({
        title: "Thank You!",
        description: "Let's have a quick chat to reflect on your answers.",
      });

      router.push('/chat');

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
  
  if (!user || user.role !== 'student' || questions.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-2xl py-10 animate-in fade-in">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Wellness Check-in</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Answer these questions to help us understand you better.
        </p>
      </div>

      <Card className="mt-10">
        <CardHeader>
            <Progress value={(current / count) * 100} className="w-full" />
            <p className="text-center text-sm text-muted-foreground pt-2">
                Question {current} of {count}
            </p>
        </CardHeader>
        <CardContent>
             <Carousel setApi={setApi} className="w-full">
                <CarouselContent>
                    {questions.map((q) => (
                        <CarouselItem key={q.id}>
                             <div className="p-1 text-center">
                                 <Label className="font-semibold text-lg">{q.question}</Label>
                                 <RadioGroup
                                    id={q.id}
                                    className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
                                    onValueChange={(value) => handleOptionChange(q.id, value)}
                                    value={answers[q.id] || ""}
                                >
                                    {q.options.map((option) => (
                                        <div key={option} className="flex items-center space-x-2 p-4 border rounded-md has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                            <RadioGroupItem value={option} id={`${q.id}-${option}`} />
                                            <Label htmlFor={`${q.id}-${option}`} className="w-full text-left cursor-pointer">{option}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                             </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                 <div className="flex items-center justify-center gap-4 pt-6">
                    <Button variant="outline" size="icon" onClick={() => api?.scrollPrev()} disabled={current === 1}>
                        <ArrowLeft />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => api?.scrollNext()} disabled={current === count}>
                        <ArrowRight />
                    </Button>
                </div>
            </Carousel>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSubmit} disabled={isLoading || !allQuestionsAnswered}>
            {isLoading && <Loader2 className="animate-spin" />}
            {isLoading ? "Analyzing..." : "Submit & Continue to Chat"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
