import { useContext, useEffect, useState } from "react";
import { ArrowUp, Mic, Paperclip } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import AIMultiModels from "./AIMultiModels";
import ChatInputBoxContext from "@/context/ChatInputBoxContext";

function ChatInputBox() {
  const [userInput, setUserInput] = useState("");
  const { selectedAIModel, setSelectedAIModel, messages, setMessages } =
    useContext(ChatInputBoxContext);

  const handleSend = () => {
    if (userInput.trim() === "") return;

    // 1. Add user message to all enabled models
    setMessages((prev) => {
      const updated = { ...prev };
      Object.keys(selectedAIModel).forEach((modelKey) => {
        if (selectedAIModel[modelKey].enable) {
          updated[modelKey] = [
            ...(updated[modelKey] ?? []),
            { role: "user", content: userInput },
          ];
        }
      });

      return updated;
    });

    const currentInput = userInput;
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
          console.log("🚀 ~ handleSend ~ res:", res);

          const { aiResponse } = res.data;

          // 3. Update the assistant message of the respective model with the actual response
          setMessages((prev) => {
            const updated = [...prev[parentModel]];
            const loadingIndex = updated.findIndex((m) => m.loading);

            if (loadingIndex !== -1) {
              updated[loadingIndex] = {
                role: "assistant",
                content: aiResponse,
                model: parentModel,
                loading: false,
              };
            } else {
              // Fallback: If no loading message found, just append the response
              updated.push({
                role: "assistant",
                content: aiResponse,
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
                model: parentModel,
                loading: false,
              },
            ],
          }));
        }
      }
    );
  };

  useEffect(() => {
    console.log("Messages updated:", messages);
  }, [messages]);

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
          value={userInput}
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
              disabled={userInput.trim() === ""}
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
