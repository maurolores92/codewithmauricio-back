import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global
  app.setGlobalPrefix('api');

  // Validaciones globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configurado para múltiples dominios de frontend
  const allowedOrigins = [
    'https://maurodev.online',
    'https://mauriciolores.com.ar',
    'https://codewithmauricio.tech',
    'http://localhost:3000', // Next.js dev
    'http://localhost:5173', // Vite dev
    'http://localhost:4321', // para desarrollo
  ];

//   app.enableCors({
//   origin: true,
//   credentials: true,
// });

  app.enableCors({
    origin: (origin, callback) => {
      // Permite requests sin origin (ej: Postman, curl)
      if (!origin) return callback(null, true);

      // Permitir el FRONTEND_URL o cualquier http://localhost:* (útil cuando Vite cambia el puerto)
      if (allowedOrigins.includes(origin) || origin.startsWith('http://localhost')) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'x-api-key'],
    credentials: true,
  });

  const port = process.env.PORT ?? 5002;
  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}`);
}

bootstrap();