import { createContext, Dispatch, SetStateAction } from "react";
import { defaultModel } from "@/shared/models";

type SelectedAIModelContextType = {
  selectedAIModel: typeof defaultModel;
  setSelectedAIModel: Dispatch<SetStateAction<typeof defaultModel>>;
};

const SelectedAIModelContext = createContext<SelectedAIModelContextType>({
  selectedAIModel: defaultModel,
  setSelectedAIModel: () => {},
});

export default SelectedAIModelContext;
