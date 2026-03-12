// apps/web/lib/hooks/useAsset.ts
import useSWR from 'swr';
import { useAuth } from "@clerk/nextjs"; 
import { apiFetch } from '@app/lib/api/client';
import { ENDPOINTS } from '@app/lib/api/endpoints';
import { Asset } from '@app/lib/api/types';

export function useAsset(assetId: string | null) {
  const { getToken, isLoaded } = useAuth();

  // We define a local fetcher that wraps your apiFetch
  const fetcher = async (url: string) => {
    // Grab the token from Clerk (Client-side)
    const token = await getToken();
    
    // Pass it into your existing apiFetch via headers
    return apiFetch<Asset>(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  };

  const { data, error, isLoading, mutate } = useSWR<Asset>(
    // Don't fetch until Clerk is ready and we have an ID
    isLoaded && assetId ? ENDPOINTS.ASSET_DETAILS(assetId) : null,
    fetcher
  );

  return {
    asset: data,
    isLoading: !isLoaded || isLoading,
    isError: error,
    mutate
  };
}