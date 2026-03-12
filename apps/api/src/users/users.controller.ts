import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { ClerkAuthGuard } from 'src/auth/guards/clerk-auth.guard';

@Controller('users')
@UseGuards(ClerkAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users/me
   * Returns the current authenticated user's DB record (synced via Guard)
   */
  @Get('me')
  async getMe(@Request() req) {
    // req.user is populated by your ClerkAuthGuard syncUser call
    return req.user;
  }

  /**
   * POST /users/promote-to-creator
   * Upgrades role to CREATOR and initializes CreatorProfile in a transaction
   */
 // src/creator/creator.controller.ts

@Post('promote-to-creator')
async promote(@Request() req) {
  // 1. Get the internal DB ID (e.g., from Prisma)
  const userId = req.user.id; 
  
  // 2. Get the Clerk ID (e.g., user_2N9...)
  // Note: Depending on your AuthGuard, this might be req.user.clerkId or req.user.sub
  const clerkId = req.user.externalId || req.user.sub;

  return this.usersService.upgradeToCreator(userId, clerkId);
}

  /**
   * GET /users/creator-profile
   * Returns full creator details, including assets and files
   */
  @Get('creator-profile')
  async getMyProfile(@Request() req) {
    return this.usersService.getCreatorProfile(req.user.id);
  }
}