import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita validação em todas as rotas
  // whitelist: remove campos extras que não estão no DTO
  // forbidNonWhitelisted: rejeita se vier campo desconhecido
  // transform: converte tipos automaticamente (ex: string '1' vira number 1)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
