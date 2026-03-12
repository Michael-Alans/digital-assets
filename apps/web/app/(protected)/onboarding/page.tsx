"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs"; // 1. Added useUser
import { toast } from "sonner";

export default function CreatorOnboardingPage() {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const { getToken } = useAuth();
  const { user } = useUser(); // 2. Destructure user

  const handleEnroll = async () => {
    setIsPending(true);
    try {
      const token = await getToken();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/promote-to-creator`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Onboarding failed");
      }

      // 3. FORCE CLERK TO RELOAD METADATA
      // This is the secret sauce that makes the Creator Dashboard link appear 
      // in the SiteHeader instantly without a page refresh or logout.
      await user?.reload(); 

      toast.success("Welcome to the Creator Program!");
      
      router.refresh(); 
      router.push("/creator/assets");
    } catch (err: any) {
      console.error("Onboarding Error:", err.message);
      toast.error(err.message || "Could not complete onboarding. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-20 px-6 text-center">
      <h1 className="text-4xl font-bold mb-4">Start Selling Your Assets</h1>
      <p className="text-muted-foreground mb-8">
        Upgrade your account to upload, manage, and track your digital products.
      </p>
      <button
        onClick={handleEnroll}
        disabled={isPending}
        className="bg-primary text-white rounded-xl font-bold py-4 px-12 hover:opacity-90 transition-all shadow-lg disabled:opacity-50 cursor-pointer"
      >
        {isPending ? "Setting up Profile..." : "Become a Creator"}
      </button>
    </div>
  );
}