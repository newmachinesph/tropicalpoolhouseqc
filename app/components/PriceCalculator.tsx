"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "./CurrencyContext";

function getUrlParam(key: string): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(key);
}

interface QuoteRoomType {
  room_type_id: number;
  subtotal: number;
  price_types: {
    type: number;
    description: string;
    subtotal: number;
  }[];
}

interface QuoteData {
  total_excluding_vat: number;
  currency_code: string;
  date_arrival: string;
  date_departure: string;
  security_deposit: number;
  scheduled_payments: {
    type: string;
    date_due: string;
    amount: number;
  }[];
  room_types: QuoteRoomType[];
  cancellation_policy_text: string;
}

interface BookingConfirmation {
  bookingId: number;
  status: string;
  checkIn: string;
  checkOut: string;
  arrival: string;
  departure: string;
  guestName: string;
  guestEmail: string;
}

interface PriceCalculatorProps {
  propertyId: number;
  roomTypeId: number;
  propertyName: string;
  maxGuests: number;
}

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

function getNights(arrival: string, departure: string): number {
  const a = new Date(arrival);
  const b = new Date(departure);
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86400000));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PriceCalculator({
  propertyId,
  roomTypeId,
  propertyName,
  maxGuests,
}: PriceCalculatorProps) {
  const { formatPrice } = useCurrency();
  const [arrival, setArrival] = useState(getTomorrowStr());
  const [departure, setDeparture] = useState(getDayAfterStr(getTomorrowStr()));
  const [guests, setGuests] = useState(2);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const autoCalculated = useRef(false);

  // Booking form state
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [confirmation, setConfirmation] =
    useState<BookingConfirmation | null>(null);

  const handleCalculate = async (overrides?: { arrival: string; departure: string; guests: number }) => {
    const a = overrides?.arrival ?? arrival;
    const d = overrides?.departure ?? departure;
    const g = overrides?.guests ?? guests;
    if (a >= d) {
      setError("Check-out must be after check-in");
      return;
    }
    setLoading(true);
    setError("");
    setQuote(null);
    setShowBookingForm(false);
    setConfirmation(null);

    try {
      const params = new URLSearchParams({
        propertyId: propertyId.toString(),
        roomTypeId: roomTypeId.toString(),
        arrival: a,
        departure: d,
        people: g.toString(),
      });
      const res = await fetch(`/api/lodgify/quote?${params.toString()}`);
      if (!res.ok) throw new Error("Quote unavailable for these dates");
      const data = await res.json();
      const quoteData = Array.isArray(data) ? data[0] : data;
      if (!quoteData?.total_excluding_vat) {
        throw new Error("Not available for these dates");
      }
      setQuote(quoteData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not get a quote"
      );
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill dates from URL params and auto-calculate (from booking search)
  useEffect(() => {
    if (autoCalculated.current) return;
    const checkin = getUrlParam("checkin");
    const checkout = getUrlParam("checkout");
    const gParam = getUrlParam("guests");
    if (checkin && checkout) {
      autoCalculated.current = true;
      const gNum = gParam ? parseInt(gParam, 10) : 2;
      setArrival(checkin);
      setDeparture(checkout);
      setGuests(gNum);
      handleCalculate({ arrival: checkin, departure: checkout, guests: gNum });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBook = async () => {
    if (!guestName.trim()) {
      setBookingError("Please enter your name");
      return;
    }
    if (!guestEmail.trim() || !guestEmail.includes("@")) {
      setBookingError("Please enter a valid email");
      return;
    }

    setBookingLoading(true);
    setBookingError("");

    try {
      const res = await fetch("/api/lodgify/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          roomTypeId,
          arrival,
          departure,
          people: guests,
          guest: {
            name: guestName.trim(),
            email: guestEmail.trim(),
            phone: guestPhone.trim() || null,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Booking failed");
      }

      setConfirmation(data);
      setShowBookingForm(false);
    } catch (err) {
      setBookingError(
        err instanceof Error ? err.message : "Booking failed. Please try again."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const nights = getNights(arrival, departure);

  // Show confirmation screen
  if (confirmation) {
    return (
      <div className="rounded-2xl bg-white border border-cream-200 p-5 sm:p-6 shadow-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          {/* Success icon */}
          <div className="mx-auto size-16 rounded-full bg-emerald-50 flex items-center justify-center">
            <svg className="size-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <h3 className="font-serif text-xl font-semibold text-sage-800">
              Booking Confirmed!
            </h3>
            <p className="text-sm text-cream-500 mt-1">
              Booking #{confirmation.bookingId}
            </p>
          </div>

          <div className="rounded-xl bg-sage-50 p-4 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-cream-500">Property</span>
              <span className="font-medium text-sage-800">{propertyName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-cream-500">Check-in</span>
              <span className="font-medium text-sage-800">
                {formatDate(confirmation.arrival)} at {confirmation.checkIn}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-cream-500">Check-out</span>
              <span className="font-medium text-sage-800">
                {formatDate(confirmation.departure)} at {confirmation.checkOut}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-cream-500">Guest</span>
              <span className="font-medium text-sage-800">{confirmation.guestName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-cream-500">Status</span>
              <span className="inline-flex items-center gap-x-1 text-emerald-600 font-medium">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                {confirmation.status}
              </span>
            </div>
          </div>

          <p className="text-xs text-cream-500">
            A confirmation email has been sent to{" "}
            <span className="font-medium text-sage-700">{confirmation.guestEmail}</span>
          </p>

          <button
            onClick={() => {
              setConfirmation(null);
              setQuote(null);
              setGuestName("");
              setGuestEmail("");
              setGuestPhone("");
            }}
            className="text-sm text-sage-600 hover:text-sage-800 underline underline-offset-2 transition-colors"
          >
            Make another booking
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-cream-200 p-5 sm:p-6 shadow-sm">
      <h3 className="font-serif text-lg font-semibold text-sage-800 mb-1">
        {showBookingForm ? "Complete Your Booking" : "Get a Quote"}
      </h3>
      <p className="text-xs text-cream-500 mb-5">{propertyName}</p>

      {/* Booking form - shown after quote */}
      <AnimatePresence mode="wait">
        {showBookingForm ? (
          <motion.div
            key="booking-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Booking summary */}
            <div className="rounded-lg bg-sage-50 p-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-cream-500">
                  {formatDate(arrival)} — {formatDate(departure)}
                </span>
                <span className="font-medium text-sage-700">{nights} night{nights > 1 ? "s" : ""}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-cream-600">{guests} guest{guests > 1 ? "s" : ""}</span>
                <span className="font-bold text-sage-800">
                  {quote ? formatPrice(quote.total_excluding_vat, quote.currency_code) : ""}
                </span>
              </div>
            </div>

            {/* Guest details */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-medium text-cream-500 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Juan Dela Cruz"
                  className="w-full rounded-lg border border-cream-200 px-3 py-2.5 text-sm text-sage-800 placeholder:text-cream-400 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-medium text-cream-500 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full rounded-lg border border-cream-200 px-3 py-2.5 text-sm text-sage-800 placeholder:text-cream-400 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-medium text-cream-500 mb-1">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+63 912 345 6789"
                  className="w-full rounded-lg border border-cream-200 px-3 py-2.5 text-sm text-sage-800 placeholder:text-cream-400 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Error */}
            {bookingError && (
              <p role="alert" className="text-sm text-rose-600 text-center">{bookingError}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowBookingForm(false)}
                className="flex-1 rounded-full border border-cream-200 px-4 py-3 text-sm font-medium text-cream-600 hover:bg-cream-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleBook}
                disabled={bookingLoading}
                className="flex-1 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {bookingLoading ? (
                  <span className="flex items-center justify-center gap-x-2">
                    <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Booking...
                  </span>
                ) : (
                  "Confirm Booking"
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="quote-form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* Quote Form */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-medium text-cream-500 mb-1">
                    Check-in
                  </label>
                  <input
                    type="date"
                    value={arrival}
                    min={getTomorrowStr()}
                    onChange={(e) => {
                      setArrival(e.target.value);
                      if (e.target.value >= departure) {
                        setDeparture(getDayAfterStr(e.target.value));
                      }
                      setQuote(null);
                    }}
                    className="w-full rounded-lg border border-cream-200 px-3 py-2.5 text-sm text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-medium text-cream-500 mb-1">
                    Check-out
                  </label>
                  <input
                    type="date"
                    value={departure}
                    min={getDayAfterStr(arrival)}
                    onChange={(e) => {
                      setDeparture(e.target.value);
                      setQuote(null);
                    }}
                    className="w-full rounded-lg border border-cream-200 px-3 py-2.5 text-sm text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-medium text-cream-500 mb-1">
                  Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => {
                    setGuests(Number(e.target.value));
                    setQuote(null);
                  }}
                  className="w-full rounded-lg border border-cream-200 px-3 py-2.5 text-sm text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent"
                >
                  {Array.from({ length: maxGuests }, (_, i) => i + 1).map(
                    (n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "guest" : "guests"}
                      </option>
                    )
                  )}
                </select>
              </div>

              <button
                onClick={() => handleCalculate()}
                disabled={loading}
                className="w-full rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
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
                    Calculating...
                  </span>
                ) : (
                  `Get Price for ${nights} Night${nights > 1 ? "s" : ""}`
                )}
              </button>
            </div>

            {/* Error */}
            {error && (
              <p role="alert" className="mt-3 text-sm text-rose-600 text-center">{error}</p>
            )}

            {/* Quote result */}
            <AnimatePresence>
              {quote && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-5 overflow-hidden"
                >
                  <div className="border-t border-cream-200 pt-5 space-y-3">
                    {/* Room rate */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-cream-600">
                        Room rate ({nights} night{nights > 1 ? "s" : ""})
                      </span>
                      <span className="font-medium text-sage-800">
                        {formatPrice(
                          quote.room_types?.[0]?.subtotal ||
                            quote.total_excluding_vat,
                          quote.currency_code
                        )}
                      </span>
                    </div>

                    {/* Promotions */}
                    {quote.room_types?.[0]?.price_types
                      ?.filter((pt) => pt.type === 1 && pt.subtotal > 0)
                      .map((pt) => (
                        <div
                          key={pt.type}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-emerald-600">
                            {pt.description}
                          </span>
                          <span className="font-medium text-emerald-600">
                            -{formatPrice(pt.subtotal, quote.currency_code)}
                          </span>
                        </div>
                      ))}

                    {/* Security deposit */}
                    {quote.security_deposit > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-cream-600">
                          Security deposit{" "}
                          <span className="text-cream-400">(refundable)</span>
                        </span>
                        <span className="font-medium text-sage-800">
                          {formatPrice(quote.security_deposit, quote.currency_code)}
                        </span>
                      </div>
                    )}

                    {/* Total */}
                    <div className="border-t border-cream-200 pt-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-sage-800">
                        Total
                      </span>
                      <span className="text-xl font-bold text-sage-800">
                        {formatPrice(quote.total_excluding_vat, quote.currency_code)}
                      </span>
                    </div>

                    {/* Per night */}
                    <p className="text-center text-xs text-cream-500">
                      {formatPrice(
                        Math.round(quote.total_excluding_vat / nights),
                        quote.currency_code
                      )}{" "}
                      per night
                    </p>

                    {/* Payment schedule */}
                    {quote.scheduled_payments?.length > 0 && (
                      <div className="rounded-lg bg-sage-50 p-3 space-y-1.5">
                        <p className="text-[10px] uppercase tracking-wider font-medium text-sage-600">
                          Payment Schedule
                        </p>
                        {quote.scheduled_payments.map((payment, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-cream-600">
                              {formatDate(payment.date_due)}
                            </span>
                            <span className="font-medium text-sage-700">
                              {formatPrice(payment.amount, quote.currency_code)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Book Now button */}
                    <button
                      onClick={() => {
                        setShowBookingForm(true);
                        setBookingError("");
                      }}
                      className="w-full rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors mt-2"
                    >
                      Book Now
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
