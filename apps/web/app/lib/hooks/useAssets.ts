import useSWR from 'swr';
import { apiFetch } from '@app/lib/api/client';
import { ENDPOINTS } from '@app/lib/api/endpoints';
import { Asset } from '@app/lib/api/types'; // Import your interface

interface AssetFilters {
  q?: string;
  tag?: string;
}

export function useAssets(filters: AssetFilters = {}) {
  const query = new URLSearchParams();
  if (filters.q) query.append('search', filters.q);
  if (filters.tag) query.append('tag', filters.tag);

  const queryString = query.toString();
  const url = queryString ? `${ENDPOINTS.ASSETS}?${queryString}` : ENDPOINTS.ASSETS;

  /**
   * FIX: Added <Asset[]> Generic.
   * This tells SWR that 'data' is an array of Assets.
   */
  const { data, error, isLoading, mutate } = useSWR<Asset[]>(url, apiFetch);

  return {
    // Now TypeScript knows 'assets' is an Asset[] because data is an Asset[]
    assets: data || [],
    isLoading,
    isError: error,
    mutate
  };
}