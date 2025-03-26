/* eslint-disable prettier/prettier */
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    // You can allow specific origins, e.g.:
    // origin: 'http://localhost:8080'
    // or allow all for dev:
    origin: true,
    // other options if needed
  });

  await app.listen(3004);
}
void bootstrap();
