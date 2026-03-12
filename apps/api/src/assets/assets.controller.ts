import { 
  Controller, 
  Post, 
  Get, 
  Param, 
  Req, 
  UseGuards,
  NotFoundException,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  ForbiddenException,
  Request,
  Body,
  BadRequestException,
  Patch
} from '@nestjs/common';
import { ClerkAuthGuard } from 'src/auth/guards/clerk-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { Role, AssetStatus } from '@design-assets/db';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { S3Service } from 'src/s3/s3.service';
import { AssetsService } from './assets.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('assets')
export class AssetsController {
  
  constructor(
    private readonly prisma: PrismaService,
    private readonly assetsService: AssetsService,
    private readonly s3: S3Service
  ) {}


 // apps/api/src/assets/assets.controller.ts

@Post()
@UseGuards(ClerkAuthGuard, RolesGuard)
@Roles(Role.CREATOR)
async create(@Body() dto: any, @Req() req) {
  // req.user.id should be the internal DB id from your Clerk sync
  return this.assetsService.create(req.user.id, dto);
}
  // apps/api/src/assets/assets.controller.ts

// apps/api/src/assets/assets.controller.ts

@Post(':id/claim')
@UseGuards(ClerkAuthGuard)
async claim(@Param('id') assetId: string, @Req() req) {
  const userId = req.user.id;

  // 1. Manually check for existing ownership to prevent P2002 crash
  const existing = await this.prisma.ownership.findUnique({
    where: { userId_assetId: { userId, assetId } }
  });

  if (existing) {
    // This allows the frontend to see res.status === 400
    throw new BadRequestException('You already own this asset');
  }

  // 2. Continue with the claim logic...
  const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) throw new NotFoundException('Asset not found');

  return this.prisma.$transaction(async (tx) => {
    await tx.ownership.create({ data: { userId, assetId } });
    
    return tx.claim.create({
      data: { 
        userId, 
        assetId,
        amount: Number(asset.price)
      }
    });
  });
}
  @Get('me/library')
  @UseGuards(ClerkAuthGuard)
  async getLibrary(@Req() req) {
    console.log('User from Request:', req.user); // If this is undefined, the Guard is failing.
    return this.prisma.asset.findMany({
      where: { 
        ownerships: { 
          some: { userId: req.user.id } 
        } 
      },
      include: {
        // Fix: Changed 'creator' to 'creatorProfile' to match your schema
        creatorProfile: {
          include: {
            user: true // Includes user details (like name/email) if needed
          }
        },
        files: true // Includes the ZIP/Preview info for the library
      }
    });
  }

  // PUBLIC: Browse all published assets
  @Get()
  async findAll(@Query('search') search?: string, @Query('tag') tag?: string) {
    return this.assetsService.findPublished({ search, tag });
  }

 // apps/api/src/assets/assets.controller.ts

// apps/api/src/assets/assets.controller.ts

@Get(':id')
@Public()
@UseGuards(ClerkAuthGuard) 
async findOne(@Param('id') id: string, @Req() req) {
  // We call findOnePublic because it includes:
  // 1. Clerk Hydration (Real names/images)
  // 2. Ownership check (isOwned status)
  // 3. Proper Includes (files, tags, creatorProfile)
  return this.assetsService.findOnePublic(id, req.user?.id);
}

  // PROTECTED: Publish
  @Post(':id/publish')
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles(Role.CREATOR)
  async publish(@Param('id') id: string, @Req() req) {
    // Note: req.user.creatorProfile.id comes from your User sync logic
    return this.assetsService.setStatus(id, req.user.creatorProfile.id, AssetStatus.PUBLISHED);
  }

  // PROTECTED: Unpublish
  @Post(':id/unpublish')
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles(Role.CREATOR)
  async unpublish(@Param('id') id: string, @Req() req) {
    return this.assetsService.setStatus(id, req.user.creatorProfile.id, AssetStatus.DRAFT);
  }

  // PROTECTED: Delete
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles(Role.CREATOR)
  async remove(@Param('id') id: string, @Req() req) {
    return this.assetsService.remove(id, req.user.creatorProfile.id);
  }

  @Patch(':id')
@UseGuards(ClerkAuthGuard, RolesGuard)
@Roles(Role.CREATOR)
async update(
  @Param('id') id: string, 
  @Body() updateAssetDto: any, 
  @Req() req
) {
  // 1. Defensively check for the profile
  const creatorProfileId = req.user?.creatorProfile?.id;

  if (!creatorProfileId) {
    throw new ForbiddenException(
      'You must complete creator onboarding before managing assets.'
    );
  }

  // 2. Pass the ID to the service
  return this.assetsService.update(id, updateAssetDto, creatorProfileId);
}
  @Post(':id/download')
@UseGuards(ClerkAuthGuard)
async getDownloadUrl(@Param('id') assetId: string, @Req() req) {
  // 1. Verify Ownership
  const ownership = await this.prisma.ownership.findUnique({
    where: { userId_assetId: { userId: req.user.id, assetId } }
  });
  if (!ownership) throw new ForbiddenException('Purchase required');

  // 2. Get the ZIP file record
  const zipFile = await this.prisma.assetFile.findFirst({
    where: { assetId, kind: 'ZIP' }
  });
  if (!zipFile) throw new NotFoundException('File not found');

  // 3. Log the download
  await this.prisma.downloadLog.create({
    data: { 
      userId: req.user.id, 
      assetId, 
      ipAddress: req.ip 
    }
  });

  // 4. Return the presigned GET URL
  const url = await this.s3.getPresignedGetUrl(zipFile.s3Key);
  return { url };
}

// apps/api/src/assets/assets.controller.ts

@Get('creator/me')
@UseGuards(ClerkAuthGuard)
async getMyAssets(@Request() req) {
  // req.user.id is the internal UUID from your Prisma User table
  return this.assetsService.findAllByCreator(req.user.id);
}

}