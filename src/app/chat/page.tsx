
"use client";

import { useState, useEffect, useRef } from "react";
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
import { Loader2, Send, Bot, Sparkles } from "lucide-react";
import { storyChat } from "@/ai/flows/story-chat-flow";
import type { StoryChatInput, StoryChatOutput } from "@/ai/schemas/story-chat";

export default function ChatPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [latestMood, setLatestMood] = useState<any>(null);

    const [chatMessage, setChatMessage] = useState("");
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', content: string }[]>([]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isConversationOver, setIsConversationOver] = useState(false);
    const [finalThought, setFinalThought] = useState<string | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user && user.role !== "student") {
            router.replace("/data");
        }
        
        try {
            const storedMood = localStorage.getItem("latestMood");
            if (storedMood) {
                const moodData = JSON.parse(storedMood);
                setLatestMood(moodData);
                // Start the chat as soon as the page loads with mood data
                startInitialChat(moodData);
            } else {
                 toast({
                    title: "No data found",
                    description: "Please submit your mood and play the game first.",
                    variant: "destructive"
                });
                router.replace("/");
            }
        } catch (error) {
             toast({
                title: "Error loading data",
                description: "Could not load your session. Please start over.",
                variant: "destructive"
            });
            router.replace("/");
        }

    }, [user, router, toast]);

    useEffect(() => {
        // Auto-scroll to the bottom of the chat
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, isChatLoading]);

    const startInitialChat = async (moodData: any) => {
        setIsChatLoading(true);
        try {
             const chatInput: StoryChatInput = {
                mood: moodData.text,
                gameAnswers: moodData.gameResponse,
                chatHistory: [],
            };

            const result: StoryChatOutput = await storyChat(chatInput);
            setChatHistory([{ role: 'model', content: result.response }]);

             if (result.isFinalMessage) {
                setIsConversationOver(true);
                setFinalThought(result.finalThought || "Take care.");
            }

        } catch (error) {
             toast({
                title: "Chat Error",
                description: "The chatbot is currently unavailable.",
                variant: "destructive",
            });
        } finally {
            setIsChatLoading(false);
        }
    }


    const handleChatSubmit = async () => {
        const message = chatMessage.trim();
        if (!message) return;

        setIsChatLoading(true);
        const currentHistory = [...chatHistory, { role: 'user' as const, content: message }];
        setChatHistory(currentHistory);
        setChatMessage("");

        try {
            const chatInput: StoryChatInput = {
                mood: latestMood.text,
                gameAnswers: latestMood.gameResponse,
                chatHistory: currentHistory,
            };

            const result: StoryChatOutput = await storyChat(chatInput);
            
            const newHistory = [...currentHistory, { role: 'model' as const, content: result.response }];
            setChatHistory(newHistory);
            
            if (result.isFinalMessage) {
                setIsConversationOver(true);
                setFinalThought(result.finalThought || "Take care.");
            }

        } catch (error) {
            toast({
                title: "Chat Error",
                description: "The chatbot is currently unavailable.",
                variant: "destructive",
            });
        } finally {
            setIsChatLoading(false);
        }
    };
    
    if (!user || user.role !== 'student' || !latestMood) {
        return <div className="flex min-h-[calc(100dvh-3.5rem)] w-full flex-col items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="flex min-h-[calc(100dvh-3.5rem)] w-full flex-col items-center justify-center p-4">
             <Card className="w-full max-w-md animate-in fade-in slide-in-from-bottom-5 bg-card/80 backdrop-blur-sm">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-2xl flex items-center justify-center gap-2">
                        <Bot /> A Moment to Reflect
                    </CardTitle>
                     <CardDescription>
                       Let's talk about how you're feeling.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div ref={chatContainerRef} className="h-96 space-y-4 overflow-y-auto rounded-md border bg-background/50 p-4">
                        {chatHistory.map((msg, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "flex items-start gap-3",
                                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                                )}
                            >
                                {msg.role === 'model' && <Bot className="shrink-0 text-primary" />}
                                <div
                                    className={cn(
                                        "max-w-xs rounded-lg px-3 py-2 text-sm",
                                        msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                    )}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                         {isChatLoading && (
                           <div className="flex justify-start gap-3">
                               <Bot className="shrink-0 text-primary" />
                               <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                                   <Loader2 className="animate-spin" />
                               </div>
                           </div>
                        )}
                         {chatHistory.length === 0 && !isChatLoading && (
                             <div className="flex h-full items-center justify-center text-muted-foreground">
                                <p>The chatbot is thinking...</p>
                             </div>
                         )}
                    </div>
                    
                    {isConversationOver && finalThought && (
                        <div className="!mt-6 rounded-lg border border-accent/50 bg-accent/20 p-4 text-center animate-in fade-in">
                            <Sparkles className="mx-auto h-6 w-6 text-accent-foreground/80" />
                            <p className="mt-2 font-headline text-lg italic text-accent-foreground">"{finalThought}"</p>
                            <p className="mt-2 text-xs text-muted-foreground">— A thought for you</p>
                        </div>
                    )}
                    
                    {!isConversationOver && (
                        <div className="relative">
                            <Textarea
                                placeholder="Say anything..."
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleChatSubmit();
                                    }
                                }}
                                disabled={isChatLoading || chatHistory.length === 0}
                                className="pr-12"
                                rows={2}
                            />
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                onClick={() => handleChatSubmit()}
                                disabled={isChatLoading || chatHistory.length === 0 || !chatMessage}
                            >
                                <Send />
                            </Button>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full"
                        onClick={() => router.push('/')}
                        disabled={!isConversationOver && chatHistory.length > 0}
                    >
                        {isConversationOver ? "Finish & Return Home" : "Waiting for conversation to end..."}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
