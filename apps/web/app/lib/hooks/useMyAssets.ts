import useSWR from 'swr';
import { apiFetch } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export function useMyAssets() {
  const { data, error, isLoading, mutate } = useSWR(
    ENDPOINTS.MY_ASSETS, 
    apiFetch
  );

  return {
    ownedAssets: data || [],
    isLoading,
    isError: error,
    mutate
  };
}