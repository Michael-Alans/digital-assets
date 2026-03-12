import { useCreatorProfileMe } from './useCreatorProfileMe';

/**
 * Leverages the Creator Profile hook.
 * TypeScript now recognizes profile.assets because of the CreatorProfile interface.
 */
export function useCreatorAssets() {
  const { profile, isLoading, isError, mutate } = useCreatorProfileMe();

  return {
    assets: profile?.assets || [],
    isLoading,
    isError,
    mutate
  };
}