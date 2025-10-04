"use client";

import { useContext, useState } from "react";
import Image from "next/image";
import { Lock, MessageSquare, Loader } from "lucide-react";
import models from "@/shared/models";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import ChatInputBoxContext from "@/context/ChatInputBoxContext";
import { db } from "@/config/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { useUser } from "@clerk/nextjs";

function AIMultiModels() {
  const [modelList, setModelList] = useState(models);
  const { user } = useUser();
  const { selectedAIModel, setSelectedAIModel, messages } =
    useContext(ChatInputBoxContext);
  console.log("🚀 ~ AIMultiModels ~ messages:", messages);

  const handleSelectChange = async (parentModel: string, value: string) => {
    const newModel = {
      ...selectedAIModel,
      [parentModel]: { modelId: value },
    };

    setSelectedAIModel(newModel);

    // Update to Firebase Database
    if (!user?.primaryEmailAddress?.emailAddress) return;
    const docRef = doc(db, "users", user?.primaryEmailAddress?.emailAddress);
    try {
      await updateDoc(docRef, {
        selectedModelPreference: newModel,
      });
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const handleCheckedChange = (targetModel: string, checked: boolean) => {
    setModelList((prevList) =>
      prevList.map((modelData) => ({
        ...modelData,
        enable: targetModel === modelData.model ? checked : modelData.enable,
      }))
    );
  };

  return (
    <div className="flex justify-center items-center pt-18 w-full h-full">
      <ul className="w-full h-full flex overflow-x-auto">
        {modelList.map(({ model, icon, premium, enable, subModel }) => (
          <li
            key={model}
            className="border h-[75vh] overflow-hidden flex-shrink-0"
            style={{
              // 使用 flex-grow 实现自适应，collapsed 时固定宽度
              flexGrow: enable ? 1 : 0,
              flexShrink: enable ? 0 : 0, // 展开时不收缩，保证最小宽度
              flexBasis: enable ? "33.333%" : "7.5rem", // 展开时最小33%宽度
              minWidth: enable ? "33.333%" : "7.5rem", // 确保最小宽度
              transition:
                "flex-grow 0.3s cubic-bezier(0.4, 0, 0.2, 1), flex-basis 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div className="flex justify-between items-center border-b p-4 h-15 relative">
              {/* 左侧内容区域 */}
              <div className="flex gap-4 items-center w-full">
                <Image
                  src={icon}
                  alt="model"
                  width={40}
                  height={40}
                  className="w-6 h-6 flex-shrink-0"
                />

                {/* Select 组件容器 */}
                <div
                  className="absolute left-15 top-1/2 -translate-y-1/2"
                  style={{
                    opacity: enable ? 1 : 0,
                    visibility: enable ? "visible" : "hidden",
                    transform: `translateY(0) translateX(${
                      enable ? "0" : "-20px"
                    })`,
                    transition:
                      "opacity 0.6s ease-in-out, transform 0.6s ease-in-out, visibility 0.6s ease-in-out",
                    transitionDelay: enable ? "0.3s" : "0s",
                  }}
                >
                  {subModel && subModel.length > 0 && (
                    <Select
                      value={selectedAIModel?.[model]?.modelId}
                      onValueChange={(value) =>
                        handleSelectChange(model, value)
                      }
                      disabled={!enable || premium}
                    >
                      <SelectTrigger className="w-30 md:w-55">
                        <SelectValue placeholder={subModel[0].name} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Free</SelectLabel>
                          {subModel
                            .filter(({ premium }) => !premium)
                            .map(({ id, name }) => (
                              <SelectItem key={name} value={id}>
                                {name}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Premium</SelectLabel>
                          {subModel
                            .filter(({ premium }) => premium)
                            .map(({ id, name }) => (
                              <SelectItem key={name} value={id} disabled>
                                {name} <Lock />
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {/* 右侧开关/按钮 */}
              <div className="flex-shrink-0 relative z-10">
                {enable ? (
                  <Switch
                    className="cursor-pointer"
                    checked={enable}
                    onCheckedChange={(checked) =>
                      handleCheckedChange(model, checked)
                    }
                  />
                ) : (
                  <MessageSquare
                    className="cursor-pointer hover:text-violet-500 transition-colors duration-200 w-5 h-5"
                    onClick={() => handleCheckedChange(model, true)}
                  />
                )}
              </div>
            </div>

            {/* 内容区域 - 添加滚动条 */}
            <div
              className="p-4 overflow-y-auto"
              style={{
                opacity: enable ? 1 : 0,
                visibility: enable ? "visible" : "hidden",
                transition:
                  "opacity 0.5s ease-in-out, visibility 0.5s ease-in-out",
                transitionDelay: enable ? "0.5s" : "0s",
                height: "calc(75vh - 60px)", // 减去header高度
                maxHeight: "calc(75vh - 60px)",
              }}
            >
              {enable && !premium && (
                <div className="flex flex-col gap-4">
                  {messages &&
                    messages[model].map((message, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          message.role === "user"
                            ? "bg-blue-100 dark:bg-blue-950 self-end"
                            : "bg-gray-200 dark:bg-gray-600 self-start"
                        }`}
                      >
                        <h3 className="font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                          {message.role === "user" ? "You" : model}
                        </h3>
                        <p className="text-sm">
                          {message.content === "Thinking..." ? (
                            <span className="animate-pulse flex gap-1 items-center">
                              <Loader className="animate-spin" />
                              Thinking...
                            </span>
                          ) : (
                            message.content
                          )}
                        </p>
                      </div>
                    ))}
                </div>
              )}
              {enable && premium && (
                <div className="h-full flex justify-center items-center">
                  <Button className="flex items-center cursor-pointer">
                    <Lock />
                    <span>Upgrade to unlock</span>
                  </Button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AIMultiModels;
