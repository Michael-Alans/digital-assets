"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";

interface ClaimButtonProps {
  assetId: string;
  price: number;
}

export function ClaimButton({ assetId, price }: ClaimButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { getToken, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Captures current URL (e.g., /assets/cmmj94...)

  const handleClaim = async () => {
    // 1. GUEST FLOW: Redirect to login with a return path
    if (!isSignedIn) {
      toast.info("Please sign in to claim this asset");
      
      // We encode the current pathname so Clerk knows where to send the user back to
      const redirectUrl = encodeURIComponent(pathname);
      return router.push(`/sign-in?redirect_url=${redirectUrl}`);
    }

    setIsProcessing(true);
    const toastId = "claim-toast";
    toast.loading("Processing your claim...", { id: toastId });

    try {
      const token = await getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      // Using the Assets Controller route: /assets/:id/claim
      const res = await fetch(`${apiUrl}/assets/${assetId}/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // 2. ALREADY OWNED FLOW: Redirect to Library
        if (data.message?.toLowerCase().includes("already own") || res.status === 400) {
          toast.success("You already own this! Redirecting to your library...", { id: toastId });
          return router.push("/buyer/my-assets");
        }
        throw new Error(data.message || "Failed to claim asset");
      }

      // 3. SUCCESS FLOW: Redirect to Library
      toast.success("Successfully claimed! Redirecting...", { id: toastId });
      
      // Small delay so the user sees the success toast before the page jumps
      setTimeout(() => {
        router.push("/buyer/my-assets");
      }, 1500);

    } catch (error: any) {
      console.error("Claim Error:", error);
      toast.error(error.message || "Transaction failed", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleClaim}
      disabled={isProcessing}
      className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
    >
      {isProcessing ? "Verifying..." : `Claim for $${Number(price).toFixed(2)}`}
    </button>
  );
}