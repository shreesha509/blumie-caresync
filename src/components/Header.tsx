
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lightbulb, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navLinks = user
    ? user.role === "student"
      ? [
          { href: "/", label: "Mood" },
          { href: "/game", label: "Game" },
          { href: "/chat", label: "Chat" },
        ]
      : [
          { href: "/data", label: "Data" },
        ]
    : [];

  if (!user) {
    return null; // Don't render header on login page
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Lightbulb className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline sm:inline-block">
            MoodLight
          </span>
        </Link>
        <nav className="flex flex-1 items-center gap-4 text-sm lg:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === link.href ? "text-foreground font-semibold" : "text-foreground/60"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
         <Button variant="ghost" size="sm" onClick={logout}>
            Logout
            <LogOut className="ml-2 h-4 w-4" />
          </Button>
      </div>
    </header>
  );
}
