import { prisma } from '../prisma/client';
import {
  timeStringToMinutes,
  minutesToTimeString,
  doIntervalsOverlap,
  isSlotInPast,
} from '../utils/time';
import { TimeSlot } from '../types';

export class BookingEngine {
  /**
   * Calculate available time slots for a given barber, date, and people count
   */
  public static async getAvailableSlots(
    barberId: string,
    date: string,
    peopleCount: number = 1
  ): Promise<TimeSlot[]> {
    const slotDuration = peopleCount * 45; // 1 person = 45m, 2 = 90m, etc.

    // 1. Check if barber exists and is active
    const barber = await prisma.barber.findUnique({
      where: { id: barberId, isActive: true },
    });
    if (!barber) {
      return [];
    }

    // 2. Check if the date is a day off for this barber
    const dayOff = await prisma.barberDayOff.findUnique({
      where: {
        barberId_date: {
          barberId,
          date,
        },
      },
    });
    if (dayOff) {
      return []; // Barber is on day off
    }

    // 3. Determine day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    // Parse date components to avoid timezone shifting when getting day of week
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();

    // 4. Get barber's schedule for this day of week
    const schedule = await prisma.barberSchedule.findUnique({
      where: {
        barberId_dayOfWeek: {
          barberId,
          dayOfWeek,
        },
      },
    });

    if (!schedule || !schedule.isWorking) {
      return []; // Barber is not working on this weekday
    }

    const shiftStart = timeStringToMinutes(schedule.startTime);
    const shiftEnd = timeStringToMinutes(schedule.endTime);

    const hasBreak = !!(schedule.breakStart && schedule.breakEnd);
    const breakStart = hasBreak ? timeStringToMinutes(schedule.breakStart!) : null;
    const breakEnd = hasBreak ? timeStringToMinutes(schedule.breakEnd!) : null;

    // 5. Fetch all existing active bookings for this barber and date
    const existingBookings = await prisma.booking.findMany({
      where: {
        barberId,
        date,
        status: {
          not: 'CANCELLED',
        },
      },
    });

    const bookedIntervals = existingBookings.map(b => ({
      start: timeStringToMinutes(b.startTime),
      end: timeStringToMinutes(b.endTime),
    }));

    // 6. Generate candidate slots every 30 minutes from shiftStart
    const availableSlots: TimeSlot[] = [];
    const stepMinutes = 30; // 30-minute granularity allows flexible start times

    for (let slotStart = shiftStart; slotStart + slotDuration <= shiftEnd; slotStart += stepMinutes) {
      const slotEnd = slotStart + slotDuration;
      const startTimeStr = minutesToTimeString(slotStart);
      const endTimeStr = minutesToTimeString(slotEnd);

      // Check if slot is in the past
      if (isSlotInPast(date, startTimeStr)) {
        continue;
      }

      // Check break overlap
      if (hasBreak && breakStart !== null && breakEnd !== null) {
        if (doIntervalsOverlap(slotStart, slotEnd, breakStart, breakEnd)) {
          continue;
        }
      }

      // Check overlap with existing active bookings
      const overlapsBooking = bookedIntervals.some(booked =>
        doIntervalsOverlap(slotStart, slotEnd, booked.start, booked.end)
      );

      if (!overlapsBooking) {
        availableSlots.push({
          startTime: startTimeStr,
          endTime: endTimeStr,
          available: true,
        });
      }
    }

    return availableSlots;
  }

