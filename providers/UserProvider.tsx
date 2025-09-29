"use client";

import { useCallback, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { useUser } from "@clerk/nextjs";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();

  const createNewUser = useCallback(async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    const userRef = doc(db, "users", user.primaryEmailAddress.emailAddress);

    try {
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        console.log("User already exists");
        return;
      }

      const userData = {
        name: user.fullName,
        email: user.primaryEmailAddress.emailAddress,
        plan: "free",
        remainingMsg: 5,
        credits: 1000,
        createdAt: new Date(),
      };

      await setDoc(userRef, userData);
      console.log("New user data saved");
    } catch (error) {
      console.error("Error creating user:", error);
    }
  }, [user]);

  useEffect(() => {
    createNewUser();
  }, [createNewUser]);

  return <>{children}</>;
}
