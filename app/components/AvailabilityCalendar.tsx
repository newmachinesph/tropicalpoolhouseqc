"use client";

import { useEffect, useState, useMemo } from "react";

interface Period {
  start: string;
  end: string;
  available: number;
}

interface AvailabilityData {
  property_id: number;
  room_type_id: number;
  periods: Period[];
}

interface AvailabilityCalendarProps {
  propertyId: number;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatMonthYear(year: number, month: number): string {
  return new Date(year, month).toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  });
}

export default function AvailabilityCalendar({
  propertyId,
}: AvailabilityCalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [availability, setAvailability] = useState<Map<string, boolean>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAvailability() {
      setLoading(true);
      try {
        // Fetch 2 months of data
        const start = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`;
        const endDate = new Date(currentYear, currentMonth + 2, 0);
        const end = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

        const res = await fetch(
          `/api/lodgify/availability?propertyId=${propertyId}&start=${start}&end=${end}`
        );
        if (!res.ok) throw new Error("Failed");
        const data: AvailabilityData[] = await res.json();

        const map = new Map<string, boolean>();
        if (data?.[0]?.periods) {
          for (const period of data[0].periods) {
            const startDate = new Date(period.start);
            const endDate = new Date(period.end);
            for (
              let d = new Date(startDate);
              d <= endDate;
              d.setDate(d.getDate() + 1)
            ) {
              const key = d.toISOString().split("T")[0];
              map.set(key, period.available === 1);
            }
          }
        }
        setAvailability(map);
      } catch {
        setAvailability(new Map());
      } finally {
        setLoading(false);
      }
    }
    fetchAvailability();
  }, [propertyId, currentMonth, currentYear]);

  const daysInMonth = useMemo(
    () => getDaysInMonth(currentYear, currentMonth),
    [currentYear, currentMonth]
  );
  const firstDay = useMemo(
    () => getFirstDayOfWeek(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const prevMonth = () => {
    const prev = new Date(currentYear, currentMonth - 1);
    // Don't go before current month
    if (prev >= new Date(today.getFullYear(), today.getMonth())) {
      setCurrentMonth(prev.getMonth());
      setCurrentYear(prev.getFullYear());
    }
  };

  const nextMonth = () => {
    const next = new Date(currentYear, currentMonth + 1);
    // Don't go more than 9 months ahead
    const max = new Date(today.getFullYear(), today.getMonth() + 9);
    if (next <= max) {
      setCurrentMonth(next.getMonth());
      setCurrentYear(next.getFullYear());
    }
  };

  const todayStr = today.toISOString().split("T")[0];

  return (
    <div className="rounded-2xl bg-white border border-cream-200 p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-serif text-lg font-semibold text-sage-800">
          Availability
        </h3>
        <div className="flex items-center gap-x-2">
          <button
            onClick={prevMonth}
            className="size-8 rounded-full flex items-center justify-center text-sage-600 hover:bg-sage-50 transition-colors"
          >
            <svg
              className="size-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span className="text-sm font-medium text-sage-700 min-w-[140px] text-center">
            {formatMonthYear(currentYear, currentMonth)}
          </span>
          <button
            onClick={nextMonth}
            className="size-8 rounded-full flex items-center justify-center text-sage-600 hover:bg-sage-50 transition-colors"
          >
            <svg
              className="size-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-[10px] font-medium uppercase tracking-wider text-cream-400 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before the 1st */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isAvailable = availability.get(dateStr);
          const isPast = dateStr < todayStr;
          const isToday = dateStr === todayStr;

          return (
            <div
              key={day}
              className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                loading
                  ? "bg-cream-100 animate-pulse text-transparent"
                  : isPast
                  ? "text-cream-300 bg-cream-50"
                  : isAvailable === true
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : isAvailable === false
                  ? "bg-rose-50 text-rose-400 line-through"
                  : "text-sage-600"
              } ${isToday ? "ring-2 ring-sage-400 ring-offset-1" : ""}`}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-x-4 text-[10px] uppercase tracking-wider text-cream-500">
        <span className="flex items-center gap-x-1.5">
          <span className="size-2.5 rounded-sm bg-emerald-100 border border-emerald-300" />
          Available
        </span>
        <span className="flex items-center gap-x-1.5">
          <span className="size-2.5 rounded-sm bg-rose-100 border border-rose-300" />
          Booked
        </span>
        <span className="flex items-center gap-x-1.5">
          <span className="size-2.5 rounded-sm ring-2 ring-sage-400" />
          Today
        </span>
      </div>
    </div>
  );
}
