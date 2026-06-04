import { Controller, Post, Get, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@design-assets/db';
import { UsersService } from '../users/users.service';

/**
 * Controller for managing creator profiles.
 * This controller handles operations related to upgrading a user to a creator and fetching creator-specific profiles.
 */
@Controller('creator-profile')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class CreatorController {
  constructor(private usersService: UsersService) {}

  // src/creator/creator.controller.ts

// src/creator/creator.controller.ts

/**
 * Creates or upgrades a user's profile to a creator profile.
 * Requires the user to have a BUYER role initially.
 *
 * @param req The incoming request object, containing user information from Clerk.
 * @returns A promise that resolves to the updated user profile, now with CREATOR role.
 * @throws BadRequestException If the Clerk User ID is missing from the request context.
 */
@Post()
@Roles(Role.BUYER)
async createProfile(@Req() req) {
  const userId = req.user?.id;
  const clerkId = req.user?.sub || req.user?.clerkUserId;

  if (!clerkId) {
    throw new BadRequestException("Clerk User ID (sub) missing from request context");
  }

  console.log('--- Controller Hand-off ---');
  console.log('Internal ID:', userId);
  console.log('Clerk ID:', clerkId);

  return this.usersService.upgradeToCreator(userId, clerkId);
}
  /**
   * Retrieves the profile of the currently authenticated creator.
   * This endpoint is only accessible to users with the CREATOR role.
   *
   * @param req The incoming request object, containing user information.
   * @returns A promise that resolves to the creator's profile data.
   */
  @Get('me')
  @Roles(Role.CREATOR) // Only established creators should access this
  async getMyProfile(@Req() req) {
    return this.usersService.getCreatorProfile(req.user.id);
  }
}