  /**
   * Concurrency-safe booking creation using PostgreSQL transactional advisory locks
   */
  public static async createBookingWithLock(params: {
    barberId: string;
    serviceId: string;
    date: string;
    startTime: string;
    peopleCount: number;
    fullName: string;
    phone: string;
  }) {
    const { barberId, serviceId, date, startTime, peopleCount, fullName, phone } = params;
    const totalDuration = peopleCount * 45;
    const startMinutes = timeStringToMinutes(startTime);
    const endMinutes = startMinutes + totalDuration;
    const endTime = minutesToTimeString(endMinutes);

    // Check past time validation
    if (isSlotInPast(date, startTime)) {
      throw new Error("O'tib ketgan vaqtga bron qilish mumkin emas");
    }

    // Run within interactive PostgreSQL transaction
    return await prisma.$transaction(async (tx) => {
      // 1. Acquire PostgreSQL advisory lock on barberId + date
      // This serializes booking attempts for the same barber on the same day
      const lockKey = `${barberId}_${date}`;
      await tx.$executeRawUnsafe(`SELECT pg_advisory_xact_lock(hashtext($1))`, lockKey);

      // 2. Validate barber
      const barber = await tx.barber.findUnique({
        where: { id: barberId, isActive: true },
      });
      if (!barber) {
        throw new Error("Tanlangan barber topilmadi yoki faol emas");
      }

      // 3. Validate service
      const service = await tx.service.findUnique({
        where: { id: serviceId, isActive: true },
      });
      if (!service) {
        throw new Error("Tanlangan xizmat topilmadi yoki faol emas");
      }

      // 4. Validate day off
      const dayOff = await tx.barberDayOff.findUnique({
        where: {
          barberId_date: {
            barberId,
            date,
          },
        },
      });
      if (dayOff) {
        throw new Error("Tanlangan sanada barber dam olish kunida");
      }

      // 5. Validate schedule
      const [year, month, day] = date.split('-').map(Number);
      const dayOfWeek = new Date(year, month - 1, day).getDay();

      const schedule = await tx.barberSchedule.findUnique({
        where: {
          barberId_dayOfWeek: {
            barberId,
            dayOfWeek,
          },
        },
      });

      if (!schedule || !schedule.isWorking) {
        throw new Error("Barber bu kuni ishlamaydi");
      }

      const shiftStart = timeStringToMinutes(schedule.startTime);
      const shiftEnd = timeStringToMinutes(schedule.endTime);

      if (startMinutes < shiftStart || endMinutes > shiftEnd) {
        throw new Error(
          `Tanlangan vaqt barberning ish vaqtiga (${schedule.startTime} - ${schedule.endTime}) to'g'ri kelmaydi`
        );
      }

      // Check break
      if (schedule.breakStart && schedule.breakEnd) {
        const breakStart = timeStringToMinutes(schedule.breakStart);
        const breakEnd = timeStringToMinutes(schedule.breakEnd);
        if (doIntervalsOverlap(startMinutes, endMinutes, breakStart, breakEnd)) {
          throw new Error("Tanlangan vaqt barberning tanaffus vaqtiga to'g'ri keladi");
        }
      }

      // 6. Check existing bookings overlap
      const conflictingBookings = await tx.booking.findMany({
        where: {
          barberId,
          date,
          status: {
            not: 'CANCELLED',
          },
        },
      });

      for (const b of conflictingBookings) {
        const bStart = timeStringToMinutes(b.startTime);
        const bEnd = timeStringToMinutes(b.endTime);
        if (doIntervalsOverlap(startMinutes, endMinutes, bStart, bEnd)) {
          throw new Error(
            `Kechirasiz, tanlangan vaqt (${startTime} - ${endTime}) allaqachon boshqa mijoz tomonidan band qilingan`
          );
        }
      }

      // 7. Find or create user
      let user = await tx.user.findUnique({
        where: { phone },
      });
      if (!user) {
        user = await tx.user.create({
          data: {
            fullName,
            phone,
          },
        });
      } else if (user.fullName !== fullName) {
        // Update name if changed
        user = await tx.user.update({
          where: { id: user.id },
          data: { fullName },
        });
      }

      // 8. Calculate total price (service price * people count)
      const totalPrice = service.price * peopleCount;

      // 9. Create booking
      const newBooking = await tx.booking.create({
        data: {
          userId: user.id,
          barberId,
          serviceId,
          date,
          startTime,
          endTime,
          peopleCount,
          totalDuration,
          totalPrice,
          status: 'PENDING',
        },
        include: {
          barber: true,
          service: true,
          user: true,
        },
      });

      return newBooking;
    });
  }
}
