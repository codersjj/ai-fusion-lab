"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { use, useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "../../hooks/use-mobile";

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
      className="rounded-full cursor-pointer"
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const isMobile = useIsMobile();
  const { openMobile, setOpen } = useSidebar();

  useEffect(() => {
    if (isMobile) {
      // 移动端：初始显示浮动按钮
      setShowFloatingButton(!openMobile);
      setIsCollapsed(false); // 重置 collapsed 状态
    } else {
      // 桌面端：根据 collapsed 状态决定是否显示浮动按钮
      setShowFloatingButton(isCollapsed);
      setOpen(!isCollapsed);
    }
  }, [isMobile, isCollapsed, openMobile, setOpen]);

  const handleSidebarCollapse = () => {
    setIsCollapsed(true);
    if (isMobile) {
      // 移动端：切换浮动按钮显示状态
      setShowFloatingButton(true);
    }
  };

  const handleSidebarExpand = () => {
    setIsCollapsed(false);
    if (isMobile) {
      // 移动端：隐藏浮动按钮，实现切换效果
      setShowFloatingButton(false);
    }
  };

  return (
    <div className="relative">
      <Sidebar className="p-3">
        <SidebarHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center">
                <Image
                  src="/logo.svg"
                  alt="AI fusion logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <h1 className="font-bold text-xl">AI Fusion</h1>
            </div>
            <div className="flex justify-end items-center">
              <ThemeToggle />
              <SidebarTrigger
                className="p-4.5 w-4 h-4 rounded-full cursor-pointer"
                onClick={handleSidebarCollapse}
              />
            </div>
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
      <div
        className={`fixed top-5 left-5 flex items-center gap-2 transition-all ease-in-out duration-300 z-200 ${
          showFloatingButton
            ? "translate-x-0 opacity-100"
            : "translate-x-10 opacity-0 pointer-events-none"
        }`}
      >
        <div className="w-10 h-10 flex items-center justify-center">
          <Image
            src="/logo.svg"
            alt="AI fusion logo"
            width={60}
            height={60}
            className="w-full h-full object-contain"
            priority
          />
        </div>
        <div className="flex items-center bg-neutral-200 dark:bg-[#353638] rounded-full p-1">
          <ThemeToggle />
          <SidebarTrigger
            className="p-4.5 w-4 h-4 rounded-full cursor-pointer"
            onClick={handleSidebarExpand}
          />
        </div>
      </div>
    </div>
  );
}
