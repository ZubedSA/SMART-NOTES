import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AllExceptionsFilter } from './all-exceptions.filter';
import * as compression from 'compression';
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

  // Middleware kompresi GZIP untuk speed API yang cepat
  server.use(compression({
    level: 6,
    threshold: 100 // Compress respons di atas 100 bytes
  }));

  // Middleware CORS & Preflight OPTIONS tingkat Express
  server.use((req: any, res: any, next: any) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    next();
  });

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  
  app.useGlobalFilters(new AllExceptionsFilter());

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
