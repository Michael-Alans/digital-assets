// apps/api/src/purchases/purchases.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Req, 
  BadRequestException,
  ConflictException 
} from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard'; // Adjust path to your Clerk guard

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  /**
   * PHASE 5: Simulated Claim
   * Uses ClerkAuthGuard to ensure only logged-in users can claim assets.
   */
  @UseGuards(ClerkAuthGuard)
  @Post('claim')
  async claim(@Req() req: any, @Body('assetId') assetId: string) {
    // Clerk usually attaches the user info to req.auth or req.user
    // If using the standard Clerk NestJS integration, it's often req.auth.userId
    const userId = req.auth?.userId || req.user?.id; 

    if (!userId) {
      throw new BadRequestException('User authentication failed. No Clerk ID found.');
    }

    if (!assetId) {
      throw new BadRequestException('Asset ID is required to process the claim.');
    }

    try {
      const purchase = await this.purchasesService.claimAsset(userId, assetId);
      
      return {
        success: true,
        message: 'Asset successfully added to your library',
        data: {
          purchaseId: purchase.id,
          assetId: purchase.assetId,
          claimedAt: purchase.createdAt
        }
      };
    } catch (error) {
      // Prisma Unique Constraint Error (userId + assetId)
      if (error.code === 'P2002') {
        throw new ConflictException('You have already claimed this asset.');
      }
      
      throw error;
    }
  }
}