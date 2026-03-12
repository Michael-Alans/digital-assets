import { Injectable, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import { PrismaClient } from '@design-assets/db';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnApplicationShutdown {
  constructor() {
    // 1. Setup the connection pool
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // 2. Create the Prisma adapter
    const adapter = new PrismaPg(pool);

    // 3. Pass the adapter to the constructor
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onApplicationShutdown() {
    await this.$disconnect();
  }
}
