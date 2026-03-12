import { Controller, Post, Get, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@design-assets/db';
import { UsersService } from '../users/users.service';

@Controller('creator-profile')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class CreatorController {
  constructor(private usersService: UsersService) {}

  // src/creator/creator.controller.ts

// src/creator/creator.controller.ts

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
  @Get('me')
  @Roles(Role.CREATOR) // Only established creators should access this
  async getMyProfile(@Req() req) {
    return this.usersService.getCreatorProfile(req.user.id);
  }
}