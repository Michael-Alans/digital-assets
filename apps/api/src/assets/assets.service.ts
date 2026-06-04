/**
 * Service for managing digital assets, including creation, updates, status changes,
 * retrieval for marketplace and creator dashboards, and deletion.
 * It integrates with Clerk for user hydration and Prisma for database operations.
 */
import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssetStatus } from '@design-assets/db';
import { createClerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class AssetsService {
  // Initialize Clerk with your secret key
  private clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

  /**
   * Constructs the AssetsService.
   * @param prisma - The PrismaService for database interactions.
   */
  constructor(private prisma: PrismaService) {}

  /**
   * HELPER: Hydrate Assets with Clerk Data
   * Fetches real names and profile images from Clerk for a list of assets.
   * If a Clerk user cannot be found, the asset is returned without creator details,
   * and an error is logged.
   * @param assets - An array of asset objects, each expected to have a `creatorProfile.user.clerkUserId`.
   * @returns A promise that resolves to an array of assets with added `creator` details (firstName, lastName, imageUrl).
   */
  private async hydrateAssets(assets: any[]) {
    return Promise.all(
      assets.map(async (asset) => {
        try {
          // Use the clerkUserId stored in our DB to fetch the full Clerk User object
          const clerkUser = await this.clerk.users.getUser(
            asset.creatorProfile.user.clerkUserId
          );
          
          return {
            ...asset,
            creator: {
              firstName: clerkUser.firstName || "Creator",
              lastName: clerkUser.lastName || "",
              imageUrl: clerkUser.imageUrl,
            },
          };
        }catch (e: any) {
        // Log the error to see if Clerk is failing
        console.error("Clerk Hydration Failed:", e.message);
        return asset; // Returns the asset without the 'creator' field
      }
      })
    );
  }

  /**
   * CREATE: Launches a new asset.
   * Verifies the existence of the creator profile before creating the asset.
   * @param userId - The ID of the user creating the asset.
   * @param dto - The data transfer object containing asset details like title, description, price, status, and files.
   * @returns A promise that resolves to the newly created asset, including its files.
   * @throws {ForbiddenException} If the creator profile for the given userId is not found.
   */
  async create(userId: string, dto: any) {
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { userId },
    });

    if (!creator) {
      throw new ForbiddenException(
        'Account not found. Please complete creator onboarding.'
      );
    }

    return this.prisma.asset.create({
      data: {
        title: dto.title,
        description: dto.description,
        price: dto.price,
        status: dto.status || 'DRAFT',
        creatorProfileId: creator.id,
        files: {
          create: dto.files.map((file: any) => ({
            kind: file.kind,
            bucket: file.bucket,
            s3Key: file.s3Key,
            contentType: file.contentType,
            size: file.size,
          })),
        },
      },
      include: { files: true },
    });
  }

  /**
   * UPDATE: Modifies existing asset details or files.
   * Verifies that the requesting user owns the asset before allowing an update.
   * If `files` are provided in the data, all existing files for the asset will be deleted
   * and replaced with the new ones.
   * @param id - The ID of the asset to update.
   * @param data - The data object containing fields to update, potentially including `files`.
   * @param creatorId - The ID of the creator profile attempting to update the asset.
   * @returns A promise that resolves to the updated asset.
   * @throws {ForbiddenException} If the asset is not found or the requesting creator does not own the asset.
   */
  async update(id: string, data: any, creatorId: string) {
    const { files, ...details } = data;

    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset || asset.creatorProfileId !== creatorId) {
      throw new ForbiddenException('You do not own this asset');
    }

    return this.prisma.asset.update({
      where: { id },
      data: {
        ...details,
        files: files?.length > 0 ? {
          deleteMany: {},
          create: files,
        } : undefined,
      },
    });
  }

  /**
   * SET STATUS: Toggles an asset's status between PUBLISHED and DRAFT.
   * Ensures the asset exists and the requesting user is its owner.
   * @param id - The ID of the asset to update.
   * @param creatorProfileId - The ID of the creator profile attempting to change the asset's status.
   * @param status - The new status to set for the asset (e.g., `AssetStatus.PUBLISHED` or `AssetStatus.DRAFT`).
   * @returns A promise that resolves to the asset with its new status, including its files.
   * @throws {NotFoundException} If the asset with the given ID is not found.
   * @throws {ForbiddenException} If the requesting creator does not have permission to modify this asset.
   */
  async setStatus(id: string, creatorProfileId: string, status: AssetStatus) {
    // 1. Find the asset and verify ownership
    const asset = await this.prisma.asset.findUnique({ 
      where: { id } 
    });
    
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    if (asset.creatorProfileId !== creatorProfileId) {
      throw new ForbiddenException('You do not have permission to modify this asset');
    }

    // 2. Update the status
    return this.prisma.asset.update({
      where: { id },
      data: { status },
      include: { files: true } // Including files helps the frontend update the UI immediately
    });
  }

  /**
   * MARKETPLACE: Finds all published assets that match optional search and tag filters.
   * The results are hydrated with Clerk user data to include creator's first name, last name, and image URL.
   * @param query - An object that may contain `search` (string for title/description) and `tag` (string for tag name) properties.
   * @returns A promise that resolves to an array of hydrated, published assets.
   */
  async findPublished(query: { search?: string; tag?: string }) {
    const assets = await this.prisma.asset.findMany({
      where: {
        status: AssetStatus.PUBLISHED,
        AND: [
          query.search ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } }
            ]
          } : {},
          query.tag ? {
            tags: { some: { tag: { name: query.tag } } }
          } : {}
        ]
      },
      include: {
        files: true,
        tags: { include: { tag: true } },
        creatorProfile: { include: { user: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return this.hydrateAssets(assets);
  }

  /**
   * PUBLIC SINGLE VIEW: Retrieves details for a single published asset.
   * Includes files, tags, creator profile, and user details.
   * Optionally checks if the asset is owned by the `internalUserId` if provided.
   * The asset's creator details are hydrated using Clerk.
   * @param id - The ID of the asset to retrieve.
   * @param internalUserId - Optional. The internal ID of the currently logged-in user to check for ownership.
   * @returns A promise that resolves to the hydrated asset object, including an `isOwned` boolean.
   * @throws {NotFoundException} If the asset with the given ID is not found or is not published.
   */
  async findOnePublic(id: string, internalUserId?: string) {
    const asset = await this.prisma.asset.findFirst({

      
      where: { id, status: 'PUBLISHED' },
      include: {
        files: true,
        tags: { include: { tag: true } },
        creatorProfile: { include: { user: true } },
      },
    });

    if (!asset) throw new NotFoundException('Asset not found');

  // DEBUG 1: Check if the DB has the Clerk ID
  console.log('Clerk ID from DB:', asset.creatorProfile?.user?.clerkUserId);

  const [hydrated] = await this.hydrateAssets([asset]);

  // DEBUG 2: Check if hydration worked
  console.log('Hydrated Creator:', hydrated.creator);

    let isOwned = false;
    if (internalUserId) {
      const ownership = await this.prisma.ownership.findUnique({
        where: {
          userId_assetId: {
            userId: internalUserId,
            assetId: id,
          },
        },
      });
      isOwned = !!ownership;
    }

    return { ...hydrated, isOwned };
  }

  /**
   * DASHBOARD: Finds all assets belonging to a specific creator.
   * Includes files and a count of claims for each asset.
   * @param userId - The ID of the user (creator) whose assets are to be retrieved.
   * @returns A promise that resolves to an array of assets owned by the specified creator.
   */
  async findAllByCreator(userId: string) {
    return this.prisma.asset.findMany({
      where: {
        creatorProfile: { userId },
      },
      include: {
        files: true,
        _count: { select: { claims: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * DELETE: Removes an asset from the database.
   * Performs checks to ensure the asset exists, is owned by the requesting creator,
   * and has not been purchased by any users. All associated relations (tags, ownerships, claims, download logs, files)
   * are also deleted within a transaction.
   * @param id - The ID of the asset to remove.
   * @param creatorProfileId - The ID of the creator profile attempting to delete the asset.
   * @returns A promise that resolves to the deleted asset object.
   * @throws {NotFoundException} If the asset with the given ID is not found.
   * @throws {ForbiddenException} If the requesting creator does not own the asset.
   * @throws {BadRequestException} If the asset has been purchased (i.e., has associated ownerships).
   */
  async remove(id: string, creatorProfileId: string) {
  const asset = await this.prisma.asset.findUnique({
    where: { id },
    include: { _count: { select: { ownerships: true } } }
  });

  if (!asset) throw new NotFoundException('Asset not found');
  if (asset.creatorProfileId !== creatorProfileId) {
    throw new ForbiddenException('Not your asset');
  }

  // Still keeping the safety check unless you want to delete sold items
  if (asset._count.ownerships > 0) {
    throw new BadRequestException('Cannot delete an asset that has been purchased.');
  }

  return this.prisma.$transaction(async (tx) => {
    // 1. Delete relations without Cascade Delete
    await tx.assetTag.deleteMany({ where: { assetId: id } });
    await tx.ownership.deleteMany({ where: { assetId: id } });
    await tx.claim.deleteMany({ where: { assetId: id } });
    await tx.downloadLog.deleteMany({ where: { assetId: id } });

    // 2. AssetFile has onDelete: Cascade, so it will be removed automatically
    // when we delete the asset, but we can do it explicitly if preferred:
    await tx.assetFile.deleteMany({ where: { assetId: id } });

    // 3. Delete the actual asset
    return tx.asset.delete({ where: { id } });
  });
}
}