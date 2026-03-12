"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiFetch } from "../../app/lib/api/client";
import { ENDPOINTS } from "../../app/lib/api/endpoints";

/**
 * AuthSync Component [cite: 28]
 * Effect: Ensures User exists in DB, default role BUYER[cite: 81].
 * Calls POST /auth/sync once after login[cite: 28, 79].
 */
export function AuthSync() {
  const { isSignedIn, getToken } = useAuth();
  const synced = useRef(false);

  useEffect(() => {
    async function syncUser() {
      if (isSignedIn && !synced.current) {
        try {
          const token = await getToken();
          await apiFetch(ENDPOINTS.AUTH_SYNC, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          synced.current = true;
          console.log("Auth sync complete.");
        } catch (error) {
          console.error("Auth sync failed:", error);
        }
      }
    }

    syncUser();
  }, [isSignedIn, getToken]);

  return null; // Invisible utility component [cite: 28]
}