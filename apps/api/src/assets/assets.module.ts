// assets/assets.module.ts
import { Module } from "@nestjs/common";
import { AssetsController } from "./assets.controller";
import { AssetsService } from "./assets.service";
import { UsersModule } from "../users/users.module"; // 👈 Add this

@Module({
  imports: [UsersModule], // 👈 Prisma and S3 are @Global, so no need to import them here
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
