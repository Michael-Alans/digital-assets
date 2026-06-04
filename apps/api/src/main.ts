import 'dotenv/config'; // 👈 Add this at the very top
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

/**
 * Boots up the NestJS application.
 *
 * This function initializes the NestFactory, configures global pipes (like ValidationPipe),
 * enables CORS for specified origins, and starts the application listening on a port
 * defined by the environment variable `PORT` or defaults to 4000.
 */
async function bootstrap() {
  // Now process.env.DATABASE_URL will be populated
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
  origin: ['http://localhost:3000', 'https://digital-assets-web.vercel.app'], // Use your actual frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
  allowedHeaders: 'Content-Type, Authorization', // Explicitly allow this
});

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();