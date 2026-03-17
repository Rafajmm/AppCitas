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
const host = process.env.HOST || '0.0.0.0'; // Escuchar en todas las interfaces

await app.listen(port, host);
console.log(`Application is running on: http://${host}:${port}`);
console.log(`Local access: http://localhost:${port}`);
console.log(`Network access: http://192.168.1.162:${port}`);
}

bootstrap();
