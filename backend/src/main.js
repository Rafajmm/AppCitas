require('reflect-metadata');
require('dotenv').config();
const path = require('path');
const express = require('express');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./modules/app/app.module');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const publicPath = path.join(__dirname, '..', 'public');
  const uploadsPath = path.join(__dirname, '..', 'uploads');
  
  console.log('Serving static files from:', { publicPath, uploadsPath });
  
  // Serve static files
  app.use('/public', express.static(publicPath));
  app.use('/uploads', express.static(uploadsPath));

  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port);
  console.log(`Application is running on: ${port}`);
}

bootstrap();
