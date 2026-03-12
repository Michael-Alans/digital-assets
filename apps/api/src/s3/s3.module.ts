import { Module, Global } from '@nestjs/common';
import { S3Service } from './s3.service';
import { S3Controller } from './s3.controller'; 
import { UsersModule } from 'src/users/users.module';   



@Global() // Makes S3Service available everywhere without re-importing S3Module
@Module({
  imports: [UsersModule], // 👈 Add this so we can inject UsersService into S3Service
  controllers: [S3Controller],
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}