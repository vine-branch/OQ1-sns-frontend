import { clsx, type ClassValue } from "clsx";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import sanitizeHtml from "sanitize-html";
import { twMerge } from "tailwind-merge";

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
