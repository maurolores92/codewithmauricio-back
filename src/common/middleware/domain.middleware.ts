import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class DomainMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Lista de dominios permitidos
    const allowedOrigins = [
      'https://maurodev.online',
      'https://mauriciolores.com.ar',
      'https://codewithmauricio.tech',
      'http://localhost:4321', // Para desarrollo local
    ];

    const origin = req.headers.origin;
    const isDevelopment = process.env.NODE_ENV !== 'production';

    // En desarrollo, permitir todos los orígenes
    if (isDevelopment) {
      return next();
    }

    // Permitir requests sin origin (ej: Postman, curl)
    if (!origin) {
      return next();
    }

    // En producción, validar que el origen esté en la lista permitida
    if (!allowedOrigins.includes(origin)) {
      return res.status(403).json({
        success: false,
        message: 'Acceso no permitido desde este dominio',
      });
    }

    next();
  }
}