import { ArrowUp, Mic, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import AIMultiModels from "./AIMultiModels";

function ChatInputBox() {
  return (
    <div className="relative w-full h-full">
      {/* Page Content */}
      <div className="w-full h-full">
        <AIMultiModels />
      </div>

      {/* Fixed Chat Input  */}
      <div className="absolute z-100 bottom-5 left-0 right-0 mx-auto rounded-3xl w-[50vw] min-h-30 max-h-[336px] overflow-auto bg-neutral-50 dark:bg-neutral-800 shadow-md dark:shadow-neutral-500/50 dark:shadow-lg">
        <Textarea
          className="md:px-4.5 md:py-3.5 w-full h-full min-h-30 resize-none rounded-3xl"
          placeholder="Ask me anything..."
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
            <Button className="w-9 cursor-pointer rounded-full hover:bg-neutral-700 dark:hover:bg-neutral-300">
              <ArrowUp />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInputBox;
