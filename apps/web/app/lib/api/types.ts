/**
 * Global API Type Definitions
 * Matches NestJS AssetController and Prisma Schema
 */

export type AssetStatus = 'DRAFT' | 'PUBLISHED';
export type FileKind = 'PREVIEW' | 'ZIP';

export interface AssetFile {
  id: string;
  assetId: string;
  kind: FileKind;
  s3Key: string;
  bucket: string;
  size: number;
  contentType: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  role: 'BUYER' | 'CREATOR';
}

export interface CreatorProfile {
  id: string;
  bio?: string;
  userId: string;
  user?: User;
  assets?: Asset[];
}


export interface Asset {
  id: string;
  title: string;
  description: string;
  price: number;
  status: AssetStatus;
  creatorProfileId: string;
  creatorProfile?: CreatorProfile;
  isOwned?: boolean;
  files: AssetFile[];
  createdAt: string;
  updatedAt: string;
  creator?: {
    firstName: string;
    lastName: string;
    imageUrl: string | null;
  };
}

export interface Ownership {
  id: string;
  userId: string;
  assetId: string;
  asset?: Asset;
  createdAt: string;
}

export interface DownloadResponse {
  url: string;
}

export interface AuthSyncResponse {
  id: string;
  email: string;
  role: string;
}

