/**
 * Centralized API Endpoints
 * Updated to match user's NestJS Controller paths exactly.
 */
export const ENDPOINTS = {
  // Public
  ASSETS: "/assets",
  ASSET_DETAILS: (id: string) => `/assets/${id}`,

  // Auth & Profile
  AUTH_SYNC: "/auth/sync",
  CREATOR_PROFILE: "/creator-profile", // POST here to upgrade
  CREATOR_ME: "/creator-profile/me",

  // Buyer
  // UPDATED: Matches your @Get('me/library') inside AssetsController
  MY_ASSETS: "/assets/me/library", 
  CLAIM: (id: string) => `/assets/${id}/claim`,
  DOWNLOAD: (id: string) => `/assets/${id}/download`,

  // Uploads (Presigned PUT flow)
  // UPDATED: Matches your UploadsController paths
  PREVIEW_URL: "/uploads/preview-url",
  PREVIEW_COMPLETE: "/uploads/preview-complete",
  ZIP_URL: "/uploads/zip-url",
  ZIP_COMPLETE: "/uploads/zip-complete",
};