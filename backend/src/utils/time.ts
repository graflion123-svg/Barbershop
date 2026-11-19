import { format, parseISO, isBefore, startOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { config } from '../config';

/**
 * Convert "HH:mm" to total minutes from midnight (0 to 1439)
 */
export function timeStringToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes from midnight to "HH:mm" format
 */
export function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Check if two time intervals [start1, end1) and [start2, end2) overlap
 */
export function doIntervalsOverlap(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean {
  return Math.max(start1, start2) < Math.min(end1, end2);
}

/**
 * Get current date and time in Asia/Tashkent timezone
 */
export function getNowInTashkent(): Date {
  return toZonedTime(new Date(), config.timezone);
}

/**
 * Check if the given date and start time is in the past (Tashkent timezone)
 */
export function isSlotInPast(dateStr: string, timeStr: string): boolean {
  const now = getNowInTashkent();
  const todayStr = format(now, 'yyyy-MM-dd');

  if (dateStr < todayStr) {
    return true;
  }

  if (dateStr === todayStr) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const slotMinutes = timeStringToMinutes(timeStr);
    return slotMinutes <= currentMinutes;
  }

  return false;
}
