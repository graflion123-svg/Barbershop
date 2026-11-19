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

      const existing = await prisma.shopSettings.findFirst();
      const id = existing?.id || 'default';

      const updated = await prisma.shopSettings.upsert({
        where: { id },
        create: {
          id: 'default',
          shopName: data.shopName || 'THE NOBLE BLADE',
          logo: data.logo || '/images/logo.png',
          address: data.address || 'Toshkent sh., Amir Temur ko\'chasi 42',
          phone: data.phone || '+998 90 123 45 67',
          yandexMapsUrl: data.yandexMapsUrl || 'https://yandex.com/maps',
          googleMapsUrl: data.googleMapsUrl,
          openingHours: data.openingHours || '09:00 - 21:00',
          instagramUrl: data.instagramUrl,
          telegramUrl: data.telegramUrl,
          description: data.description,
        },
        update: data,
      });

      res.json({
        success: true,
        message: 'Barbershop sozlamalari yangilandi',
        settings: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
