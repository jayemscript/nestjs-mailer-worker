import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // ─── Trust Proxy ───────────────────────────────────────────────────────────
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);
  expressApp.disable('x-powered-by');

  // ─── Global Prefix ─────────────────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ─── CORS ──────────────────────────────────────────────────────────────────
  const allowedOrigins = configService.get<string[]>('cors.origins') ?? [];
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-KEY'],
    credentials: true,
  });

  // ─── Middlewares ───────────────────────────────────────────────────────────
  const cookieSecret = configService.get<string>('cookie.secret') ?? 'changeme';
  app.use(cookieParser(cookieSecret));

  // ─── Validation ────────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ─── Start ─────────────────────────────────────────────────────────────────
  const port = configService.get<number>('port') ?? 4001;
  const nodeEnv = configService.get<string>('nodeEnv');

  await app.listen(port);

  console.log(
    `[nestjs-mailer-worker] running on port ${port} | mode: ${nodeEnv}`,
  );
  console.log(`Health: http://localhost:${port}/api`);
}

bootstrap();
