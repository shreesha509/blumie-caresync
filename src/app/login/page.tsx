
"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Shield } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-5">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Welcome to MoodLight</CardTitle>
          <CardDescription>
            Please select your role to log in.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button size="lg" onClick={() => login("student")}>
            <User className="mr-2" />
            Login as Student
          </Button>
          <Button size="lg" variant="secondary" onClick={() => login("warden")}>
             <Shield className="mr-2" />
            Login as Warden
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
