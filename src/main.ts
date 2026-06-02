import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app =
    await NestFactory.create(
      AppModule,
    );

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const config =
    new DocumentBuilder()
      .setTitle('Train API')
      .setDescription(
        'Train API Docs',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat:
            'JWT',
        },
        'JWT-auth',
      )
      .build();

  const document =
    SwaggerModule.createDocument(
      app,
      config,
    );

  SwaggerModule.setup(
    'api',
    app,
    document,
  );

  const port =
    process.env.PORT ||
    3000;

  await app.listen(port);

  console.log(
    `RUNNING: ${port}`,
  );
}

bootstrap();
