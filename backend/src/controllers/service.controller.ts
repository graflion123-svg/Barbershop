import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { serviceSchema } from '../validators';
import { AuthenticatedRequest } from '../types';

export class ServiceController {
  /**
   * Public: List all active services
   */
  public static async getAllActiveServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const services = await prisma.service.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' },
      });
      res.json({ success: true, services });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ADMIN: List all services
   */
  public static async adminGetAllServices(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const services = await prisma.service.findMany({
        include: {
          _count: {
            select: { bookings: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, services });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ADMIN: Create new service
   */
  public static async adminCreateService(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = serviceSchema.parse(req.body);
      const service = await prisma.service.create({
        data,
      });
      res.status(201).json({
        success: true,
        message: 'Xizmat muvaffaqiyatli yaratildi',
        service,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ADMIN: Update service
   */
  public static async adminUpdateService(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data = serviceSchema.partial().parse(req.body);

      const updated = await prisma.service.update({
        where: { id },
        data,
      });

      res.json({
        success: true,
        message: 'Xizmat muvaffaqiyatli yangilandi',
        service: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ADMIN: Delete service
   */
  public static async adminDeleteService(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.service.delete({ where: { id } });
      res.json({ success: true, message: 'Xizmat muvaffaqiyatli o\'chirildi' });
    } catch (error) {
      next(error);
    }
  }
}
