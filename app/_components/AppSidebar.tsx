"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <div className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="cursor-pointer"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="toggle theme"
    >
      {theme === "light" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}

export function AppSidebar() {
  return (
    <Sidebar className="p-3">
      <SidebarHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10">
              <Image
                src="/logo.svg"
                alt="AI fusion logo"
                width={60}
                height={60}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <h1 className="font-bold text-xl">AI fusion</h1>
          </div>
          <ThemeToggle />
        </div>
        <Button size={"lg"} className="w-full mt-6 cursor-pointer">
          + New Chat
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-lg">Chat</h3>
            <p className="text-sm text-neutral-500">
              Sign in to start chatting with multiple AI models
            </p>
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button size={"lg"} className="w-full cursor-pointer">
          Sign In/Sign Up
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
