"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { EVENT_CHALLENGE } from "../constants";
import { getNow } from "@/lib/utils";

interface MobileHeaderProps {
  rightContent?: React.ReactNode;
  leftContent?: React.ReactNode;
  showLogo?: boolean;
}

function getEventDDay(startDate: string, endDate: string) {
  const now = getNow();
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const daysToStart = differenceInCalendarDays(start, now);
  const daysToEnd = differenceInCalendarDays(end, now);

  if (daysToStart > 0) return `D-${daysToStart}`;
  if (daysToEnd >= 0) return "진행중";
  return `D+${Math.abs(daysToEnd)}`;
}

function formatEventDate(dateStr: string) {
  return format(parseISO(dateStr), "yyyy.MM.dd(E)", { locale: ko });
}

export function MobileHeader({
  rightContent,
  leftContent,
  showLogo = true,
}: MobileHeaderProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [showEvent, setShowEvent] = useState(false);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (isHome) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const dDayLabel = getEventDDay(EVENT_CHALLENGE.startDate, EVENT_CHALLENGE.endDate);

  return (
    <>
      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 h-14 flex justify-between items-center">
        <div className="flex items-center">
          {leftContent}
          {showLogo && (
            <Link href="/" onClick={handleLogoClick}>
              <h1 className="text-xl font-bold italic font-serif tracking-tight">
                OQ1
              </h1>
            </Link>
          )}
        </div>
        <div className="flex items-center gap-4">
          {rightContent || (
            <button
              onClick={() => setShowEvent(true)}
              className="text-xs font-bold bg-gray-100 px-2 py-1 rounded-md text-gray-600"
            >
              {dDayLabel}
            </button>
          )}
        </div>
      </div>

      <Dialog open={showEvent} onOpenChange={setShowEvent}>
        <DialogContent className="max-w-[300px] p-0 overflow-hidden gap-0 border-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Upcoming Event</DialogTitle>
          </DialogHeader>
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
              Upcoming Event
            </p>
            <p className="text-[15px] font-bold mt-2 leading-snug">
              {EVENT_CHALLENGE.name}
            </p>
          </div>
          <div className="px-6 py-5 flex items-end justify-between bg-white">
            <div>
              <span className="text-3xl font-black tracking-tight text-gray-900">
                {dDayLabel}
              </span>
              <p className="text-[11px] text-gray-400 mt-1">
                {formatEventDate(EVENT_CHALLENGE.startDate)} ~ {formatEventDate(EVENT_CHALLENGE.endDate)}
              </p>
            </div>
            <span className="text-xs font-medium text-gray-400">
              함께해요!
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
