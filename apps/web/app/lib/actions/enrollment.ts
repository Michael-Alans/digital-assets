"use server";

import { auth } from "@clerk/nextjs/server";
import { apiFetch } from "../api/client";
import { ENDPOINTS } from "@app/lib/api/endpoints";
import { revalidatePath } from "next/cache";

export async function getMyAssets() {
  const { userId } = await auth(); 
  if (!userId) throw new Error("Unauthorized");

  return await apiFetch(ENDPOINTS.MY_ASSETS);
}

export async function claimAsset(assetId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Using the CLAIM function from your endpoints constant
  const response = await apiFetch(ENDPOINTS.CLAIM(assetId), {
    method: "POST",
    // body is usually not needed if the ID is in the URL, 
    // but keep it if your backend expects it:
    body: JSON.stringify({ assetId }),
  });

  revalidatePath("/buyer/my-assets");
  return response;
}