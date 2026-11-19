import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('API Error:', err);

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validatsiya xatosi',
      errors: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'Bu ma\'lumot allaqachon mavjud (unikal maydon takrorlandi)',
      });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'So\'ralgan ma\'lumot topilmadi',
      });
      return;
    }
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server ichki xatosi yuz berdi',
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Marshrut topilmadi: ${req.method} ${req.originalUrl}`,
  });
}
