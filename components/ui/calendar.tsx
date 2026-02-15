'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { ko } from 'react-day-picker/locale';
import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, ...props }: CalendarProps) {
  return (
    <DayPicker
      locale={ko}
      className={cn('rdp-root p-4 text-gray-900', className)}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
