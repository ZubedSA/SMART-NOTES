import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

const server = express();
const logger = new Logger('Bootstrap');

export const createServer = async (expressInstance: any) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );
  
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
  return app;
};

// Mode local development (jika dijalankan langsung lewat node/ts-node)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const port = process.env.PORT || 3001;
  createServer(server).then(() => {
    server.listen(port, () => {
      logger.log(`🚀 Smart Notes Backend API running locally on port: ${port}`);
    });
  });
}

// Handler untuk Vercel Serverless Function
export default async (req: any, res: any) => {
  await createServer(server);
  return server(req, res);
};
