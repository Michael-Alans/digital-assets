"use client";

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { LoadingState } from "@/components/states/LoadingState";

/**
 * Protected Route Guard 
 * Guards protected routes by checking session status.
 */
export function Protected({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId } = useAuth();

  useEffect(() => {
    if (isLoaded && !userId) {
      redirect("/sign-in");
    }
  }, [isLoaded, userId]);

  if (!isLoaded) {
    return <LoadingState />; // Using mandatory state component [cite: 57]
  }

  if (!userId) {
    return null;
  }

  return <>{children}</>;
}