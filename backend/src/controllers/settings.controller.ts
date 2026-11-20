import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { shopSettingsSchema } from '../validators';
import { AuthenticatedRequest } from '../types';

export class SettingsController {
  /**
   * Public: Get barbershop settings
   */
  public static async getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let settings = await prisma.shopSettings.findFirst();

      if (!settings) {
        // Initialize default settings if none exists
        settings = await prisma.shopSettings.create({
          data: {
            id: 'default',
            shopName: 'THE NOBLE BLADE BARBERSHOP',
            logo: '/images/logo.png',
            address: 'Toshkent shahar, Mirobod tumani, Amir Temur shoh ko\'chasi, 42-uy',
            phone: '+998 90 123 45 67',
            yandexMapsUrl: 'https://yandex.com/maps/?text=Tashkent+Amir+Temur+42',
            googleMapsUrl: 'https://maps.google.com/?q=Tashkent',
            openingHours: 'Har kuni: 09:00 - 21:00',
            instagramUrl: 'https://instagram.com/nobleblade_barber',
            telegramUrl: 'https://t.me/nobleblade_uz',
            description: 'Erkaklar uchun oliy toifadagi barbershop xizmatlari. Zamonaviy qulaylik va mutaxassis ustalar.',
          },
        });
      }

      res.json({ success: true, settings });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ADMIN: Update barbershop settings
   */
  public static async adminUpdateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = shopSettingsSchema.partial().parse(req.body);

      let settings = await prisma.shopSettings.findFirst();
      if (settings) {
        settings = await prisma.shopSettings.update({
          where: { id: settings.id },
          data: {
            shopName: data.shopName || settings.shopName,
            logo: (data.logo !== undefined && data.logo !== null) ? data.logo : settings.logo,
            address: (data.address !== undefined && data.address !== null) ? data.address : settings.address,
            phone: (data.phone !== undefined && data.phone !== null) ? data.phone : settings.phone,
            yandexMapsUrl: (data.yandexMapsUrl !== undefined && data.yandexMapsUrl !== null) ? data.yandexMapsUrl : settings.yandexMapsUrl,
            googleMapsUrl: data.googleMapsUrl,
            openingHours: (data.openingHours !== undefined && data.openingHours !== null) ? data.openingHours : settings.openingHours,
            instagramUrl: data.instagramUrl,
            telegramUrl: data.telegramUrl,
            description: data.description,
            eskizEmail: data.eskizEmail !== undefined ? data.eskizEmail : settings.eskizEmail,
            eskizPassword: data.eskizPassword !== undefined ? data.eskizPassword : settings.eskizPassword,
            smsEnabled: data.smsEnabled !== undefined ? data.smsEnabled : settings.smsEnabled,
          },
        });
      } else {
        settings = await prisma.shopSettings.create({
          data: {
            shopName: data.shopName || 'THE NOBLE BLADE',
            logo: data.logo || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&auto=format&fit=crop&q=80',
            address: data.address || "Toshkent shahar, Mirobod tumani, Amir Temur shoh ko'chasi, 42-uy",
            phone: data.phone || '+998 90 123 45 67',
            yandexMapsUrl: data.yandexMapsUrl || 'https://yandex.com/maps',
            googleMapsUrl: data.googleMapsUrl,
            openingHours: data.openingHours || '09:00 — 21:00',
            instagramUrl: data.instagramUrl,
            telegramUrl: data.telegramUrl,
            description: data.description,
            eskizEmail: data.eskizEmail || null,
            eskizPassword: data.eskizPassword || null,
            smsEnabled: data.smsEnabled !== undefined ? data.smsEnabled : true,
          },
        });
      }

      res.json({
        success: true,
        message: 'Barbershop sozlamalari yangilandi',
        settings,
      });
    } catch (error) {
      next(error);
    }
  }
}
