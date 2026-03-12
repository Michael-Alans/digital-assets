import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@design-assets/db';
import type { ClerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, @Inject('CLERK_CLIENT') private clerkClient: ClerkClient  ) {}

  async syncUser(clerkUserId: string) {
  return this.prisma.user.upsert({
    where: { clerkUserId },
    update: {}, 
    include: { creatorProfile: true }, // <--- CRITICAL FIX
    create: {
      clerkUserId,
      role: Role.BUYER,
    },
  });
}
  // users.service.ts

async upgradeToCreator(userId: string, clerkId: string) {
  return this.prisma.$transaction(async (tx) => {
    // 1. Update Prisma User Role
    await tx.user.update({
      where: { id: userId },
      data: { role: Role.CREATOR },
    });

    // 2. Update Clerk Metadata
    await this.clerkClient.users.updateUserMetadata(clerkId, {
      publicMetadata: {
        role: 'CREATOR',
      },
    });

    // 3. Use upsert instead of create to avoid Unique Constraint errors
    return tx.creatorProfile.upsert({
      where: { userId },
      update: {}, // If it exists, we don't need to change anything
      create: { userId }, // If it doesn't exist, create it
    });
  });
}
  async getCreatorProfile(userId: string) {
    const profile = await this.prisma.creatorProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        assets: {
          include: { files: true }
        }
      }
    });

    if (!profile) {
      throw new NotFoundException('Creator profile not found. Please onboard first.');
    }

    return profile;
  }
}