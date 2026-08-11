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
  // Passenger mounts at /api (BaseURI). In that mode Nest must not also prefix /api.
  const prefix =
    process.env.API_GLOBAL_PREFIX ??
    (process.env.PASSENGER_BASE_URI || process.env.PASSENGER_APP_ENV ? '' : 'api');
  if (prefix) {
    app.setGlobalPrefix(prefix);
  }
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const port = Number(process.env.PORT || env.API_PORT);
  // Bind loopback on shared hosting; Passenger proxies locally.
  const host = process.env.API_HOST || '127.0.0.1';
  await app.listen(port, host);
  console.log(`[api] listening on ${host}:${port} prefix=${prefix || '(none)'}`);
}

bootstrap();
