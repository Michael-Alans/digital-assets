import useSWR from 'swr';
import { apiFetch } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

// Define the shape based on your NestJS Asset entity
export interface CreatorAsset {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED';
  price: number;
  createdAt: string;
  // Add other fields from your Prisma schema as needed
}

// Define the shape based on your UsersService.getCreatorProfile return
export interface CreatorProfile {
  id: string;
  bio?: string;
  userId: string;
  assets: CreatorAsset[]; // This is what was missing
}

export function useCreatorProfileMe() {
  // Pass the interface to useSWR for type safety
  const { data, error, isLoading, mutate } = useSWR<CreatorProfile>(
    ENDPOINTS.CREATOR_ME,
    apiFetch
  );

  return {
    profile: data,
    isLoading,
    isError: error,
    mutate
  };
}