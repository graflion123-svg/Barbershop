import { prisma } from '../prisma/client';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { getNowInTashkent } from '../utils/time';

export class StatsService {
  public static async getDashboardMetrics() {
    const now = getNowInTashkent();
    const todayStr = format(now, 'yyyy-MM-dd');

    // 1. Total counts
    const [
      totalClients,
      totalBarbers,
      todayBookingsCount,
      pendingCount,
      confirmedCount,
      cancelledCount,
      completedCount,
      allRevenueResult,
      todayBookings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.barber.count({ where: { isActive: true } }),
      prisma.booking.count({ where: { date: todayStr } }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.booking.aggregate({
        where: {
          status: {
            in: ['CONFIRMED', 'COMPLETED'],
          },
        },
        _sum: {
          totalPrice: true,
        },
      }),
      prisma.booking.findMany({
        where: {
          date: todayStr,
          status: { not: 'CANCELLED' },
        },
        include: {
          barber: { select: { fullName: true } },
          service: { select: { name: true } },
          user: { select: { fullName: true, phone: true } },
        },
        orderBy: { startTime: 'asc' },
      }),
    ]);

    const totalRevenue = allRevenueResult._sum.totalPrice || 0;

    // 2. Daily bookings for the last 7 days
    const last7Days = eachDayOfInterval({
      start: subDays(now, 6),
      end: now,
    });

    const dailyChart = await Promise.all(
      last7Days.map(async (day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayLabel = format(day, 'EEE, d-MMM');
        const count = await prisma.booking.count({
          where: { date: dateStr, status: { not: 'CANCELLED' } },
        });
        const revenue = await prisma.booking.aggregate({
          where: {
            date: dateStr,
            status: { in: ['CONFIRMED', 'COMPLETED'] },
          },
          _sum: { totalPrice: true },
        });

        return {
          date: dateStr,
          label: dayLabel,
          bookings: count,
          revenue: revenue._sum.totalPrice || 0,
        };
      })
    );

    // 3. Top services
    const services = await prisma.service.findMany({
      include: {
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: {
        bookings: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    const topServices = services.map(s => ({
      name: s.name,
      bookingsCount: s._count.bookings,
      price: s.price,
    }));

    return {
      kpi: {
        totalClients,
        totalBarbers,
        todayBookings: todayBookingsCount,
        pendingBookings: pendingCount,
        confirmedBookings: confirmedCount,
        cancelledBookings: cancelledCount,
        completedBookings: completedCount,
        totalRevenue,
      },
      todayBookings,
      dailyChart,
      topServices,
    };
  }
}
