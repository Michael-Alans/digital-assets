import { IsString, IsNotEmpty, IsNumber, IsPositive, Min, IsObject, ValidateNested, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for representing file upload details.
 * Contains metadata about a file stored in an S3 bucket.
 */
class FileUploadDto {
  /**
   * The name of the S3 bucket where the file is stored.
   */
  @IsString() @IsNotEmpty() bucket: string;
  /**
   * The S3 key (path) to the file within the bucket.
   */
  @IsString() @IsNotEmpty() s3Key: string;
  /**
   * The content type (MIME type) of the file, e.g., 'image/jpeg', 'application/zip'.
   */
  @IsString() @IsNotEmpty() contentType: string;
  /**
   * The size of the file in bytes. Must be a positive number.
   */
  @IsNumber() @IsPositive() size: number;
}

/**
 * DTO for creating a new asset.
 * Includes details about the asset's title, description, price, and associated files.
 */
export class CreateAssetDto {
  /**
   * The title of the asset. Must be a non-empty string.
   */
  @IsString() @IsNotEmpty() title: string;
  /**
   * A detailed description of the asset. Must be a non-empty string.
   */
  @IsString() @IsNotEmpty() description: string;

  /**
   * The price of the asset. Must be a positive number with at most two decimal places, minimum 0.01.
   */
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive() @Min(0.01)
  price: number;

  /**
   * Details about the asset's preview file (e.g., a thumbnail image or video preview).
   */
  @IsObject()
  @ValidateNested()
  @Type(() => FileUploadDto)
  previewFile: FileUploadDto;

  /**
   * Details about the asset's main zip file containing the actual asset content.
   */
  @IsObject()
  @ValidateNested()
  @Type(() => FileUploadDto)
  zipFile: FileUploadDto;
}

/**
 * DTO for updating an existing asset.
 * Allows modification of the asset's title, description, price, and associated files.
 */
export class UpdateAssetDto {
  /**
   * The updated title of the asset. Must be a non-empty string with a minimum length of 3 characters.
   */
  @IsString() @IsNotEmpty() @MinLength(3)
  title: string;

  /**
   * The updated description of the asset. Must be a non-empty string with a minimum length of 10 characters.
   */
  @IsString() @IsNotEmpty() @MinLength(10)
  description: string;

  /**
   * The updated price of the asset. Must be a positive number with at most two decimal places, minimum 0.01.
   */
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive() @Min(0.01)
  price: number;

  /**
   * The updated details about the asset's preview file.
   */
  @IsObject()
  @ValidateNested()
  @Type(() => FileUploadDto)
  previewFile: FileUploadDto;

  /**
   * The updated details about the asset's main zip file.
   */
  @IsObject()
  @ValidateNested()
  @Type(() => FileUploadDto)
  zipFile: FileUploadDto;
}