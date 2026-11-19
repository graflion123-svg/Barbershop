import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { barberSchema, updateScheduleSchema, barberDayOffSchema } from '../validators';
import { AuthenticatedRequest } from '../types';

export class BarberController {
  /**
   * Public: Get all active barbers
   */
  public static async getAllActiveBarbers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const barbers = await prisma.barber.findMany({
        where: { isActive: true },
        include: {
          schedules: {
            orderBy: { dayOfWeek: 'asc' },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
      res.json({ success: true, barbers });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Public / Admin: Get barber details
   */
  public static async getBarberById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const barber = await prisma.barber.findUnique({
        where: { id },
        include: {
          schedules: { orderBy: { dayOfWeek: 'asc' } },
          daysOff: { orderBy: { date: 'asc' } },
        },
      });

      if (!barber) {
        res.status(404).json({ success: false, message: 'Barber topilmadi' });
        return;
      }

      res.json({ success: true, barber });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ADMIN: List all barbers (active and inactive)
   */
  public static async adminGetAllBarbers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const barbers = await prisma.barber.findMany({
        include: {
          schedules: { orderBy: { dayOfWeek: 'asc' } },
          daysOff: { orderBy: { date: 'asc' } },
          _count: {
            select: { bookings: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
      res.json({ success: true, barbers });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ADMIN: Create new barber
   */
  public static async adminCreateBarber(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = barberSchema.parse(req.body);

      // Create barber and initialize standard weekly schedule (Mon-Sun)
      const barber = await prisma.$transaction(async (tx) => {
        const newBarber = await tx.barber.create({
          data: {
            fullName: data.fullName,
            phone: data.phone,
            image: data.image,
            experience: data.experience,
            description: data.description,
            isActive: data.isActive ?? true,
          },
        });

        // Initialize 7 days schedule: Mon-Sat working (09:00 - 21:00, lunch 13:00 - 14:00), Sun off
        const defaultSchedules = [];
        for (let day = 0; day <= 6; day++) {
          const isSunday = day === 0;
          defaultSchedules.push({
            barberId: newBarber.id,
            dayOfWeek: day,
            startTime: '09:00',
            endTime: '21:00',
            breakStart: '13:00',
            breakEnd: '14:00',
            isWorking: !isSunday,
          });
        }

        await tx.barberSchedule.createMany({
          data: defaultSchedules,
        });

        return newBarber;
      });

      const fullBarber = await prisma.barber.findUnique({
        where: { id: barber.id },
        include: { schedules: true },
      });

      res.status(201).json({
        success: true,
        message: 'Barber muvaffaqiyatli qo\'shildi',
        barber: fullBarber,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ADMIN: Update barber profile
   */
  public static async adminUpdateBarber(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data = barberSchema.partial().parse(req.body);

      const updated = await prisma.barber.update({
        where: { id },
        data,
      });

      res.json({
        success: true,
        message: 'Barber ma\'lumotlari yangilandi',
        barber: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ADMIN: Delete barber
   */
  public static async adminDeleteBarber(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.barber.delete({ where: { id } });
      res.json({ success: true, message: 'Barber muvaffaqiyatli o\'chirildi' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ADMIN: Update barber weekly schedule
   */
  public static async adminUpdateSchedule(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { schedules } = updateScheduleSchema.parse(req.body);

      await prisma.$transaction(async (tx) => {
        for (const item of schedules) {
          await tx.barberSchedule.upsert({
            where: {
              barberId_dayOfWeek: {
                barberId: id,
                dayOfWeek: item.dayOfWeek,
              },
            },
            create: {
              barberId: id,
              dayOfWeek: item.dayOfWeek,
              startTime: item.startTime,
              endTime: item.endTime,
              breakStart: item.breakStart,
              breakEnd: item.breakEnd,
              isWorking: item.isWorking,
            },
            update: {
              startTime: item.startTime,
              endTime: item.endTime,
              breakStart: item.breakStart,
              breakEnd: item.breakEnd,
              isWorking: item.isWorking,
            },
          });
        }
      });

      const updatedSchedules = await prisma.barberSchedule.findMany({
        where: { barberId: id },
        orderBy: { dayOfWeek: 'asc' },
      });

      res.json({
        success: true,
        message: 'Barber ish jadvali muvaffaqiyatli yangilandi',
        schedules: updatedSchedules,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ADMIN: Add Day Off
   */
  public static async adminAddDayOff(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { date, reason } = barberDayOffSchema.parse(req.body);

      const dayOff = await prisma.barberDayOff.create({
        data: {
          barberId: id,
          date,
          reason,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Dam olish kuni belgilandi',
        dayOff,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ADMIN: Remove Day Off
   */
  public static async adminRemoveDayOff(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, dayOffId } = req.params;
      await prisma.barberDayOff.delete({
        where: { id: dayOffId },
      });
      res.json({ success: true, message: 'Dam olish kuni bekor qilindi' });
    } catch (error) {
      next(error);
    }
  }
}
