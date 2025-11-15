
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useFirebase } from "@/firebase";
import { signInAnonymously } from "firebase/auth";
import { studentData } from "@/lib/student-data";

type Role = "student" | "warden";
interface User {
  role: Role;
  name?: string; 
}

interface AuthContextType {
  user: User | null;
  login: (role: Role, credentials?: { name: string; password?: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  // We can't use useFirebase here directly because this provider wraps the FirebaseProvider.
  // We will handle the auth logic manually.
  
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else if (pathname !== "/login") {
        router.replace("/login");
      }
    } catch (error) {
       console.error("Failed to parse user from localStorage", error);
       localStorage.removeItem("user");
       if (pathname !== "/login") {
        router.replace("/login");
      }
    }
  }, []);

  useEffect(() => {
     if (user) {
      if (pathname === "/login") {
        router.replace(user.role === 'student' ? '/' : '/data');
      }
    } else if (pathname !== "/login") {
      router.replace("/login");
    }
  }, [user, pathname, router]);

  const login = (role: Role, credentials?: { name?: string; password?: string }) => {
    const userData: User = { role, name: credentials?.name };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
     // Also sign out from Firebase if needed
    const { auth } = useFirebase();
    if (auth.currentUser) {
        auth.signOut();
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
