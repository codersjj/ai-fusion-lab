"use client";

import { useCallback, useEffect, useState } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { useUser } from "@clerk/nextjs";
import ChatInputBoxContext, { Messages } from "@/context/ChatInputBoxContext";
import { defaultModel } from "@/shared/models";
import UserDetailContext, { UserDetail } from "@/context/UserDetailContext";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [selectedAIModel, setSelectedAIModel] = useState(defaultModel);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [messages, setMessages] = useState<Messages>(
    null as unknown as Messages
  );

  const { user } = useUser();

  const createNewUser = useCallback(async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    const userRef = doc(db, "users", user.primaryEmailAddress.emailAddress);

    try {
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        console.log("User already exists");

        const userData = userSnap.data();
        console.log("🚀 ~ UserProvider ~ userData:", userData);
        setSelectedAIModel(userData.selectedModelPreference);
        setUserDetail(userData as UserDetail);

        return;
      }

      const userData = {
        name: user.fullName,
        email: user.primaryEmailAddress.emailAddress,
        plan: "free",
        remainingMsg: 5,
        credits: 1000,
        createdAt: new Date(),
        selectedModelPreference: defaultModel,
      };

      await setDoc(userRef, userData);
      console.log("New user data saved");

      setUserDetail(userData as UserDetail);
      setSelectedAIModel(defaultModel);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  }, [user]);

  useEffect(() => {
    createNewUser();
  }, [createNewUser]);

  const updateSelectedAIModel = useCallback(async () => {
    // Update to Firebase Database
    if (!user?.primaryEmailAddress?.emailAddress) return;
    const docRef = doc(db, "users", user?.primaryEmailAddress?.emailAddress);
    try {
      await updateDoc(docRef, {
        selectedModelPreference: selectedAIModel,
      });
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  }, [user, selectedAIModel]);

  useEffect(() => {
    updateSelectedAIModel();
  }, [updateSelectedAIModel]);

  return (
    <UserDetailContext value={{ userDetail, setUserDetail }}>
      <ChatInputBoxContext
        value={{ selectedAIModel, setSelectedAIModel, messages, setMessages }}
      >
        {children}
      </ChatInputBoxContext>
    </UserDetailContext>
  );
}
