import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationExceptionFilter } from './services/exception-filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: { target: false },
    }),
  );
  app.useGlobalFilters(new ValidationExceptionFilter());

  await app.listen(3000);
}

(async () => bootstrap())();
