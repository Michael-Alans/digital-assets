import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { S3Service } from './s3.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { v4 as uuidv4 } from 'uuid';

@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Get('presigned-url')
  @UseGuards(ClerkAuthGuard)
  async getUploadUrl(
    @Query('fileName') fileName: string,
    @Query('fileType') fileType: string,
    @Req() req: any
  ) {
    // 1. Create a unique path in S3: uploads/user_uuid/file_uuid-name
    // This prevents file name collisions between users
    const fileKey = `uploads/${req.user.id}/${uuidv4()}-${fileName}`;
    
    // 2. Determine if it's private based on your logic
    // Usually, ZIPs are private, images (PREVIEW) can be public-read
    const isPrivate = !fileType.startsWith('image/');

    const url = await this.s3Service.getPresignedPutUrl(fileKey, fileType, isPrivate);

    return {
      url,
      key: fileKey, // The frontend needs this key to save in the Database
    };
  }
}