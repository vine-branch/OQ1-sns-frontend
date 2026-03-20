"use client";

import {
  addMonthsToDate,
  formatDateToStr,
  getDayOfMonth,
  getDayOfWeek,
  getEndOfMonth,
  getNow,
  getStartOfMonth,
  isSameDayCheck,
  parseDate,
  subMonthsFromDate,
} from "@/lib/utils";
import { Calendar, ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { useMemo, useState } from "react";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface ActivityCalendarProps {
  completedDates?: string[]; // 'YYYY-MM-DD' format
  streak?: number;
}

const ActivityCalendar = ({
  completedDates = [],
  streak = 0,
}: ActivityCalendarProps) => {
  const now = getNow();
  const [viewDate, setViewDate] = useState(() => now);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  const activitySet = useMemo(() => new Set(completedDates), [completedDates]);

  const goPrev = () => setViewDate((d) => subMonthsFromDate(d, 1));
  const goNext = () => setViewDate((d) => addMonthsToDate(d, 1));
  const title = `${year}년 ${month + 1}월`;

  // 한 번의 루프로 주 그리드, 날짜별 데이터, 통계를 모두 계산
  const { weeks, dayData, totalCompleted, monthMaxStreak, completionPercent } = useMemo(() => {
    const firstDay = getStartOfMonth(viewDate);
    const lastDay = getEndOfMonth(viewDate);
    const startWeekday = getDayOfWeek(firstDay);
    const daysInMonth = getDayOfMonth(lastDay);

    // 주 그리드 생성
    const weeks: (number | null)[][] = [];
    let week: (number | null)[] = [];
    for (let i = 0; i < startWeekday; i++) week.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      week.push(d);
      if (week.length === 7) { weeks.push(week); week = []; }
    }
    if (week.length) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }

    // 날짜별 데이터 + 통계를 단일 루프로 계산
    const dayData = new Map<number, { dateStr: string; isSunday: boolean; completed: boolean; date: Date }>();
    let completedWeekdays = 0;
    let weekdaysInMonth = 0;
    let totalCompleted = 0;
    let monthMaxStreak = 0;
    let currentRun = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const date = parseDate(`${year}-${month + 1}-${d}`);
      const dateStr = formatDateToStr(date);
      const isSunday = getDayOfWeek(date) === 0;
      const completed = activitySet.has(dateStr);

      dayData.set(d, { dateStr, isSunday, completed, date });

      if (completed) totalCompleted++;
      if (!isSunday) {
        weekdaysInMonth++;
        if (completed) completedWeekdays++;
      }
      if (completed) {
        currentRun++;
        monthMaxStreak = Math.max(monthMaxStreak, currentRun);
      } else if (isSunday && currentRun > 0) {
        currentRun++;
        monthMaxStreak = Math.max(monthMaxStreak, currentRun);
      } else {
        currentRun = 0;
      }
    }

    const completionPercent = weekdaysInMonth > 0
      ? Math.round((completedWeekdays / weekdaysInMonth) * 100)
      : 0;

    return { weeks, dayData, totalCompleted, monthMaxStreak, completionPercent };
  }, [viewDate, year, month, activitySet]);

  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (completionPercent / 100) * circumference;

  return (
    <div className="w-full">
      {/* 월 네비 + 캘린더 - 가로 꽉, 세로 압축 */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={goPrev}
          className="flex items-center justify-center w-7 h-7 rounded-full text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
          aria-label="이전 달"
        >
          <ChevronLeft size={16} strokeWidth={2} />
        </button>
        <span className="text-xs font-bold text-gray-900 tabular-nums">
          {title}
        </span>
        <button
          type="button"
          onClick={goNext}
          className="flex items-center justify-center w-7 h-7 rounded-full text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
          aria-label="다음 달"
        >
          <ChevronRight size={16} strokeWidth={2} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0 mb-1">
        {WEEKDAYS.map((day) => (
          <div key={day} className="flex justify-center">
            <span className={`text-[9px] ${day === "일" ? "text-purple-400 font-semibold" : "text-gray-400"}`}>{day}</span>
          </div>
        ))}
      </div>

      <div
        className="grid grid-cols-7 gap-y-1 gap-x-0"
        style={{ gridAutoRows: "minmax(20px, 1fr)" }}
      >
        {weeks.flat().map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="min-w-0" />;
          }
          const data = dayData.get(day)!;
          const isToday = isSameDayCheck(data.date, now);

          const bgClass =
            data.isSunday && data.completed ? "bg-pink-200 text-pink-900"
            : data.isSunday ? "bg-purple-50 text-purple-400"
            : data.completed ? "bg-pink-200 text-pink-900"
            : "bg-gray-100 text-gray-400";

          const todayRing = isToday
            ? "ring-2 ring-pink-500 ring-offset-1 ring-offset-white"
            : "";

          return (
            <div
              key={`${year}-${month}-${day}`}
              className="flex items-center justify-center min-w-0 p-0.5"
            >
              <div
                className={`relative aspect-square w-full max-w-7 rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors ${bgClass} ${todayRing}`}
                title={
                  data.isSunday
                    ? `${data.dateStr} (주일 Free Pass${data.completed ? " + QT 완료" : ""})`
                    : data.dateStr
                }
              >
                {day}
                {data.isSunday && (
                  <span className="absolute text-[8px] font-black text-emerald-500/70 rotate-[-25deg] tracking-tight select-none pointer-events-none border border-emerald-400/60 rounded-sm px-0.5 leading-tight">
                    PASS
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 하단 통계 - 패딩·아이콘 축소 */}
      <div className="grid grid-cols-3 gap-2 pt-2 mt-2 border-t border-gray-100">
        <div className="flex flex-col items-center text-center">
          <Trophy className="text-amber-500 shrink-0 mb-0.5" size={14} />
          <span className="text-[9px] text-gray-500">
            {isCurrentMonth ? "현재 연속" : `${month + 1}월 최대 연속`}
          </span>
          <span className="text-xs font-bold text-gray-900">
            {isCurrentMonth ? streak : monthMaxStreak}일
          </span>
        </div>
        <div className="flex flex-col items-center text-center">
          <Calendar className="text-pink-500 shrink-0 mb-0.5" size={14} />
          <span className="text-[9px] text-gray-500">
            {isCurrentMonth ? "이번 달" : `${month + 1}월 총 횟수`}
          </span>
          <span className="text-xs font-bold text-gray-900">
            {totalCompleted}회
          </span>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r={radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="4"
              />
              <circle
                cx="18"
                cy="18"
                r={radius}
                fill="none"
                stroke="#ec4899"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={circumference - strokeDash}
                style={{
                  transition: "stroke-dashoffset 0.6s ease-out",
                }}
              />
            </svg>
            <span className="absolute text-xs font-bold text-gray-800 tabular-nums">
              {completionPercent}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCalendar;
