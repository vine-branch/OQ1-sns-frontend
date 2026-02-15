"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, parse } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import * as React from "react";

export interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "날짜 선택",
  disabled,
  className,
  error,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const date = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;

  const handleSelect = (d: Date | undefined) => {
    onChange?.(d ? format(d, "yyyy-MM-dd") : "");
    if (d) setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-10 px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-50",
            !date && "text-gray-400",
            error && "border-red-300 focus:ring-red-400",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {date ? format(date, "yyyy년 M월 d일", { locale: ko }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 rounded-lg border border-gray-200 bg-white shadow-sm"
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          defaultMonth={date ?? new Date(1980, 0, 1)}
          startMonth={new Date(1900, 0, 1)}
          endMonth={new Date()}
          captionLayout="dropdown"
          disabled={(d) => d > new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}
