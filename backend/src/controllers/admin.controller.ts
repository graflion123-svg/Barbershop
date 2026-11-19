import { Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { StatsService } from '../services/stats.service';
import { AuthenticatedRequest } from '../types';

export class AdminController {
  /**
   * Get dashboard KPI metrics and charts
   */
  public static async getDashboardStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await StatsService.getDashboardMetrics();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all clients with visit counts and search
   */
  public static async getAllClients(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search } = req.query;

      const whereClause: any = {};
      if (search && typeof search === 'string') {
        whereClause.OR = [
          { fullName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ];
      }

      const users = await prisma.user.findMany({
        where: whereClause,
        include: {
          _count: {
            select: { bookings: true },
          },
          bookings: {
            orderBy: { date: 'desc' },
            take: 1, // Last booking
            include: {
              barber: { select: { fullName: true } },
              service: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const clients = users.map(u => ({
        id: u.id,
        fullName: u.fullName,
        phone: u.phone,
        createdAt: u.createdAt,
        totalBookings: u._count.bookings,
        lastBooking: u.bookings[0] || null,
      }));

      res.json({
        success: true,
        count: clients.length,
        clients,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single client profile with full booking history
   */
  public static async getClientDetails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          bookings: {
            include: {
              barber: true,
              service: true,
            },
            orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
          },
          _count: {
            select: { bookings: true },
          },
        },
      });

      if (!user) {
        res.status(404).json({ success: false, message: 'Mijoz topilmadi' });
        return;
      }

      res.json({ success: true, client: user });
    } catch (error) {
      next(error);
    }
  }
}
