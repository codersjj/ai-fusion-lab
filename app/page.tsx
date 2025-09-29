"use client";

import { Button } from "@/components/ui/button";
import ChatInputBox from "./_components/ChatInputBox";

export default function Home() {
  return (
    <div className="flex justify-center items-center h-screen">
      <ChatInputBox />
    </div>
  );
}
