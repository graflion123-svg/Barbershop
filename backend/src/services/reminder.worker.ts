import { prisma } from '../prisma/client';
import { SmsService } from './sms.service';

export class ReminderWorker {
  private static intervalId: NodeJS.Timeout | null = null;
  private static isRunningCheck: boolean = false;

  /**
   * Start the reminder background worker (runs every 60 seconds)
   */
  public static start(): void {
    if (this.intervalId) return;

    console.log('⏰ [REMINDER WORKER] 1 soatlik SMS eslatma xizmati ishga tushirildi...');

    // Run immediately once, then every 60 seconds
    this.checkAndSendReminders().catch((err) => console.error('Reminder worker tick error:', err));

    this.intervalId = setInterval(() => {
      this.checkAndSendReminders().catch((err) => console.error('Reminder worker tick error:', err));
    }, 60 * 1000);
  }

  public static stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Check bookings starting in ~1 hour (between 45 and 75 minutes from now)
   */
  private static async checkAndSendReminders(): Promise<void> {
    if (this.isRunningCheck) return;
    this.isRunningCheck = true;

    try {
      // 1. Current Tashkent Time (Asia/Tashkent, UTC+5)
      const now = new Date();
      const formatterDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Tashkent',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      const todayStr = formatterDate.format(now); // "YYYY-MM-DD"

      const formatterTime = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Tashkent',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const [nowH, nowM] = formatterTime.format(now).split(':').map(Number);
      const currentMinutes = nowH * 60 + nowM;

      // 2. Fetch pending or confirmed bookings for today that haven't been reminded
      const upcomingBookings = await prisma.booking.findMany({
        where: {
          date: todayStr,
          status: { in: ['CONFIRMED', 'PENDING'] },
          reminderSent: false,
        },
        include: {
          user: true,
          barber: true,
          service: true,
        },
      });

      if (upcomingBookings.length === 0) {
        this.isRunningCheck = false;
        return;
      }

      // Get shop info for address / phone
      const shopSettings = await prisma.shopSettings.findUnique({
        where: { id: 'default' },
      });
      const shopName = shopSettings?.shopName || 'Barbershop';
      const shopAddress = shopSettings?.address || '';

      for (const booking of upcomingBookings) {
        const [bH, bM] = booking.startTime.split(':').map(Number);
        const bookingMinutes = bH * 60 + bM;
        const diffMinutes = bookingMinutes - currentMinutes;

        // Check if appointment is between 45 and 75 minutes away (~1 hour)
        if (diffMinutes >= 45 && diffMinutes <= 75) {
          const reminderMessage = `Hurmatli ${booking.user.fullName}! Eslatib o'tamiz, bugun soat ${booking.startTime} da ${shopName}da (${booking.barber.fullName}) qabulingiz bor.${shopAddress ? ` Manzil: ${shopAddress}` : ''} Sizni kutamiz!`;

          await SmsService.sendSms(booking.user.phone, reminderMessage);

          // Mark reminder as sent so it won't send repeatedly
          await prisma.booking.update({
            where: { id: booking.id },
            data: { reminderSent: true },
          });

          console.log(`⏰ [SMS ESLATMA YUBORILDI] Mijoz: ${booking.user.fullName} (${booking.user.phone}), Vaqt: ${booking.startTime}`);
        }
      }
    } catch (error) {
      console.error('❌ ReminderWorker check error:', error);
    } finally {
      this.isRunningCheck = false;
    }
  }
}
