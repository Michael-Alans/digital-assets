import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName = process.env.AWS_S3_BUCKET;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  // Phase 4: Generate PUT URL for Browser Uploads
  async getPresignedPutUrl(key: string, contentType: string, isPrivate: boolean) {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
        // Enforce Phase 4 ACL requirements strictly
        ACL: isPrivate ? 'private' : 'public-read', 
      });

      // URL expires in 5 minutes (standard for uploads)
      return await getSignedUrl(this.s3Client, command, { expiresIn: 300 });
    } catch (error) {
      throw new InternalServerErrorException('Could not generate upload URL');
    }
  }

  // Phase 4: Generate GET URL for Buyer Downloads
  async getPresignedGetUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    // Short expiry (60s) for security during downloads
    return await getSignedUrl(this.s3Client, command, { expiresIn: 60 });
  }

  async deleteObject(key: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    await this.s3Client.send(command);
  } catch (error) {
    // "Best-effort": we log the error but don't fail the request
    console.error(`S3 Cleanup Failed for key: ${key}`, error);
  }
}
}