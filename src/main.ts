import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors();
  app.use(helmet());

  app.use(
    rateLimit({
      windowMs: (configService.get<string>('rateLimit.ttl') || '60') as any,
      max: (configService.get<string>('rateLimit.limit') || '100') as any,
      message: { statusCode: 429, message: 'Too many requests' },
    }),
  );

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.setGlobalPrefix('v1');

  const port = configService.get<number>('port');
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
