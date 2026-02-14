'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Trophy } from 'lucide-react';
import { CURRENT_USER } from '../constants';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 서버/클라이언트 동일 결과를 위해 결정적(시드 기반) 데이터 사용. 레퍼런스 색상: 무활동=회색, 활동=연한핑크→진한핑크
const SEED = 12345;
const deterministicIntensity = (year: number, month: number, day: number): number => {
  const n = (year * 31 + month) * 31 + day + SEED;
  const h = (n * 2654435761) >>> 0;
  if ((h % 100) < 40) return 0;
  return (h % 3) + 1;
};

const getCompletedDaysForMonth = (year: number, month: number): Map<string, number> => {
  const map = new Map<string, number>();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const intensity = deterministicIntensity(year, month, d);
    if (intensity > 0) map.set(`${year}-${month}-${d}`, intensity);
  }
  return map;
};

const ActivityCalendar = () => {
  const [viewDate, setViewDate] = useState(() => new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const activityMap = useMemo(() => getCompletedDaysForMonth(year, month), [year, month]);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) week.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  const getIntensity = (day: number) => activityMap.get(`${year}-${month}-${day}`) ?? 0;

  const goPrev = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1));
  const goNext = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1));
  const title = `${year}년 ${month + 1}월`;

  const totalDaysThisMonth = useMemo(
    () => Array.from(activityMap.values()).filter((v) => v > 0).length,
    [activityMap]
  );

  const completionPercent = useMemo(
    () => (daysInMonth > 0 ? Math.round((totalDaysThisMonth / daysInMonth) * 100) : 0),
    [totalDaysThisMonth, daysInMonth]
  );

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
        <span className="text-xs font-bold text-gray-900 tabular-nums">{title}</span>
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
            <span className="text-[9px] text-gray-400">{day}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 gap-x-0" style={{ gridAutoRows: 'minmax(20px, 1fr)' }}>
        {weeks.flat().map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="min-w-0" />;
          }
          const intensity = getIntensity(day);
          const isToday =
            day === new Date().getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear();

          const bgClass =
            intensity === 0
              ? 'bg-gray-100 text-gray-400'
              : intensity === 1
                ? 'bg-pink-200 text-pink-900'
                : intensity === 2
                  ? 'bg-pink-400 text-white'
                  : 'bg-pink-600 text-white';

          return (
            <div key={`${year}-${month}-${day}`} className="flex items-center justify-center min-w-0 p-0.5">
              <div
                className={`aspect-square w-full max-w-[28px] rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors ${bgClass} ${isToday ? 'ring-2 ring-pink-500 ring-offset-1 ring-offset-white' : ''}`}
                title={new Date(year, month, day).toLocaleDateString('ko-KR')}
              >
                {day}
              </div>
            </div>
          );
        })}
      </div>

      {/* 하단 통계 - 패딩·아이콘 축소 */}
      <div className="grid grid-cols-3 gap-2 pt-2 mt-2 border-t border-gray-100">
        <div className="flex flex-col items-center text-center">
          <Trophy className="text-amber-500 shrink-0 mb-0.5" size={14} />
          <span className="text-[9px] text-gray-500">현재 연속</span>
          <span className="text-xs font-bold text-gray-900">{CURRENT_USER.streak}일</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <Calendar className="text-pink-500 shrink-0 mb-0.5" size={14} />
          <span className="text-[9px] text-gray-500">이번 달</span>
          <span className="text-xs font-bold text-gray-900">{totalDaysThisMonth}회</span>
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
                  transition: 'stroke-dashoffset 0.6s ease-out',
                }}
              />
            </svg>
            <span className="absolute text-xs font-bold text-gray-800 tabular-nums">{completionPercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCalendar;
