import { Injectable, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import { PrismaClient } from '@design-assets/db';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnApplicationShutdown {
  constructor() {
    // Pass the connection string directly to PrismaPg
    // This avoids the 'Pool' type conflict entirely
    const adapter = new PrismaPg({ 
      connectionString: process.env.DATABASE_URL 
    });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onApplicationShutdown() {
    await this.$disconnect();
  }
}