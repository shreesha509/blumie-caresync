
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

type Role = "student" | "warden";
interface User {
  role: Role;
}

interface AuthContextType {
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUserRole = localStorage.getItem("userRole");
    if (storedUserRole) {
      setUser({ role: storedUserRole as Role });
    } else if (pathname !== "/login") {
      router.replace("/login");
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

  const login = (role: Role) => {
    localStorage.setItem("userRole", role);
    setUser({ role });
  };

  const logout = () => {
    localStorage.removeItem("userRole");
    setUser(null);
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
