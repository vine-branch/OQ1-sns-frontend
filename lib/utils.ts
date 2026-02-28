import { clsx, type ClassValue } from "clsx";
import {
  format,
  formatDistanceToNow,
  isSameDay,
  isToday,
  isYesterday,
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

export function formatRelativeTime(date: string | Date | undefined): string {
  if (!date) return "";
  const past = new Date(date);

  // Check if the date is invalid
  if (isNaN(past.getTime())) {
    return "";
  }

  return formatDistanceToNow(past, { addSuffix: true, locale: ko });
}

export function getTodayStr(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 개발 중인 기능 등을 환경/상황에 따라 제어하기 위한 피처 플래그 함수
export type FeatureFlag = "photoUpload" | "tags" | "rewardStats";

export function isFeatureEnabled(feature: FeatureFlag): boolean {
  const featureConfig: Record<FeatureFlag, boolean> = {
    photoUpload: false, // 아직 개발 중이므로 false
    tags: false, // 아직 개발 중이므로 false
    rewardStats: false, // 개발 중이므로 잠시 가림
  };

  return featureConfig[feature] ?? false;
}
