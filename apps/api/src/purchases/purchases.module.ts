import { PurchasesController } from "./purchases.controller";
import { PurchasesService } from "./purchases.service";
import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module"; 
import { UsersModule } from "src/users/users.module";

@Module({
  imports: [PrismaModule, UsersModule], // Import PrismaModule to use PrismaService
  controllers: [PurchasesController],   
    providers: [PurchasesService],         // Provide PurchasesService for dependency injection 
})
export class PurchasesModule {}