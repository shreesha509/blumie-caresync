
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Shield } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [password, setPassword] = useState("");

  const handleWardenLogin = () => {
    if (password === "bnmit") {
      login("warden");
    } else {
      toast({
        title: "Incorrect Password",
        description: "The password you entered is incorrect. Please try again.",
        variant: "destructive",
      });
    }
  };

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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="lg" variant="secondary">
                <Shield className="mr-2" />
                Login as Warden
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Warden Authentication</AlertDialogTitle>
                <AlertDialogDescription>
                  Please enter the password to access the warden dashboard.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password-input" className="text-right">
                    Password
                  </Label>
                  <Input
                    id="password-input"
                    type="password"
                    className="col-span-3"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleWardenLogin();
                      }
                    }}
                  />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setPassword('')}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleWardenLogin}>Login</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
