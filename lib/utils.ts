import { clsx, type ClassValue } from "clsx";
import {
  addMonths,
  differenceInHours,
  endOfMonth,
  format,
  formatDistanceToNow,
  getDate,
  getDay,
  isSameDay,
  isToday,
  isYesterday,
  startOfMonth,
  startOfToday,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import { ko } from "date-fns/locale";
import sanitizeHtml from "sanitize-html";
import { twMerge } from "tailwind-merge";

export function formatDate(
  date: string | Date | undefined,
  formatStr: string = "PPP",
): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  if (isToday(d)) return "오늘";
  if (isYesterday(d)) return "어제";

  return format(d, formatStr, { locale: ko });
}

export function formatDateToStr(
  date: string | Date | number,
  formatStr: string = "yyyy-MM-dd",
): string {
  return format(parseDate(date), formatStr);
}

export function isSameDayCheck(d1: string | Date, d2: string | Date): boolean {
  return isSameDay(new Date(d1), new Date(d2));
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitize text to prevent XSS attacks.
 * Removes all HTML tags by default.
 */
export function sanitizeText(text: string): string {
  return sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}

/**
 * Replace literal \n strings with actual newline characters.
 */
export function formatLineBreaks(text: string | null | undefined): string {
  if (!text) return "";
  return text.split("\\n").join("\n");
}

export function formatRelativeTime(date: string | Date | undefined): string {
  if (!date) return "";
  const past = new Date(date);

  // Check if the date is invalid
  if (isNaN(past.getTime())) {
    return "";
  }

  return formatDistanceToNow(past, { addSuffix: true, locale: ko });
}

export function getNow(): Date {
  return new Date();
}

export function parseDate(date: string | Date | number): Date {
  const d = new Date(date);
  return isNaN(d.getTime()) ? new Date() : d;
}

export function getTodayStr(): string {
  return format(getNow(), "yyyy-MM-dd");
}

export function getDiffHours(d1: Date, d2: Date): number {
  return Math.abs(differenceInHours(d1, d2));
}

export function subtractDays(date: Date, days: number): Date {
  return subDays(date, days);
}

export function subtractYears(date: Date, years: number): Date {
  return subYears(date, years);
}

export function getStartOfToday(): Date {
  return startOfToday();
}

export function addMonthsToDate(date: Date, months: number): Date {
  return addMonths(date, months);
}

export function subMonthsFromDate(date: Date, months: number): Date {
  return subMonths(date, months);
}

export function getStartOfMonth(date: Date): Date {
  return startOfMonth(date);
}

export function getEndOfMonth(date: Date): Date {
  return endOfMonth(date);
}

export function getDayOfWeek(date: Date): number {
  return getDay(date);
}

export function getDayOfMonth(date: Date): number {
  return getDate(date);
}

// 개발 중인 기능 등을 환경/상황에 따라 제어하기 위한 피처 플래그 함수
export type FeatureFlag = "photoUpload" | "tags" | "sharePost";

export function isFeatureEnabled(feature: FeatureFlag): boolean {
  const featureConfig: Record<FeatureFlag, boolean> = {
    photoUpload: false, // 아직 개발 중이므로 false
    tags: false, // 아직 개발 중이므로 false
    sharePost: false, // TODO: 공유 기능 개발 필요
  };

  return featureConfig[feature] ?? false;
}
