import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global API prefix
  app.setGlobalPrefix('api');

  // Enable global validation
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // Enable CORS for development
  app.enableCors();

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
