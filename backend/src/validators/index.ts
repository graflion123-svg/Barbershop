import { z } from 'zod';

export const customerAuthSchema = z.object({
  fullName: z.string().min(2, "Ism va familiya kamida 2 ta belgidan iborat bo'lishi kerak"),
  phone: z.string().min(7, "Telefon raqami to'liq kiritilishi kerak").regex(/^[+]?[0-9\s-]{7,20}$/, "Telefon raqami formati noto'g'ri"),
});

export const adminLoginSchema = z.object({
  email: z.string().email("Yaroqli email manzilini kiriting"),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
});

export const getAvailableTimesSchema = z.object({
  barberId: z.string().uuid("Yaroqli barber ID kiritilishi kerak"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Sana formati YYYY-MM-DD bo'lishi kerak"),
  peopleCount: z.coerce.number().int().min(1, "Kamida 1 kishi bo'lishi kerak").max(5, "Ko'pi bilan 5 kishi bo'lishi mumkin").default(1),
});

export const createBookingSchema = z.object({
  barberId: z.string().uuid("Yaroqli barber ID tanlanishi kerak"),
  serviceId: z.string().uuid("Yaroqli xizmat tanlanishi kerak"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Sana formati YYYY-MM-DD bo'lishi kerak"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Vaqt formati HH:mm bo'lishi kerak"),
  peopleCount: z.coerce.number().int().min(1).max(5).default(1),
  fullName: z.string().min(2, "Mijoz ismi kiritilishi kerak"),
  phone: z.string().min(7, "Telefon raqami kiritilishi kerak"),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'], {
    errorMap: () => ({ message: "Status faqat PENDING, CONFIRMED, COMPLETED yoki CANCELLED bo'lishi mumkin" }),
  }),
});

export const barberSchema = z.object({
  fullName: z.string().min(2, "Barber ismi kiritilishi kerak"),
  phone: z.string().min(7, "Telefon raqami kiritilishi kerak"),
  image: z.string().url("Profil rasmi URL bo'lishi kerak").or(z.string().min(1)),
  experience: z.string().min(1, "Tajriba kiritilishi kerak"),
  description: z.string().min(5, "Tavsif kiritilishi kerak"),
  isActive: z.boolean().optional().default(true),
});

export const serviceSchema = z.object({
  name: z.string().min(2, "Xizmat nomi kiritilishi kerak"),
  description: z.string().min(5, "Xizmat tavsifi kiritilishi kerak"),
  image: z.string().min(1, "Xizmat rasmi kiritilishi kerak"),
  price: z.coerce.number().positive("Narx musbat son bo'lishi kerak"),
  duration: z.coerce.number().int().min(15).default(45),
  category: z.string().min(1).default("Soch va Soqol"),
  isActive: z.boolean().optional().default(true),
});

export const scheduleItemSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  breakStart: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  breakEnd: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  isWorking: z.boolean(),
});

export const updateScheduleSchema = z.object({
  schedules: z.array(scheduleItemSchema),
});

export const barberDayOffSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().optional().nullable(),
});

export const shopSettingsSchema = z.object({
  shopName: z.string().min(2),
  logo: z.string().min(1),
  address: z.string().min(5),
  phone: z.string().min(7),
  yandexMapsUrl: z.string().url(),
  googleMapsUrl: z.string().url().optional().nullable(),
  openingHours: z.string().min(3),
  instagramUrl: z.string().optional().nullable(),
  telegramUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});
