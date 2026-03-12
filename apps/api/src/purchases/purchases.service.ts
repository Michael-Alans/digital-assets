// apps/api/src/purchases/purchases.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PurchasesService {
  constructor(private prisma: PrismaService) {}

  async claimAsset(idFromAuth: string, assetId: string) {
    // Debugging logs to your NestJS terminal
    console.log('--- Claim Debug ---');
    console.log('ID received from Controller (idFromAuth):', idFromAuth);
    console.log('Asset ID received:', assetId);

    // 1. Get the internal DB user ID using the clerkUserId
    const user = await this.prisma.user.findUnique({
    where: { id: idFromAuth }, // Changed from clerkUserId to id
  });

  if (!user) {
    throw new BadRequestException(`User with ID ${idFromAuth} not found.`);
  }
    console.log('User search result:', user ? 'User Found' : 'User NOT Found');

    if (!user) {
      // Improved error message to see the mismatch in your browser console
      throw new BadRequestException(`User with clerkUserId "${idFromAuth}" not found in database.`);
    }

    // 2. Check if they already own it
    const existing = await this.prisma.ownership.findUnique({
      where: {
        userId_assetId: { 
          userId: user.id, 
          assetId 
        },
      },
    });

    if (existing) {
      throw new BadRequestException('You already own this asset.');
    }

    // 3. Use a Transaction to create the Claim and the Ownership at once
    return this.prisma.$transaction(async (tx) => {
      const claim = await tx.claim.create({
        data: {
          userId: user.id,
          assetId,
          amount: 0, 
        },
      });

      await tx.ownership.create({
        data: {
          userId: user.id,
          assetId,
        },
      });

      return claim;
    });
  }
}