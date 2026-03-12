import { IsString, IsNotEmpty, IsNumber, IsPositive, Min, IsObject, ValidateNested, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

class FileUploadDto {
  @IsString() @IsNotEmpty() bucket: string;
  @IsString() @IsNotEmpty() s3Key: string;
  @IsString() @IsNotEmpty() contentType: string;
  @IsNumber() @IsPositive() size: number;
}

export class CreateAssetDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() description: string;
  
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive() @Min(0.01)
  price: number;

  @IsObject()
  @ValidateNested()
  @Type(() => FileUploadDto)
  previewFile: FileUploadDto;

  @IsObject()
  @ValidateNested()
  @Type(() => FileUploadDto)
  zipFile: FileUploadDto;
}

export class UpdateAssetDto {
  @IsString() @IsNotEmpty() @MinLength(3)
  title: string;

  @IsString() @IsNotEmpty() @MinLength(10)
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive() @Min(0.01)
  price: number;

  @IsObject()
  @ValidateNested()
  @Type(() => FileUploadDto)
  previewFile: FileUploadDto;

  @IsObject()
  @ValidateNested()
  @Type(() => FileUploadDto)
  zipFile: FileUploadDto;
}