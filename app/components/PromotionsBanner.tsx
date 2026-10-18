"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PROPERTIES } from "../../lib/constants";

interface Promotion {
  name: string;
  price: {
    rate_type: string;
    percentage: number | null;
    amount: number | null;
  };
  early_booker_days: number | null;
  last_minute_days: number | null;
}

interface RateSettings {
  promotions: Promotion[];
  check_in_hour: number;
  check_out_hour: number;
  currency_code: string;
}

export default function PromotionsBanner() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    async function fetchPromotions() {
      try {
        const [res1, res2] = await Promise.all(
          PROPERTIES.map((p) => fetch(`/api/lodgify/rates?propertyId=${p.id}`))
        );
        const data1: RateSettings = await res1.json();
        const data2: RateSettings = await res2.json();
        const allPromos = [
          ...(data1.promotions || []),
          ...(data2.promotions || []),
        ];
        // Deduplicate by name
        const unique = allPromos.filter(
          (p, i, arr) => arr.findIndex((x) => x.name === p.name) === i
        );
        if (unique.length > 0) setPromotions(unique);
      } catch {
        // Silently fail — banner just won't show
      }
    }
    fetchPromotions();
  }, []);

  useEffect(() => {
    if (promotions.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % promotions.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [promotions.length]);

  if (promotions.length === 0) return null;

  const promo = promotions[current];
  const discount = promo.price.percentage
    ? `${promo.price.percentage}%`
    : promo.price.amount
    ? `PHP ${promo.price.amount}`
    : "";

  const label = promo.last_minute_days
    ? `Book within ${promo.last_minute_days} days of check-in`
    : promo.early_booker_days
    ? `Book ${promo.early_booker_days}+ days in advance`
    : "";

  return (
    <div className="relative bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjA1IiBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPjwvZz48L3N2Zz4=')] opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-center gap-x-3 text-sm text-white">
          <span className="flex items-center gap-x-1.5">
            <svg
              className="size-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <span className="font-semibold">Special Offer</span>
          </span>
          <span className="hidden sm:inline text-white/50">|</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={current}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              Save <span className="font-bold">{discount} off</span> — {label}
            </motion.span>
          </AnimatePresence>
          {promotions.length > 1 && (
            <div className="hidden sm:flex items-center gap-x-1 ml-2">
              {promotions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`size-1.5 rounded-full transition-colors ${
                    i === current ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
