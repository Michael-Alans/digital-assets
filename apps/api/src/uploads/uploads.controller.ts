import { FileKind, Role } from "@design-assets/db";
import { BadRequestException, Body, Controller, ForbiddenException, Post, Req, UseGuards } from "@nestjs/common";
import { ClerkAuthGuard } from "src/auth/guards/clerk-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/roles.decorator";
import { PrismaService } from "src/prisma/prisma.service";
import { S3Service } from "src/s3/s3.service";

@Controller('uploads')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class UploadsController {
  constructor(private s3: S3Service, private prisma: PrismaService) {}

  @Post('zip-url')
  @Roles(Role.CREATOR)
  async getZipUploadUrl(@Body() body: { assetId: string; contentType: string }, @Req() req) {
    // 1. Verify ownership
    const asset = await this.prisma.asset.findUnique({ where: { id: body.assetId } });
    if (asset?.creatorProfileId !== req.user.creatorProfile.id) throw new ForbiddenException();

    if (body.contentType !== 'application/zip') throw new BadRequestException('Only ZIP allowed');

    const key = `private/zips/${body.assetId}/${Date.now()}.zip`;
    const url = await this.s3.getPresignedPutUrl(key, body.contentType, true);
    
    return { url, key };
  }

 @Post('zip-complete')
  async completeZip(@Body() body: { assetId: string; s3Key: string; size: number; bucket: string; contentType: string }) {
    // Find old ZIP to clean up S3
    const oldZip = await this.prisma.assetFile.findFirst({
      where: { assetId: body.assetId, kind: FileKind.ZIP }
    });

    return this.prisma.$transaction(async (tx) => {
      if (oldZip) {
        await tx.assetFile.delete({ where: { id: oldZip.id } });
        // Trigger S3 deletion (async, don't await to keep DB trans fast)
        this.s3.deleteObject(oldZip.s3Key); 
      }

      return tx.assetFile.create({
        data: {
          assetId: body.assetId,
          kind: FileKind.ZIP,
          s3Key: body.s3Key,
          bucket: body.bucket,
          size: body.size,
          contentType: body.contentType
        }
      });
    });
  }
  // PREVIEW URL: Get a public-read link for images/videos
  @Post('preview-url')
  async getPreviewUrl(@Body() body: { assetId: string; contentType: string }, @Req() req) {
    const asset = await this.prisma.asset.findUnique({ where: { id: body.assetId } });
    if (asset?.creatorProfileId !== req.user.creatorProfile.id) throw new ForbiddenException();

    // Key format: public/previews/{assetId}/{timestamp}-{filename}
    const key = `public/previews/${body.assetId}/${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // isPrivate = false (Sets ACL to public-read for browser access)
    const url = await this.s3.getPresignedPutUrl(key, body.contentType, false);
    return { url, key };
  }

  // PREVIEW COMPLETE: Register the new preview in the DB
  @Post('preview-complete')
  async completePreview(@Body() body: { 
    assetId: string; 
    s3Key: string; 
    size: number; 
    bucket: string; 
    contentType: string 
  }) {
    // Multi-preview: We simply create a new record without deleting old ones
    return this.prisma.assetFile.create({
      data: {
        assetId: body.assetId,
        kind: FileKind.PREVIEW,
        s3Key: body.s3Key,
        bucket: body.bucket,
        size: body.size,
        contentType: body.contentType
      }
    });
  }
}