import { createContext, Dispatch, SetStateAction } from "react";
import { defaultModel } from "@/shared/models";

// data structure example
/* 
{
  "openai": [
    { role: "user", content: "Hello" },
    { role: "assistant", content: "Hi there!" }
  ],
  "anthropic": [
    { role: "user", content: "Hello" },
    { role: "assistant", content: "Hello! How can I help?" }
  ],
  "google": [
    { role: "user", content: "Hello" }
  ]
}
*/

export type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  model?: string;
  loading?: boolean;
};

export type Messages = {
  [modelKey: string]: Message[];
};

type ChatInputBoxContextType = {
  selectedAIModel: typeof defaultModel;
  setSelectedAIModel: Dispatch<SetStateAction<typeof defaultModel>>;
  messages: Messages;
  setMessages: Dispatch<SetStateAction<Messages>>;
  onConversationSaved?: () => void;
  setOnConversationSaved: (callback: (() => void) | undefined) => void;
};

const ChatInputBoxContext = createContext<ChatInputBoxContextType>({
  selectedAIModel: defaultModel,
  setSelectedAIModel: () => {},
  messages: null as unknown as Messages,
  setMessages: () => {},
  onConversationSaved: undefined,
  setOnConversationSaved: () => {},
});

export default ChatInputBoxContext;
