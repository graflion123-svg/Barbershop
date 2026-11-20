export interface User {
  id: string;
  fullName: string;
  phone: string;
  createdAt?: string;
  visitsCount?: number;
}

export interface Admin {
  id: string;
  email: string;
  role: string;
}

export interface BarberSchedule {
  id: string;
  barberId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart?: string | null;
  breakEnd?: string | null;
  isWorking: boolean;
}

export interface BarberDayOff {
  id: string;
  barberId: string;
  date: string;
  reason?: string | null;
}

export interface Barber {
  id: string;
  fullName: string;
  phone: string;
  image: string;
  experience: string;
  description: string;
  isActive: boolean;
  schedules?: BarberSchedule[];
  daysOff?: BarberDayOff[];
  _count?: {
    bookings: number;
  };
}

export interface Service {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  duration: number;
  category: string;
  isActive: boolean;
  _count?: {
    bookings: number;
  };
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Booking {
  id: string;
  userId: string;
  barberId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  peopleCount: number;
  totalDuration: number;
  totalPrice: number;
  status: BookingStatus;
  reminderSent?: boolean;
  createdAt: string;
  user: User;
  barber: Barber;
  service: Service;
}

export interface ShopSettings {
  id: string;
  shopName: string;
  logo: string;
  address: string;
  phone: string;
  yandexMapsUrl: string;
  googleMapsUrl?: string | null;
  openingHours: string;
  instagramUrl?: string | null;
  telegramUrl?: string | null;
  description?: string | null;
  eskizEmail?: string | null;
  eskizPassword?: string | null;
  smsEnabled?: boolean;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}
