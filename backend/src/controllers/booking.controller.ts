import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { BookingEngine } from '../services/bookingEngine';
import {
  getAvailableTimesSchema,
  createBookingSchema,
  updateBookingStatusSchema,
} from '../validators';
import { AuthenticatedRequest } from '../types';
import { SmsService } from '../services/sms.service';

export class BookingController {
  /**
   * Get calculated available time slots
   */
  public static async getAvailableTimes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = getAvailableTimesSchema.parse({
        barberId: req.query.barberId,
        date: req.query.date,
        peopleCount: req.query.peopleCount ? Number(req.query.peopleCount) : 1,
      });

      const slots = await BookingEngine.getAvailableSlots(
        query.barberId,
        query.date,
        query.peopleCount
      );

      res.json({
        success: true,
        date: query.date,
        barberId: query.barberId,
        peopleCount: query.peopleCount,
        totalDurationMinutes: query.peopleCount * 45,
        availableSlots: slots,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new booking
   */
  public static async createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createBookingSchema.parse(req.body);

      // If OTP code is provided, verify it
      if (data.otpCode) {
        const isOtpValid = await SmsService.verifyOtp(data.phone, data.otpCode);
        if (!isOtpValid) {
          res.status(400).json({
            success: false,
            message: "SMS orqali yuborilgan tasdiqlash kodi noto'g'ri yoki eskirgan.",
          });
          return;
        }
      }

      const booking = await BookingEngine.createBookingWithLock({
        barberId: data.barberId,
        serviceId: data.serviceId,
        date: data.date,
        startTime: data.startTime,
        peopleCount: data.peopleCount,
        fullName: data.fullName,
        phone: data.phone,
      });

      // Send immediate confirmation SMS to customer
      const confirmText = `Barbershop: Hurmatli ${data.fullName}, qabulingiz muvaffaqiyatli band qilindi! Sana: ${booking.date}, Soat: ${booking.startTime}. Sartarosh: ${booking.barber.fullName}. Qabuldan 1 soat oldin eslatma yuboramiz.`;
      SmsService.sendSms(data.phone, confirmText).catch((e) =>
        console.error('Confirmation SMS error:', e)
      );

      res.status(201).json({
        success: true,
        message: 'Bron muvaffaqiyatli qabul qilindi!',
        booking,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get bookings for a customer by phone number
   */
  public static async getCustomerBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const phone = req.query.phone as string;
      if (!phone) {
        res.status(400).json({ success: false, message: 'Telefon raqami kiritilishi lozim' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { phone: phone.trim() },
      });

      if (!user) {
        res.json({ success: true, bookings: [] });
        return;
      }

      const bookings = await prisma.booking.findMany({
        where: { userId: user.id },
        include: {
          barber: true,
          service: true,
        },
        orderBy: [
          { date: 'desc' },
          { startTime: 'desc' },
        ],
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          fullName: user.fullName,
          phone: user.phone,
        },
        bookings,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Customer cancels own booking
   */
  public static async cancelCustomerBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { phone } = req.body;

      if (!phone) {
        res.status(400).json({ success: false, message: 'Tasdiqlash uchun telefon raqami kerak' });
        return;
      }

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!booking) {
        res.status(404).json({ success: false, message: 'Bron topilmadi' });
        return;
      }

      if (booking.user.phone !== phone.trim()) {
        res.status(403).json({ success: false, message: 'Ushbu bronni bekor qilishga ruxsatingiz yo\'q' });
        return;
      }

      if (booking.status === 'CANCELLED') {
        res.status(400).json({ success: false, message: 'Ushbu bron allaqachon bekor qilingan' });
        return;
      }

      if (booking.status === 'COMPLETED') {
        res.status(400).json({ success: false, message: 'Tugallangan bronni bekor qilib bo\'lmaydi' });
        return;
      }

      const updated = await prisma.booking.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      res.json({
        success: true,
        message: 'Bron muvaffaqiyatli bekor qilindi',
        booking: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ADMIN: List all bookings with filtering & search
   */
  public static async adminGetAllBookings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { date, barberId, status, search } = req.query;

      const whereClause: any = {};

      if (date && typeof date === 'string') {
        whereClause.date = date;
      }

      if (barberId && typeof barberId === 'string' && barberId !== 'ALL') {
        whereClause.barberId = barberId;
      }

      if (status && typeof status === 'string' && status !== 'ALL') {
        whereClause.status = status;
      }

      if (search && typeof search === 'string') {
        whereClause.OR = [
          { user: { fullName: { contains: search, mode: 'insensitive' } } },
          { user: { phone: { contains: search } } },
          { service: { name: { contains: search, mode: 'insensitive' } } },
        ];
      }

      const bookings = await prisma.booking.findMany({
        where: whereClause,
        include: {
          user: true,
          barber: true,
          service: true,
        },
        orderBy: [
          { date: 'desc' },
          { startTime: 'asc' },
        ],
      });

      res.json({
        success: true,
        count: bookings.length,
        bookings,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ADMIN: Update booking status
   */
  public static async adminUpdateBookingStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = updateBookingStatusSchema.parse(req.body);

      const updated = await prisma.booking.update({
        where: { id },
        data: { status },
        include: {
          user: true,
          barber: true,
          service: true,
        },
      });

      res.json({
        success: true,
        message: `Bron holati muvaffaqiyatli o'zgartirildi: ${status}`,
        booking: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ADMIN: Edit booking details
   */
  public static async adminEditBooking(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { barberId, serviceId, date, startTime, peopleCount, status } = req.body;

      const dataToUpdate: any = {};
      if (barberId) dataToUpdate.barberId = barberId;
      if (serviceId) {
        dataToUpdate.serviceId = serviceId;
        const s = await prisma.service.findUnique({ where: { id: serviceId } });
        if (s) {
          const count = peopleCount || 1;
          dataToUpdate.totalPrice = s.price * count;
        }
      }
      if (peopleCount) {
        dataToUpdate.peopleCount = peopleCount;
        dataToUpdate.totalDuration = peopleCount * 45;
      }
      if (date) dataToUpdate.date = date;
      if (startTime) {
        dataToUpdate.startTime = startTime;
        // recalculate endTime
        const [h, m] = startTime.split(':').map(Number);
        const duration = dataToUpdate.totalDuration || 45;
        const endTotal = h * 60 + m + duration;
        const endH = Math.floor(endTotal / 60).toString().padStart(2, '0');
        const endM = (endTotal % 60).toString().padStart(2, '0');
        dataToUpdate.endTime = `${endH}:${endM}`;
      }
      if (status) dataToUpdate.status = status;

      const updated = await prisma.booking.update({
        where: { id },
        data: dataToUpdate,
        include: {
          user: true,
          barber: true,
          service: true,
        },
      });

      res.json({
        success: true,
        message: 'Bron muvaffaqiyatli yangilandi',
        booking: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ADMIN: Delete booking
   */
  public static async adminDeleteBooking(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.booking.delete({ where: { id } });
      res.json({ success: true, message: 'Bron muvaffaqiyatli o\'chirildi' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ADMIN: Calendar events
   */
  public static async adminGetCalendarEvents(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, barberId } = req.query;

      const whereClause: any = {};
      if (startDate && endDate) {
        whereClause.date = {
          gte: startDate as string,
          lte: endDate as string,
        };
      }
      if (barberId && barberId !== 'ALL') {
        whereClause.barberId = barberId as string;
      }

      const bookings = await prisma.booking.findMany({
        where: whereClause,
        include: {
          user: true,
          barber: true,
          service: true,
        },
      });

      res.json({
        success: true,
        events: bookings,
      });
    } catch (error) {
      next(error);
    }
  }
}
