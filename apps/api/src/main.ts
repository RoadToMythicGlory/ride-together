import 'reflect-metadata';
import { config as loadDotenv } from 'dotenv';
import { resolve } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { loadEnv } from '@ride-together/config';
import { AppModule } from './app.module';

loadDotenv({ path: resolve(__dirname, '../../../.env') });

async function bootstrap() {
  const env = loadEnv();
  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(helmet());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(env.API_PORT);
  console.log(`[api] listening on :${env.API_PORT}`);
}

bootstrap();
