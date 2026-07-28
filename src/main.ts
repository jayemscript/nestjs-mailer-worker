import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { setServers } from 'node:dns';
import cookieParser from 'cookie-parser';
import { Request, Response } from 'express';
import { AppModule } from './app.module';

let serverlessApp: Promise<INestApplication> | undefined;

async function createApplication(): Promise<INestApplication> {
  const dnsServers = process.env.DNS_SERVERS?.split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  if (dnsServers?.length) {
    setServers(dnsServers);
  }

  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // ─── Trust Proxy ───────────────────────────────────────────────────────────
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);
  expressApp.disable('x-powered-by');

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

  return app;
}

async function bootstrap(): Promise<void> {
  const app = await createApplication();
  const configService = app.get(ConfigService);

  // ─── Start ─────────────────────────────────────────────────────────────────
  const port = configService.get<number>('port') ?? 7002;
  const nodeEnv = configService.get<string>('nodeEnv');

  await app.listen(port);

  console.log(
    `[nestjs-mailer-worker] running on port ${port} | mode: ${nodeEnv}`,
  );
  console.log(`Health: http://localhost:${port}`);
}

export default async function handler(
  request: Request,
  response: Response,
): Promise<void> {
  serverlessApp ??= createApplication().then(async (app) => {
    await app.init();
    return app;
  });

  const app = await serverlessApp;
  const expressApp = app.getHttpAdapter().getInstance() as (
    request: Request,
    response: Response,
  ) => void;

  expressApp(request, response);
}

if (process.env.VERCEL !== '1') {
  void bootstrap();
}
