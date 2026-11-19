import { Request } from 'express';

export interface AdminPayload {
  id: string;
  email: string;
  role: string;
}

export interface UserPayload {
  id: string;
  phone: string;
  fullName: string;
}

export interface AuthenticatedRequest extends Request {
  admin?: AdminPayload;
  user?: UserPayload;
}

export interface TimeSlot {
  startTime: string; // "14:00"
  endTime: string;   // "15:30"
  available: boolean;
}

export interface DaySchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart?: string | null;
  breakEnd?: string | null;
  isWorking: boolean;
}
