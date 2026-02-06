import './polyfill';
import { configure as serverlessExpress } from '@vendia/serverless-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Handler } from 'aws-lambda';
import { ValidationPipe } from '@nestjs/common';

let cachedServer: any;

export const handler: Handler = async (event, context) => {
  try {
    if (!cachedServer) {
      const nestApp = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log'],
      });

      nestApp.enableCors();
      nestApp.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }));

      await nestApp.init();
      cachedServer = serverlessExpress({
        app: nestApp.getHttpAdapter().getInstance(),
      });
    }

    return cachedServer(event, context);
  } catch (error) {
    console.error('Lambda initialization error:', error);
    throw error;
  }
};
