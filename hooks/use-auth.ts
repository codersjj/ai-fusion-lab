import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export const useAuth = () => {
  const { has, isLoaded } = useClerkAuth();
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  useEffect(() => {
    if (isLoaded && has) {
      try {
        const hasPremiumAccess = has({ plan: "unlimited_plan" });
        setHasPremiumAccess(hasPremiumAccess);
      } catch (error) {
        console.error("Failed to check premium access:", error);
        setHasPremiumAccess(false);
      }
    }
  }, [has, isLoaded]);
  return hasPremiumAccess;
};
