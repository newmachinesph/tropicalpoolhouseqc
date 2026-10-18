"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCurrency } from "./CurrencyContext";
import { PROPERTIES } from "../../lib/constants";

interface SearchResult {
  id: number;
  name: string;
  href: string;
  available: boolean;
  reason: string | null;
  maxPeople: number;
  bedrooms: number | null;
  bathrooms: number | null;
  image: string | null;
  total: number | null;
  currency: string;
  securityDeposit: number;
  payments: { type: string; date_due: string; amount: number }[];
  roomTypeId: number;
  images: string[];
  amenities: string[];
  description: string;
}

/* ── helpers ── */

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getTomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function getDayAfterStr(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

// Removed local formatPrice — using CurrencyContext instead

function getNights(arrival: string, departure: string): number {
  const a = new Date(arrival);
  const b = new Date(departure);
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86400000));
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface AvailPeriod {
  start: string;
  end: string;
  available: number;
}

/* ── component ── */

export default function BookingSearch() {
  const { formatPrice } = useCurrency();
  const todayStr = new Date().toISOString().split("T")[0];
  const now = new Date();

  const [arrival, setArrival] = useState(getTomorrowStr());
  const [departure, setDeparture] = useState(
    getDayAfterStr(getTomorrowStr())
  );
  const [guests, setGuests] = useState(2);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Calendar state
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectingCheckout, setSelectingCheckout] = useState(false);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Availability: per-date availability for both properties
  const [dateAvail, setDateAvail] = useState<
    Map<string, { poolhouse: boolean; caveroom: boolean }>
  >(new Map());

  // Fetch availability when calendar month changes
  useEffect(() => {
    let cancelled = false;

    async function fetchAvail() {
      const start = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-01`;
      const endDay = new Date(calYear, calMonth + 1, 0);
      const end = `${endDay.getFullYear()}-${String(endDay.getMonth() + 1).padStart(2, "0")}-${String(endDay.getDate()).padStart(2, "0")}`;

      try {
        const [r1, r2] = await Promise.all([
          fetch(
            `/api/lodgify/availability?propertyId=${PROPERTIES[0].id}&start=${start}&end=${end}`
          ),
          fetch(
            `/api/lodgify/availability?propertyId=${PROPERTIES[1].id}&start=${start}&end=${end}`
          ),
        ]);
        if (!r1.ok || !r2.ok || cancelled) return;
        const d1 = await r1.json();
        const d2 = await r2.json();
        if (cancelled) return;

        const map = new Map<
          string,
          { poolhouse: boolean; caveroom: boolean }
        >();

        const processPeriods = (
          data: { periods?: AvailPeriod[] }[],
          key: "poolhouse" | "caveroom"
        ) => {
          if (!data?.[0]?.periods) return;
          for (const period of data[0].periods) {
            const s = new Date(period.start);
            const e = new Date(period.end);
            for (
              let d = new Date(s);
              d <= e;
              d.setDate(d.getDate() + 1)
            ) {
              const k = d.toISOString().split("T")[0];
              const existing = map.get(k) || {
                poolhouse: true,
                caveroom: true,
              };
              existing[key] = period.available === 1;
              map.set(k, existing);
            }
          }
        };

        processPeriods(d1, "poolhouse");
        processPeriods(d2, "caveroom");
        setDateAvail(map);
      } catch {
        // silently fail — calendar still works, just without availability dots
      }
    }

    fetchAvail();
    return () => {
      cancelled = true;
    };
  }, [calYear, calMonth]);

  // Month navigation
  const canGoPrev =
    calYear > now.getFullYear() ||
    (calYear === now.getFullYear() && calMonth > now.getMonth());

  const prevMonth = () => {
    if (!canGoPrev) return;
    if (calMonth === 0) {
      setCalYear((y) => y - 1);
      setCalMonth(11);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalYear((y) => y + 1);
      setCalMonth(0);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  // Day click handler
  const handleDayClick = (dateStr: string) => {
    if (!selectingCheckout) {
      setArrival(dateStr);
      setDeparture(getDayAfterStr(dateStr));
      setSelectingCheckout(true);
      setResults(null);
    } else {
      if (dateStr > arrival) {
        setDeparture(dateStr);
      } else {
        setArrival(dateStr);
        setDeparture(getDayAfterStr(dateStr));
      }
      setSelectingCheckout(false);
      setResults(null);
    }
  };

  // Search
  const handleSearch = async () => {
    if (arrival >= departure) {
      setError("Check-out must be after check-in");
      return;
    }
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const params = new URLSearchParams({
        arrival,
        departure,
        guests: guests.toString(),
      });
      const res = await fetch(`/api/lodgify/search?${params}`);
      if (!res.ok) throw new Error("Search failed");
      const data: SearchResult[] = await res.json();
      setResults(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nights = getNights(arrival, departure);

  // Calendar grid
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const calDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calDays.push(d);

  // Effective end for hover preview
  const effectiveEnd =
    selectingCheckout && hoverDate && hoverDate > arrival
      ? hoverDate
      : departure;

  return (
    <div>
      <h3 className="text-lg font-serif font-semibold text-white mb-4">
        Book Your Escape
      </h3>

      {/* Calendar */}
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-3">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={prevMonth}
            disabled={!canGoPrev}
            className="size-7 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              className="size-3.5"
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
          <span className="text-sm font-semibold text-white">
            {MONTHS[calMonth]} {calYear}
          </span>
          <button
            onClick={nextMonth}
            className="size-7 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg
              className="size-3.5"
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

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-medium text-white/40 py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7">
          {calDays.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} />;

            const dateStr = toDateStr(calYear, calMonth, day);
            const isPast = dateStr <= todayStr;
            const isArrival = dateStr === arrival;
            const isDeparture = dateStr === effectiveEnd;
            const inRange = dateStr > arrival && dateStr < effectiveEnd;
            const isToday = dateStr === todayStr;

            // Range edge rounding
            const isRangeStart = isArrival && effectiveEnd > arrival;
            const isRangeEnd = isDeparture && effectiveEnd > arrival;

            // Availability
            const avail = dateAvail.get(dateStr);
            const allBooked =
              avail !== undefined && !avail.poolhouse && !avail.caveroom;
            const someBooked =
              avail !== undefined &&
              (!avail.poolhouse || !avail.caveroom) &&
              !allBooked;
            const isDisabled = isPast || allBooked;

            return (
              <div
                key={day}
                className={`relative flex items-center justify-center ${
                  inRange && !allBooked ? "bg-orange-400/15" : ""
                } ${isRangeStart ? "rounded-l-full" : ""} ${
                  isRangeEnd ? "rounded-r-full" : ""
                }`}
              >
                <button
                  disabled={isDisabled}
                  onClick={() => handleDayClick(dateStr)}
                  onMouseEnter={() =>
                    selectingCheckout && setHoverDate(dateStr)
                  }
                  onMouseLeave={() => setHoverDate(null)}
                  className={`relative size-8 text-xs rounded-full flex items-center justify-center transition-all
                    ${isDisabled ? "text-white/15 cursor-not-allowed" : "text-white/80 hover:bg-white/10 cursor-pointer"}
                    ${allBooked && !isPast ? "!text-white/20 line-through decoration-rose-400/60" : ""}
                    ${isArrival && !allBooked ? "!bg-orange-500 !text-white font-bold" : ""}
                    ${isDeparture && !isArrival && !allBooked ? "!bg-orange-500 !text-white font-bold" : ""}
                    ${isToday && !isArrival && !isDeparture ? "ring-1 ring-white/30" : ""}
                  `}
                >
                  {day}
                  {/* Fully booked dot */}
                  {!isPast && allBooked && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 size-1 rounded-full bg-rose-400" />
                  )}
                  {/* Partially booked dot */}
                  {!isPast &&
                    someBooked &&
                    !isArrival &&
                    !isDeparture && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 size-1 rounded-full bg-amber-400" />
                    )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Selection hint */}
        <div className="mt-2 text-center">
          {selectingCheckout ? (
            <p className="text-[10px] text-orange-300 animate-pulse">
              Now select check-out date
            </p>
          ) : (
            <p className="text-[10px] text-white/30">
              Tap a date to set check-in
            </p>
          )}
        </div>

        {/* Legend */}
        {dateAvail.size > 0 && (
          <div className="mt-1.5 flex items-center justify-center gap-x-3 text-[9px] text-white/30">
            <span className="flex items-center gap-x-1">
              <span className="size-1.5 rounded-full bg-rose-400" />
              Fully booked
            </span>
            <span className="flex items-center gap-x-1">
              <span className="size-1.5 rounded-full bg-amber-400" />
              1 left
            </span>
          </div>
        )}
      </div>

      {/* Selected dates summary */}
      <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
        <div className="flex items-center gap-x-2 text-sm">
          <span className="text-white font-medium">
            {formatShortDate(arrival)}
          </span>
          <svg
            className="size-3.5 text-orange-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
          <span className="text-white font-medium">
            {formatShortDate(departure)}
          </span>
        </div>
        <span className="text-xs text-orange-300 font-semibold">
          {nights} night{nights > 1 ? "s" : ""}
        </span>
      </div>

      {/* Guests + Search */}
      <div className="mt-3 space-y-3">
        <div>
          <label className="block text-[10px] uppercase tracking-wider font-medium text-white/50 mb-1.5">
            Guests
          </label>
          <select
            value={guests}
            onChange={(e) => {
              setGuests(Number(e.target.value));
              setResults(null);
            }}
            className="w-full rounded-xl border border-white/10 bg-white/10 backdrop-blur-sm px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-transparent [color-scheme:dark]"
          >
            {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n} className="bg-sage-800 text-white">
                {n} {n === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-x-2">
              <svg
                className="size-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Searching...
            </span>
          ) : (
            `Search ${nights} Night${nights > 1 ? "s" : ""}`
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-3 text-sm text-rose-300 text-center">{error}</p>
      )}

      {/* Results */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 flex flex-col gap-3 overflow-hidden"
          >
            <p className="text-[10px] uppercase tracking-wider font-medium text-white/40">
              {results.filter((r) => r.available).length} of {results.length}{" "}
              available
            </p>

            {results.map((result) => {
              const card = (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl border p-4 transition-colors ${
                    result.available
                      ? "border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer"
                      : "border-white/5 bg-white/[0.02] opacity-50"
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    {result.image && (
                      <div className="relative size-16 flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={result.image}
                          alt={result.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                          unoptimized
                        />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">
                        {result.name}
                      </h4>
                      <div className="flex items-center gap-x-2 mt-0.5">
                        <span className="text-xs text-white/50">
                          {result.maxPeople} guests
                        </span>
                        {result.bedrooms && (
                          <>
                            <span className="text-white/20">&middot;</span>
                            <span className="text-xs text-white/50">
                              {result.bedrooms} bed
                            </span>
                          </>
                        )}
                        {result.bathrooms && (
                          <>
                            <span className="text-white/20">&middot;</span>
                            <span className="text-xs text-white/50">
                              {result.bathrooms} bath
                            </span>
                          </>
                        )}
                      </div>

                      {result.available && result.total ? (
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="text-base font-bold text-white">
                            {formatPrice(result.total, result.currency)}
                            <span className="text-xs font-normal text-white/40">
                              {" "}
                              / {nights}n
                            </span>
                          </span>
                          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
                            Book
                          </span>
                        </div>
                      ) : (
                        <p className="mt-1.5 text-xs text-rose-300">
                          {result.reason || "Unavailable"}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );

              return result.available ? (
                <Link key={result.id} href={`${result.href}?checkin=${arrival}&checkout=${departure}&guests=${guests}#booking`}>
                  {card}
                </Link>
              ) : (
                <div key={result.id}>{card}</div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
