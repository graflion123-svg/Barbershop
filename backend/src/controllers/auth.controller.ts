import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma/client';
import { adminLoginSchema, customerAuthSchema, sendOtpSchema, verifyOtpSchema } from '../validators';
import { signAdminToken, signUserToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../types';
import { SmsService } from '../services/sms.service';

export class AuthController {
  /**
   * Admin Login
   */
  public static async adminLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = adminLoginSchema.parse(req.body);
      const loginInput = data.email.trim();
      const admin = await prisma.admin.findFirst({
        where: {
          OR: [
            { email: loginInput },
            { email: loginInput.toLowerCase() },
            { email: `${loginInput.toLowerCase()}@barber.uz` },
            { email: loginInput.toLowerCase().replace('@barber.uz', '') },
          ],
        },
      });

      if (!admin) {
        res.status(401).json({ success: false, message: 'Login yoki parol xato' });
        return;
      }

      const isMatch = await bcrypt.compare(data.password, admin.passwordHash);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Login yoki parol xato' });
        return;
      }

      const token = signAdminToken({
        id: admin.id,
        email: admin.email,
        role: admin.role,
      });

      res.json({
        success: true,
        message: 'Muvaffaqiyatli kirdingiz',
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          role: admin.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify Admin session
   */
  public static async getAdminProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.admin) {
        res.status(401).json({ success: false, message: 'Autentifikatsiya qilinmagan' });
        return;
      }

      const admin = await prisma.admin.findUnique({
        where: { id: req.admin.id },
        select: { id: true, email: true, role: true, createdAt: true },
      });

      if (!admin) {
        res.status(404).json({ success: false, message: 'Admin topilmadi' });
        return;
      }

      res.json({ success: true, admin });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Customer Identify / Register
   * Enables persistent identification on return visits
   */
  public static async customerIdentify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = customerAuthSchema.parse(req.body);

      // Clean phone: ensure format like +998901234567 or digits
      const cleanedPhone = data.phone.trim();

      let user = await prisma.user.findUnique({
        where: { phone: cleanedPhone },
        include: {
          _count: {
            select: { bookings: true },
          },
        },
      });

      let isNew = false;
      if (!user) {
        user = await prisma.user.create({
          data: {
            phone: cleanedPhone,
            fullName: data.fullName.trim(),
          },
          include: {
            _count: {
              select: { bookings: true },
            },
          },
        });
        isNew = true;
      } else {
        // If name updated, update in db
        if (data.fullName.trim() && user.fullName !== data.fullName.trim()) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { fullName: data.fullName.trim() },
            include: {
              _count: {
                select: { bookings: true },
              },
            },
          });
        }
      }

      const token = signUserToken({
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
      });

      res.json({
        success: true,
        message: isNew ? "Ro'yxatdan muvaffaqiyatli o'tdingiz" : "Qaytganingiz bilan xush kelibsiz!",
        isNew,
        user: {
          id: user.id,
          fullName: user.fullName,
          phone: user.phone,
          createdAt: user.createdAt,
          visitsCount: user._count.bookings,
        },
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check customer by phone without requiring full re-registration
   */
  public static async lookupCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const phone = req.query.phone as string;
      if (!phone) {
        res.status(400).json({ success: false, message: 'Telefon raqami kiritilishi shart' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { phone: phone.trim() },
        select: { id: true, fullName: true, phone: true },
      });

      res.json({
        success: true,
        exists: !!user,
        user: user || null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send SMS OTP verification code
   */
  public static async sendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = sendOtpSchema.parse(req.body);
      const { code, isRealSms } = await SmsService.generateAndSendOtp(data.phone);

      res.json({
        success: true,
        message: isRealSms
          ? "Tasdiqlash kodi telefoningizga SMS orqali yuborildi."
          : "Tasdiqlash kodi yuborildi.",
        isRealSms,
        // In simulation / demo mode (when no Eskiz credentials configured), return code so testing is never blocked
        demoCode: isRealSms ? undefined : code,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify SMS OTP code and authenticate/register customer
   */
  public static async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = verifyOtpSchema.parse(req.body);
      const isValid = await SmsService.verifyOtp(data.phone, data.code);

      if (!isValid) {
        res.status(400).json({
          success: false,
          message: "Tasdiqlash kodi noto'g'ri yoki uning muddati (5 daqiqa) o'tgan.",
        });
        return;
      }

      const cleanedPhone = data.phone.trim();
      let user = await prisma.user.findUnique({
        where: { phone: cleanedPhone },
        include: {
          _count: {
            select: { bookings: true },
          },
        },
      });

      if (!user && data.fullName) {
        user = await prisma.user.create({
          data: {
            phone: cleanedPhone,
            fullName: data.fullName.trim(),
          },
          include: {
            _count: {
              select: { bookings: true },
            },
          },
        });
      }

      const token = user
        ? signUserToken({
            id: user.id,
            phone: user.phone,
            fullName: user.fullName,
          })
        : null;

      res.json({
        success: true,
        verified: true,
        message: "Telefon raqamingiz muvaffaqiyatli tasdiqlandi!",
        user: user
          ? {
              id: user.id,
              fullName: user.fullName,
              phone: user.phone,
              createdAt: user.createdAt,
              visitsCount: user._count.bookings,
            }
          : null,
        token,
      });
    } catch (error) {
      next(error);
    }
  }
}
