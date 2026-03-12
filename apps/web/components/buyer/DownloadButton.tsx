"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

export function DownloadButton({ assetId }: { assetId: string }) {
  const [isPreparing, setIsPreparing] = useState(false);
  const { getToken } = useAuth();

  const handleDownload = async (e: React.MouseEvent) => {
    // Prevent the click from triggering the parent <Link>
    e.preventDefault();
    e.stopPropagation();
    
    setIsPreparing(true);
    
    try {
      const token = await getToken();
      
      if (!token) {
        toast.error("Please sign in to download");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assets/${assetId}/download`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("You do not have permission to download this asset.");
      }

      if (!response.ok) throw new Error("Failed to generate download link");

      // MATCHING NESTJS RETURN KEY: { url }
      const { url } = await response.json();
      
      if (!url) throw new Error("No download URL returned from server");

      toast.success("Secure link generated!");
      
      // Open in a new tab to trigger the browser's download prompt
      window.open(url, "_blank");
      
    } catch (error: any) {
      console.error("Download failed:", error);
      toast.error(error.message || "Download failed. Please try again.");
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isPreparing}
      className="group relative flex items-center justify-center gap-2 bg-surface border border-border text-text-main font-bold py-2.5 px-5 rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm active:scale-[0.98]"
    >
      <span className="text-sm">
        {isPreparing ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Securing...
          </span>
        ) : "Download"}
      </span>
      {!isPreparing && (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="group-hover:translate-y-0.5 transition-transform"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>
        </svg>
      )}
    </button>
  );
}