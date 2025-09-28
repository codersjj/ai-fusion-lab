"use client";

import { useState } from "react";
import Image from "next/image";
import models from "@/shared/models";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MessageSquare } from "lucide-react";

function AIMultiModels() {
  const [modelList, setModelList] = useState(models);

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
                    <Select>
                      <SelectTrigger className="w-30 md:w-55">
                        <SelectValue placeholder={subModel[0].name} />
                      </SelectTrigger>
                      <SelectContent>
                        {subModel.map(({ name }) => (
                          <SelectItem key={name} value={name}>
                            {name}
                          </SelectItem>
                        ))}
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
              {enable && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg">{model}</h3>
                    {premium && (
                      <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded mt-2">
                        Premium
                      </span>
                    )}
                  </div>

                  {/* 模拟内容区域 - 自适应宽度 */}
                  <div className="space-y-4 text-sm text-gray-600">
                    <p>Model capabilities and features (33% min-width)...</p>
                    <div className="h-32 bg-gray-50 rounded border-2 border-dashed border-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">
                        Min 33% Width Content
                      </span>
                    </div>

                    {/* 展示自适应效果的额外内容 */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 bg-blue-50 rounded text-xs">
                        Feature 1
                      </div>
                      <div className="p-3 bg-green-50 rounded text-xs">
                        Feature 2
                      </div>
                      <div className="p-3 bg-purple-50 rounded text-xs">
                        Feature 3
                      </div>
                      <div className="p-3 bg-orange-50 rounded text-xs">
                        Feature 4
                      </div>
                    </div>

                    {/* 添加更多内容来演示滚动效果 */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-800">
                        Configuration Options:
                      </h4>
                      <div className="space-y-2">
                        <div className="p-3 bg-white border rounded shadow-sm">
                          <div className="font-medium text-xs text-gray-700">
                            Temperature
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Controls randomness in output
                          </div>
                        </div>
                        <div className="p-3 bg-white border rounded shadow-sm">
                          <div className="font-medium text-xs text-gray-700">
                            Max Tokens
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Maximum response length
                          </div>
                        </div>
                        <div className="p-3 bg-white border rounded shadow-sm">
                          <div className="font-medium text-xs text-gray-700">
                            Top-p
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Nucleus sampling parameter
                          </div>
                        </div>
                        <div className="p-3 bg-white border rounded shadow-sm">
                          <div className="font-medium text-xs text-gray-700">
                            Frequency Penalty
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Reduces repetition
                          </div>
                        </div>
                        <div className="p-3 bg-white border rounded shadow-sm">
                          <div className="font-medium text-xs text-gray-700">
                            Presence Penalty
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Encourages topic diversity
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 统计信息 */}
                    <div className="mt-4 p-3 bg-gray-100 rounded">
                      <h4 className="font-medium text-xs text-gray-800 mb-2">
                        Model Statistics
                      </h4>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>Parameters:</span>
                          <span>175B</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Training Data:</span>
                          <span>2023</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Context Length:</span>
                          <span>32k tokens</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Response Time:</span>
                          <span>~2-5s</span>
                        </div>
                      </div>
                    </div>

                    {/* 额外的演示内容确保需要滚动 */}
                    <div className="mt-4 space-y-2">
                      <div className="h-16 bg-red-50 rounded flex items-center justify-center text-xs text-red-600">
                        Demo Content Block 1
                      </div>
                      <div className="h-16 bg-blue-50 rounded flex items-center justify-center text-xs text-blue-600">
                        Demo Content Block 2
                      </div>
                      <div className="h-16 bg-green-50 rounded flex items-center justify-center text-xs text-green-600">
                        Demo Content Block 3
                      </div>
                    </div>
                  </div>
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
