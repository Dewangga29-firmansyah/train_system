import { ValidationPipe } from '@nestjs/common'

import { ConfigService } from '@nestjs/config'

import { NestFactory } from '@nestjs/core'

import {
  SwaggerModule,
  DocumentBuilder,
} from '@nestjs/swagger'

import helmet from 'helmet'

import compression from 'compression'

import cookieParser from 'cookie-parser'

import morgan from 'morgan'

import { AppModule } from './app.module'

async function bootstrap() {
  const app =
    await NestFactory.create(
      AppModule,
    )

  const configService =
    app.get(ConfigService)

  app.setGlobalPrefix('api')

  app.enableCors({
    origin: true,
  })

  app.use(helmet())

  app.use(compression())

  app.use(cookieParser())

  app.use(morgan('dev'))

  app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,

    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
)

  const config =
    new DocumentBuilder()
      .setTitle('Lunch Flow API')

      .setDescription(
        'Lunch Flow Backend Documentation',
      )

      .setVersion('1.0')

      .addBearerAuth()

      .build()

  const document =
    SwaggerModule.createDocument(
      app,
      config,
    )

  SwaggerModule.setup(
    'api/docs',
    app,
    document,
  )

  const port =
    configService.get<number>(
      'PORT',
    ) || 3000

  await app.listen(port)

  console.log(
    `🚀 Server running on http://localhost:${port}/api`,
  )

  console.log(
    `📄 Swagger running on http://localhost:${port}/api/docs`,
  )
}

bootstrap()