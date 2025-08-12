
"use client";

import { useState } from "react";
import Image from "next/image";
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
import { studentData } from "@/lib/student-data";

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [studentName, setStudentName] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [wardenPassword, setWardenPassword] = useState("");

  const handleStudentLogin = () => {
    const student = studentData.find(s => s.name.toLowerCase() === studentName.toLowerCase());
    if (student && student.password === studentPassword) {
      login("student", { name: student.name });
    } else {
       toast({
        title: "Invalid Credentials",
        description: "The name or password you entered is incorrect. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleWardenLogin = () => {
    if (wardenPassword === "bnmit") {
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
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center p-4">
       <Image
          src="https://i.postimg.cc/c12C8M5A/Screenshot-2024-07-26-at-2-33-28-PM.png"
          alt="BNMIT Logo Background"
          layout="fill"
          objectFit="cover"
          className="z-0"
          data-ai-hint="logo background"
        />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10" />
      <Card className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-5 z-20">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Welcome to MoodLight</CardTitle>
          <CardDescription>
            Please select your role to log in.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="lg">
                <User className="mr-2" />
                Login as Student
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Student Login</AlertDialogTitle>
                <AlertDialogDescription>
                  Please enter your name and password to continue.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="student-name-input" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="student-name-input"
                    className="col-span-3"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                  />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="student-password-input" className="text-right">
                    Password
                  </Label>
                  <Input
                    id="student-password-input"
                    type="password"
                    className="col-span-3"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                     onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleStudentLogin();
                      }
                    }}
                  />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => {
                  setStudentName('');
                  setStudentPassword('');
                }}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleStudentLogin}>Login</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
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
                  <Label htmlFor="warden-password-input" className="text-right">
                    Password
                  </Label>
                  <Input
                    id="warden-password-input"
                    type="password"
                    className="col-span-3"
                    value={wardenPassword}
                    onChange={(e) => setWardenPassword(e.target.value)}
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
                <AlertDialogCancel onClick={() => setWardenPassword('')}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleWardenLogin}>Login</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
