import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AllExceptionsFilter } from './all-exceptions.filter';
import express = require('express');
import dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // ignore
}

const server = express();
const logger = new Logger('Bootstrap');
let isInitialized = false;

async function bootstrap() {
  if (isInitialized) return;
  
  // Sajikan static folder untuk unggahan media lokal
  const path = require('path');
  server.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  
  app.useGlobalFilters(new AllExceptionsFilter());

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
