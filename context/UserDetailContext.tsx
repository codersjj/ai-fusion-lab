import { createContext, Dispatch, SetStateAction } from "react";
import { DefaultModel } from "@/shared/models";

export interface UserDetail {
  name: string;
  email: string;
  plan: string;
  remainingMsg: number;
  credits: number;
  createdAt: Date;
  selectedModelPreference?: DefaultModel;
}

type UserDetailContextType = {
  userDetail?: UserDetail | null;
  setUserDetail: Dispatch<SetStateAction<UserDetail | null>>;
};

const UserDetailContext = createContext<UserDetailContextType>({
  setUserDetail: () => {},
});

export default UserDetailContext;
