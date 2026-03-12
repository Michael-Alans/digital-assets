// users/users.module.ts
import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from './users.controller';
import { createClerkClient } from '@clerk/clerk-sdk-node';

@Module({
  controllers: [UsersController],
  providers: [UsersService,
    {
      provide: 'CLERK_CLIENT', // Use a string token
      useFactory: () => {
        return createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
      },
    },
  ],
  exports: [UsersService], // 👈 Crucial for the Guard to work elsewhere
})
export class UsersModule {}
