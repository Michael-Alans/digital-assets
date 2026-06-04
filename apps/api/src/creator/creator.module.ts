import { Module } from "@nestjs/common";
import { CreatorController } from "./creator.controller";   
import { PrismaModule } from "src/prisma/prisma.module";
import { UsersModule } from "../users/users.module"; // 👈 Add this import

/**
 * Represents the Creator module.
 * This module is responsible for handling creator-related operations,
 * including interactions with creator data and user management.
 */
@Module({
  imports: [
    PrismaModule, 
    UsersModule // 👈 Add this so ClerkAuthGuard can find UsersService
  ], 
  controllers: [CreatorController],
})
export class CreatorModule {}