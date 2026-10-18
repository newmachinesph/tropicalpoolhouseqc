"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";
import { PROPERTY_NAMES } from "../../lib/constants";

interface Booking {
  id: number;
  property_id: number;
  arrival: string;
  departure: string;
  status: string;
  source: string;
  created_at: string;
  guests: number | null;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });
}

export default function RecentBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch("/api/lodgify/bookings");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        // Only show confirmed bookings
        const confirmed = data.filter(
          (b: Booking) => b.status === "Booked" || b.status === "Open"
        );
        setBookings(confirmed.slice(0, 5));
      } catch {
        // Silently fail
      }
    }
    fetchBookings();
  }, []);

  if (bookings.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-sage-50/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-x-2 text-xs tracking-[0.3em] uppercase text-sage-500 font-semibold">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
              </span>
              Live Activity
            </span>
            <h3 className="mt-3 font-serif text-xl font-semibold text-sage-800 sm:text-2xl">
              Recent Bookings
            </h3>
          </div>
        </AnimatedSection>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {bookings.map((booking, i) => (
            <AnimatedSection key={booking.id} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="flex items-center gap-x-3 rounded-xl bg-white border border-cream-200 px-4 py-3 shadow-sm"
              >
                {/* Icon */}
                <div className="flex-shrink-0 size-9 rounded-full bg-sage-100 flex items-center justify-center">
                  <svg
                    className="size-4 text-sage-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                    />
                  </svg>
                </div>

                {/* Info */}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-sage-800 truncate">
                    {PROPERTY_NAMES[booking.property_id] || "Property"}
                  </p>
                  <p className="text-xs text-cream-500">
                    {formatDate(booking.arrival)} –{" "}
                    {formatDate(booking.departure)}
                    {booking.guests && (
                      <span className="text-cream-400">
                        {" "}
                        · {booking.guests} guests
                      </span>
                    )}
                  </p>
                </div>

                {/* Time ago */}
                <span className="flex-shrink-0 text-[10px] font-medium text-cream-400 uppercase tracking-wider">
                  {timeAgo(booking.created_at)}
                </span>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
