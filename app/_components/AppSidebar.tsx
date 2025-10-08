"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Moon, Sun, User2, Zap } from "lucide-react";
import { SignInButton, useUser } from "@clerk/nextjs";
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
import UsageCreditProgress from "./UsageCreditProgress";
import {
  collection,
  DocumentData,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import UserDetailContext from "@/context/UserDetailContext";
import { useSearchParams } from "next/navigation";
import { getRelativeTime } from "@/lib/utils";
import ChatInputBoxContext, { Message } from "@/context/ChatInputBoxContext";
import Link from "next/link";

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

  const { isSignedIn, user } = useUser();
  const { userDetail } = useContext(UserDetailContext);
  const { setOnConversationSaved } = useContext(ChatInputBoxContext);
  const [chatHistory, setChatHistory] = useState<DocumentData[]>([]);
  const searchParams = useSearchParams();

  const getChatHistory = useCallback(async () => {
    if (!userDetail?.email) return;

    // 注意：使用 where + orderBy 需要在 Firestore 中创建复合索引
    // 如果没有索引，可以去掉 orderBy，在客户端排序
    const q = query(
      collection(db, "chatHistory"),
      where("userEmail", "==", userDetail.email)
      // orderBy("updatedAt", "desc") // 需要复合索引，暂时注释
    );
    const querySnapshot = await getDocs(q);

    const historyData: DocumentData[] = [];
    querySnapshot.forEach((doc) => {
      // console.log("📄 Document:", doc.id, doc.data());
      const currentTimeInSeconds = Math.floor(new Date().getTime() / 1000);
      const updatedTimeInSeconds = doc.data().updatedAt.seconds;
      const elapsedTimeInSeconds = currentTimeInSeconds - updatedTimeInSeconds;
      const elapsedTime = getRelativeTime(elapsedTimeInSeconds);

      const allMessages = Object.values(
        doc.data().messages
      ).flat() as Message[];
      const userMessages = allMessages
        .filter((message: Message) => message.role === "user")
        .sort((a, b) => a.timestamp - b.timestamp);
      const lastMessage = userMessages[userMessages.length - 1];
      historyData.push({
        ...doc.data(),
        elapsedTime,
        lastMessage: lastMessage.content,
      });
    });

    // ✅ 在客户端按 updatedAt 降序排序
    historyData.sort((a, b) => b.updatedAt.seconds - a.updatedAt.seconds);
    setChatHistory(historyData);
  }, [userDetail?.email]);

  useEffect(() => {
    getChatHistory();
  }, [getChatHistory, searchParams]);

  // 设置保存完成回调
  useEffect(() => {
    // 如果需要将 getChatHistory 存储到 state 中供其他组件调用
    // 注意：必须使用箭头函数包装，不能直接传递 getChatHistory
    // ✅ 正确: setOnConversationSaved(() => getChatHistory)
    // ❌ 错误: setOnConversationSaved(getChatHistory)
    // 原因：React 的 setState 会将直接传入的函数当作 updater function 立即执行，
    // 导致存储的是函数的返回值（Promise）而不是函数本身
    setOnConversationSaved(() => getChatHistory);

    // 清理函数
    return () => {
      setOnConversationSaved(undefined);
    };
  }, [setOnConversationSaved, getChatHistory]);

  useEffect(() => {
    console.log("chatHistory", chatHistory);
  }, [chatHistory]);

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
          {user ? (
            <Link href={"/"}>
              <Button size={"lg"} className="w-full mt-6 cursor-pointer">
                + New Chat
              </Button>
            </Link>
          ) : (
            <SignInButton mode="modal">
              <Button size={"lg"} className="w-full mt-6 cursor-pointer">
                + New Chat
              </Button>
            </SignInButton>
          )}
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-lg">Chat</h3>
              {!isSignedIn && (
                <p className="text-sm text-neutral-500">
                  Sign in to start chatting with multiple AI models
                </p>
              )}
              {chatHistory.map((chat) => (
                <Link
                  key={chat.chatId}
                  href={`?chatId=${chat.chatId}`}
                  className={`hover:bg-neutral-300 dark:hover:bg-neutral-700 p-2 rounded-md cursor-pointer ${
                    searchParams.get("chatId") === chat.chatId
                      ? "bg-neutral-200 dark:bg-neutral-800"
                      : ""
                  }`}
                >
                  <span className="text-sm text-neutral-500">
                    {chat.elapsedTime}
                  </span>
                  <h3 className="text-base line-clamp-1">{chat.lastMessage}</h3>
                </Link>
              ))}
            </div>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <Button size={"lg"} className="w-full cursor-pointer">
                Sign In/Sign Up
              </Button>
            </SignInButton>
          ) : (
            <div className="flex flex-col gap-3">
              <UsageCreditProgress />
              <Button className="cursor-pointer">
                <Zap /> Upgrade Plan
              </Button>
              <Button
                className="flex justify-center items-center gap-2 border border-violet-300 w-full"
                variant={"ghost"}
              >
                <User2 />
                <h3>{user.firstName}</h3>
              </Button>
            </div>
          )}
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
