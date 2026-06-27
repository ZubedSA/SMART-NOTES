import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();
const logger = new Logger('Bootstrap');
let isInitialized = false;

async function bootstrap() {
  if (isInitialized) return;
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  await app.init();
  isInitialized = true;
  logger.log('🚀 NestJS Serverless Application Initialized');
}

// Mode local development
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const port = process.env.PORT || 3001;
  bootstrap().then(() => {
    server.listen(port, () => {
      logger.log(`🚀 Smart Notes Backend API running locally on port: ${port}`);
    });
  });
}

// Export serverless handler untuk Vercel
export default async (req: any, res: any) => {
  await bootstrap();
  return server(req, res);
};
