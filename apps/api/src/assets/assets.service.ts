import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssetStatus } from '@design-assets/db';
import { createClerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class AssetsService {
  // Initialize Clerk with your secret key
  private clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

  constructor(private prisma: PrismaService) {}

  /**
   * HELPER: Hydrate Assets with Clerk Data
   * Fetches real names and profile images from Clerk for a list of assets.
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
        }catch (e) {
        // Log the error to see if Clerk is failing
        console.error("Clerk Hydration Failed:", e.message);
        return asset; // Returns the asset without the 'creator' field
      }
      })
    );
  }

  /**
   * CREATE: Launch a new asset
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
   * UPDATE: Modify asset details or files
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
   * SET STATUS: Toggle between PUBLISHED and DRAFT
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
   * MARKETPLACE: Find all published assets with Search/Filter (HYDRATED)
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
   * PUBLIC SINGLE VIEW: Get details for one asset
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
   * DASHBOARD: Find all assets belonging to a specific creator
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
   * DELETE: Remove asset
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