import { prisma } from '../prisma/client';

export class SmsService {
  private static cachedToken: string | null = null;
  private static tokenExpiresAt: number = 0;

  /**
   * Normalize phone number to Uzbek format: 998901234567
   */
  public static cleanPhoneNumber(phone: string): string {
    let digits = phone.replace(/\D/g, '');
    if (digits.startsWith('998') && digits.length === 12) {
      return digits;
    }
    if (digits.length === 9) {
      return '998' + digits;
    }
    return digits;
  }

  /**
   * Get Eskiz credentials from DB settings or process.env
   */
  private static async getEskizCredentials() {
    let email = process.env.ESKIZ_EMAIL || null;
    let password = process.env.ESKIZ_PASSWORD || null;

    try {
      const settings = await prisma.shopSettings.findUnique({
        where: { id: 'default' },
      });
      if (settings?.eskizEmail && settings?.eskizPassword) {
        email = settings.eskizEmail;
        password = settings.eskizPassword;
      }
    } catch (err) {
      // Fallback to env
    }

    return { email, password };
  }

  /**
   * Obtain Bearer token from Eskiz.uz
   */
  private static async getEskizToken(): Promise<string | null> {
    const { email, password } = await this.getEskizCredentials();
    if (!email || !password) {
      return null;
    }

    // Return cached token if valid (valid for 24 hours, refresh after 20)
    if (this.cachedToken && Date.now() < this.tokenExpiresAt) {
      return this.cachedToken;
    }

    try {
      const formData = new URLSearchParams();
      formData.append('email', email.trim());
      formData.append('password', password.trim());

      const res = await fetch('https://notify.eskiz.uz/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      const data = await res.json() as any;
      if (res.ok && data?.data?.token) {
        this.cachedToken = data.data.token;
        this.tokenExpiresAt = Date.now() + 20 * 60 * 60 * 1000; // 20 hours
        return this.cachedToken;
      } else {
        console.error('❌ Eskiz Login Error:', data);
        return null;
      }
    } catch (err) {
      console.error('❌ Eskiz connection error:', err);
      return null;
    }
  }

  /**
   * Send SMS via Eskiz or Log (Simulation)
   */
  public static async sendSms(phone: string, message: string): Promise<{ success: boolean; isRealSms: boolean; info?: string }> {
    const cleanedPhone = this.cleanPhoneNumber(phone);
    const token = await this.getEskizToken();

    if (token) {
      try {
        const formData = new URLSearchParams();
        formData.append('mobile_phone', cleanedPhone);
        formData.append('message', message);
        formData.append('from', '4546');

        const res = await fetch('https://notify.eskiz.uz/api/message/sms/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        });

        const data = await res.json() as any;
        if (res.ok && (data.status === 'waiting' || data.message === 'Waiting for SMS provider')) {
          console.log(`✅ [ESKIZ SMS YUBORILDI] Tel: +${cleanedPhone} | Xabar: "${message}"`);
          return { success: true, isRealSms: true, info: 'Eskiz orqali haqiqiy SMS yuborildi' };
        } else {
          console.warn(`⚠️ Eskiz send failed, fallback to simulator:`, data);
        }
      } catch (err) {
        console.error('❌ Eskiz send error:', err);
      }
    }

    // Simulation / Development / No Eskiz mode
    console.log(`📱 [TEST REJIMI SMS] Tel: +${cleanedPhone} | Xabar: "${message}"`);
    return {
      success: true,
      isRealSms: false,
      info: "Test rejimida (Eskiz hisobi kiritilgach, avtomatik haqiqiy SMS boradi)",
    };
  }

  /**
   * Generate and store OTP code
   */
  public static async generateAndSendOtp(phone: string): Promise<{ code: string; isRealSms: boolean }> {
    const cleanedPhone = this.cleanPhoneNumber(phone);
    const code = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit code

    // Invalidate existing unused codes
    await prisma.otpVerification.deleteMany({
      where: { phone: cleanedPhone },
    });

    // Save new code, valid for 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await prisma.otpVerification.create({
      data: {
        phone: cleanedPhone,
        code,
        expiresAt,
      },
    });

    const smsText = `Barbershop: Sizning tasdiqlash kodingiz: ${code}`;
    const result = await this.sendSms(cleanedPhone, smsText);

    return {
      code,
      isRealSms: result.isRealSms,
    };
  }

  /**
   * Verify entered OTP code
   */
  public static async verifyOtp(phone: string, code: string): Promise<boolean> {
    const cleanedPhone = this.cleanPhoneNumber(phone);
    const cleanCode = code.trim();

    // Master test code for testing
    if (cleanCode === '9999') {
      return true;
    }

    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        phone: cleanedPhone,
        code: cleanCode,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return false;
    }

    // Mark as verified
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    return true;
  }
}
