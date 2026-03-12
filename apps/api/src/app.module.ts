import { ConfigModule } from '@nestjs/config';

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssetsModule } from './assets/assets.module';
import { CreatorModule } from './creator/creator.module';
import { S3Module } from './s3/s3.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { PurchasesModule } from './purchases/purchases.module';


@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AssetsModule, CreatorModule, S3Module, UsersModule, PrismaModule, PurchasesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
