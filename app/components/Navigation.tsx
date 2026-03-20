"use client";

import { EVENT_CHALLENGE } from "@/app/constants";
import { getNow } from "@/lib/utils";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { Home, PlusSquare, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Mobile Bottom Navigation Component
export const BottomNav = () => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex justify-around items-center z-50 md:hidden pb-safe">
      <Link
        href="/"
        className="flex flex-col items-center justify-center w-full h-full"
      >
        <Home
          size={26}
          strokeWidth={isActive("/") ? 2.5 : 1.5}
          className={isActive("/") ? "text-black" : "text-gray-500"}
        />
      </Link>
      <Link
        href="/upload"
        className="flex flex-col items-center justify-center w-full h-full"
      >
        <PlusSquare
          size={26}
          strokeWidth={isActive("/upload") ? 2.5 : 1.5}
          className={isActive("/upload") ? "text-black" : "text-gray-500"}
        />
      </Link>
      <Link
        href="/mypage"
        className="flex flex-col items-center justify-center w-full h-full"
      >
        <User
          size={26}
          strokeWidth={isActive("/mypage") ? 2.5 : 1.5}
          className={isActive("/mypage") ? "text-black" : "text-gray-500"}
        />
      </Link>
    </nav>
  );
};

// Desktop Sidebar Component
export const Sidebar = () => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-40 p-6">
      <Link
        href="/"
        className="flex items-center gap-2 mb-10 hover:opacity-80 transition-opacity"
      >
        <h1 className="text-2xl font-bold tracking-tight italic font-serif">
          OQ1
        </h1>
      </Link>

      <nav className="space-y-4">
        <Link
          href="/"
          className={`flex items-center gap-4 px-2 py-3 rounded-lg transition-colors group`}
        >
          <Home
            size={24}
            strokeWidth={isActive("/") ? 2.5 : 1.5}
            className={`group-hover:scale-105 transition-transform ${isActive("/") ? "text-black" : "text-black"}`}
          />
          <span
            className={`text-base ${isActive("/") ? "font-bold" : "font-normal"}`}
          >
            홈
          </span>
        </Link>
        <Link
          href="/upload"
          className={`flex items-center gap-4 px-2 py-3 rounded-lg transition-colors group`}
        >
          <PlusSquare
            size={24}
            strokeWidth={isActive("/upload") ? 2.5 : 1.5}
            className={`group-hover:scale-105 transition-transform ${isActive("/upload") ? "text-black" : "text-black"}`}
          />
          <span
            className={`text-base ${isActive("/upload") ? "font-bold" : "font-normal"}`}
          >
            큐티 작성
          </span>
        </Link>
        <Link
          href="/mypage"
          className={`flex items-center gap-4 px-2 py-3 rounded-lg transition-colors group`}
        >
          <User
            size={24}
            strokeWidth={isActive("/mypage") ? 2.5 : 1.5}
            className={`group-hover:scale-105 transition-transform ${isActive("/mypage") ? "text-black" : "text-black"}`}
          />
          <span
            className={`text-base ${isActive("/mypage") ? "font-bold" : "font-normal"}`}
          >
            프로필
          </span>
        </Link>
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-100">
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200/80">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
            Upcoming Event
          </p>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {EVENT_CHALLENGE.name}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {format(parseISO(EVENT_CHALLENGE.startDate), "yyyy.MM.dd(E)", { locale: ko })} ~ {format(parseISO(EVENT_CHALLENGE.endDate), "MM.dd(E)", { locale: ko })}
          </p>
          <div className="mt-2 flex justify-between items-end">
            <span className="text-lg font-bold text-gray-900" suppressHydrationWarning>
              {(() => {
                const now = getNow();
                const start = parseISO(EVENT_CHALLENGE.startDate);
                const end = parseISO(EVENT_CHALLENGE.endDate);
                const daysToStart = differenceInCalendarDays(start, now);
                const daysToEnd = differenceInCalendarDays(end, now);

                if (daysToStart > 0) return `D-${daysToStart}`;
                if (daysToEnd >= 0) return "진행중";
                return `D+${Math.abs(daysToEnd)}`;
              })()}
            </span>
            <span className="text-xs text-gray-400">함께해요!</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
