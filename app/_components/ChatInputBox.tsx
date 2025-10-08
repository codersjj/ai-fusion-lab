"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ArrowUp, Mic, Paperclip } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import AIMultiModels from "./AIMultiModels";
import ChatInputBoxContext, { Messages } from "@/context/ChatInputBoxContext";
import { useDebouncedState } from "@/hooks/use-debounced-state";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import UserDetailContext from "@/context/UserDetailContext";

function ChatInputBox() {
  const [inputValue, , setUserInput] = useDebouncedState("");
  const { selectedAIModel, messages, setMessages, onConversationSaved } =
    useContext(ChatInputBoxContext);
  const [chatId, setChatId] = useState("");
  const params = useSearchParams();
  const { userDetail } = useContext(UserDetailContext);
  const router = useRouter();
  const pathname = usePathname();

  // 使用 ref 来追踪是否已经创建了新的 chatId
  const hasCreatedNewChat = useRef(false);
  // 追踪是否正在加载历史消息
  const isLoadingHistory = useRef(false);

  useEffect(() => {
    const urlChatId = params.get("chatId");

    if (urlChatId) {
      // 直接在这里调用 getMessages，不依赖外部的 getMessages 函数
      const loadMessages = async () => {
        if (!urlChatId) return;

        isLoadingHistory.current = true; // 标记正在加载

        const docRef = doc(db, "chatHistory", urlChatId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const messages: Messages = docSnap.data().messages;
          setMessages(messages);
        } else {
          isLoadingHistory.current = false;
        }
      };

      loadMessages();
    } else {
      setMessages({} as Messages); // 使用空对象而不是 null
      isLoadingHistory.current = false; // 确保重置标记
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]); // 只依赖 params

  useEffect(() => {
    const chatId = params.get("chatId");
    // console.log("🚀 ~ ChatInputBox ~ chatId:", chatId);
    setChatId(chatId || ""); // 如果没有 chatId，设置为空字符串
    hasCreatedNewChat.current = false; // 重置标记
    // 不要在这里重置 isLoadingHistory.current，让 getMessages 来控制
  }, [params]);

  const handleSend = () => {
    if (inputValue.trim() === "") return;

    // 1. Add user message to all enabled models
    setMessages((prev) => {
      const updated = { ...prev };
      Object.keys(selectedAIModel).forEach((modelKey) => {
        if (selectedAIModel[modelKey].enable) {
          updated[modelKey] = [
            ...(updated[modelKey] ?? []),
            {
              role: "user",
              content: inputValue,
              timestamp: new Date().getTime(),
            },
          ];
        }
      });

      return updated;
    });

    const currentInput = inputValue;
    setUserInput("");

    // 2. Fetch response from the API for each enabled model
    Object.entries(selectedAIModel).forEach(
      async ([parentModel, modelInfo]) => {
        if (!modelInfo.modelId || !modelInfo.enable) return;

        // Add loading placeholder before the API call
        setMessages((prev) => {
          const updated = { ...prev };
          updated[parentModel] = [
            ...updated[parentModel],
            {
              role: "assistant",
              content: "Thinking...",
              timestamp: new Date().getTime(),
              model: parentModel,
              loading: true,
            },
          ];

          return updated;
        });

        try {
          const res = await axios.post("/api/ai-multi-model", {
            parentModel,
            model: modelInfo.modelId,
            msg: [{ role: "user", content: currentInput }],
          });
          // console.log("🚀 ~ handleSend ~ res:", res);

          const { aiResponse } = res.data;

          // 3. Update the assistant message of the respective model with the actual response
          setMessages((prev) => {
            const updated = [...prev[parentModel]];
            const loadingIndex = updated.findIndex((m) => m.loading);

            if (loadingIndex !== -1) {
              updated[loadingIndex] = {
                role: "assistant",
                content: aiResponse,
                timestamp: new Date().getTime(),
                model: parentModel,
                loading: false,
              };
            } else {
              // Fallback: If no loading message found, just append the response
              updated.push({
                role: "assistant",
                content: aiResponse,
                timestamp: new Date().getTime(),
                model: parentModel,
                loading: false,
              });
            }

            return { ...prev, [parentModel]: updated };
          });
        } catch (error) {
          console.error(`Error fetching response for ${parentModel}:`, error);
          // Update the loading message to show an error
          setMessages((prev) => ({
            ...prev,
            [parentModel]: [
              ...prev[parentModel].filter((m) => !m.loading),
              {
                role: "assistant",
                content: "Error fetching response.",
                timestamp: new Date().getTime(),
                model: parentModel,
                loading: false,
              },
            ],
          }));
        }
      }
    );
  };

  const saveConversation = useCallback(async () => {
    // 更严格的检查：确保 chatId 不为空字符串
    if (!chatId || chatId === "" || !userDetail) {
      return;
    }
    console.log("begin saveConversation", chatId);

    const docRef = doc(db, "chatHistory", chatId);
    const docSnap = await getDoc(docRef);
    let createdAt = new Date();
    if (docSnap.exists()) {
      createdAt = docSnap.data()?.createdAt;
    }
    await setDoc(docRef, {
      chatId,
      userEmail: userDetail.email,
      messages,
      createdAt,
      updatedAt: new Date(),
    });

    // 保存完成后触发回调
    if (onConversationSaved) {
      onConversationSaved();
    }
  }, [chatId, messages, userDetail, onConversationSaved]);

  // 保存对话的 effect - 只依赖 messages
  useEffect(() => {
    // 检查 messages 是否为空对象或 null
    const hasMessages = messages && Object.keys(messages).length > 0;

    if (hasMessages) {
      // 如果是刚加载完历史消息，重置加载标记后再判断是否保存
      if (isLoadingHistory.current) {
        console.log("📋 History loaded, resetting flag");
        isLoadingHistory.current = false;
        return; // 首次加载不保存
      }

      // 额外检查：确保 chatId 不为空字符串
      if (!chatId || chatId === "") {
        return;
      }

      saveConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // 检测首次响应并创建新 chatId 的 effect - 移除 createQueryString 依赖
  useEffect(() => {
    // console.log("messages", messages);
    // console.log("chatId", chatId);
    // console.log("hasCreatedNewChat.current", hasCreatedNewChat.current);
    // console.log("isLoadingHistory.current", isLoadingHistory.current);

    // 只有在没有 chatId 且 messages 不为空且没有创建过新会话时才创建 UUID
    // 并且确保不是在从历史会话切换到新建会话的过程中
    if (
      !messages ||
      chatId ||
      hasCreatedNewChat.current ||
      isLoadingHistory.current
    )
      return;

    const hasFirstResponse = Object.entries(messages).find(([, msgArr]) => {
      return msgArr.length === 2 && msgArr[1].loading === false;
    });
    // console.log("🚀 ~ ChatInputBox ~ hasFirstResponse:", hasFirstResponse);
    if (hasFirstResponse) {
      hasCreatedNewChat.current = true; // 标记已创建
      const newChatId = uuidv4();
      router.push(`${pathname}?chatId=${newChatId}`);
    }
  }, [messages, router, pathname, chatId]);

  return (
    <div className="relative w-full h-full">
      {/* Page Content */}
      <div className="w-full h-full">
        <AIMultiModels />
      </div>

      {/* Fixed Chat Input  */}
      <div className="absolute z-100 bottom-6 left-0 right-0 mx-auto rounded-3xl w-[50vw] min-h-30 max-h-[336px] overflow-auto bg-neutral-50 dark:bg-neutral-800 shadow-md dark:shadow-neutral-500/50 dark:shadow-lg">
        <Textarea
          className="md:px-4.5 md:py-3.5 w-full h-full min-h-30 resize-none rounded-3xl"
          placeholder="Ask me anything..."
          value={inputValue}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <div className="absolute bottom-2 left-0 flex justify-between w-full px-2 md:px-4.5">
          <Button
            variant={"ghost"}
            size={"icon"}
            className="cursor-pointer rounded-full dark:hover:bg-neutral-700"
          >
            <Paperclip />
          </Button>
          <div className="flex gap-2">
            <Button
              variant={"ghost"}
              size={"icon"}
              className="cursor-pointer rounded-full dark:hover:bg-neutral-700"
            >
              <Mic />
            </Button>
            <Button
              className="relative z-10 w-9 cursor-pointer rounded-full enabled:hover:bg-neutral-700 dark:enabled:hover:bg-neutral-300 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:hover:bg-primary"
              disabled={inputValue.trim() === ""}
              onClick={handleSend}
            >
              <ArrowUp />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInputBox;
