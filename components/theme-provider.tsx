"use client";

import React, { useCallback, useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { useUser } from "@clerk/nextjs";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const { user } = useUser();

  const createNewUser = useCallback(async () => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      return;
    }

    const userRef = doc(db, "users", user?.primaryEmailAddress?.emailAddress);

    try {
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // If user exist, do nothing
        console.log("User already exists");
        return;
      } else {
        // If user does not exist, create a new user
        const userData = {
          name: user?.fullName,
          email: user?.primaryEmailAddress?.emailAddress,
          plan: "free",
          remainingMsg: 5, // only for free plan
          credits: 1000, // only for paid plan
          createdAt: new Date(),
        };

        await setDoc(userRef, userData);
        console.log("New user data saved");
      }
    } catch (error) {
      console.error("Error creating user document: ", error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      createNewUser();
    }
  }, [user, createNewUser]);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
