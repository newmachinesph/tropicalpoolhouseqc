"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import AvailabilityCalendar from "./AvailabilityCalendar";
import PriceCalculator from "./PriceCalculator";
import { useCurrency } from "./CurrencyContext";

interface RoomImage {
  text: string;
  url: string;
}

interface AmenityItem {
  name: string;
  prefix: string | null;
  bracket: string | null;
  text: string;
}

interface RoomDetail {
  id: number;
  name: string;
  max_people: number;
  bedrooms: number;
  bathrooms: number;
  has_wifi: boolean;
  has_parking: boolean;
  pets_allowed: boolean;
  adults_only: boolean;
  area: number;
  area_unit: string;
  images: RoomImage[];
  amenities: Record<string, AmenityItem[]>;
  description?: string;
}

interface RatesSettings {
  check_in_hour: number;
  check_out_hour: number;
  promotions: {
    name: string;
    price: { rate_type: string; amount: number | null; percentage: number | null };
    early_booker_days: number | null;
    last_minute_days: number | null;
  }[];
}

interface RateCalendarItem {
  date: string;
  prices: {
    price_per_day: number;
    price_per_additional_guest: number;
    additional_guests_starts_from: number;
  }[];
}

interface PropertyData {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  rating: number;
  currency_code: string;
  original_min_price: number;
  original_max_price: number;
  roomDetails: RoomDetail[];
  ratesSettings: RatesSettings | null;
}

interface HostInfo {
  name: string;
  email?: string;
  phone?: string;
  tagline?: string;
}

interface PropertyDetailProps {
  propertyId: number;
  roomTypeId: number;
  propertyName: string;
  maxGuests: number;
  host?: HostInfo;
}

function filterImages(images: RoomImage[]): string[] {
  return images
    .filter((img) => {
      const url = (img.url || "").toLowerCase();
      const text = (img.text || "").toLowerCase();
      if (url.endsWith(".png")) return false;
      if (text.includes("speed") || text.includes("wifi") || text.includes("internet")) return false;
      if (url.includes("speedtest") || url.includes("wifi")) return false;
      return true;
    })
    .map((img) => (img.url.startsWith("//") ? `https:${img.url}` : img.url));
}

function extractAmenities(room: RoomDetail): { label: string; category: string }[] {
  const seen = new Set<string>();
  const results: { label: string; category: string }[] = [];

  const skipNames = new Set([
    "RoomsBathroom", "RoomsBedroom", "RoomsToilet",
    "EntertainmentInternet",
  ]);

  if (room.amenities) {
    Object.entries(room.amenities).forEach(([category, group]) => {
      group.forEach((a) => {
        if (!a.text || skipNames.has(a.name)) return;
        const label = a.text.replace(/^\d+\s+/, "");
        if (label && !seen.has(label.toLowerCase())) {
          seen.add(label.toLowerCase());
          results.push({ label, category });
        }
      });
    });
  }

  return results;
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatHour(hour: number): string {
  if (hour === 0) return "12:00 AM";
  if (hour === 12) return "12:00 PM";
  if (hour < 12) return `${hour}:00 AM`;
  return `${hour - 12}:00 PM`;
}

const SECTIONS = [
  { id: "about", label: "About" },
  { id: "amenities", label: "Amenities" },
  { id: "house-rules", label: "House Rules" },
  { id: "rates", label: "Rates" },
  { id: "location", label: "Location" },
  { id: "booking", label: "Availability" },
];

function scrollToSection(id: string, smooth = true) {
  const el = document.getElementById(id);
  if (el) {
    const offset = 160; // header + sticky nav height
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: smooth ? "smooth" : "instant" });
  }
}

export default function PropertyDetail({
  propertyId,
  roomTypeId,
  propertyName,
  maxGuests,
  host,
}: PropertyDetailProps) {
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<{ label: string; category: string }[]>([]);
  const [ratesCalendar, setRatesCalendar] = useState<RateCalendarItem[]>([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("about");
  const stickyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [propRes, ratesRes] = await Promise.all([
          fetch(`/api/lodgify/property?propertyId=${propertyId}`),
          fetch(`/api/lodgify/rates-calendar?propertyId=${propertyId}&roomTypeId=${roomTypeId}`),
        ]);

        if (propRes.ok) {
          const propData = await propRes.json();
          setProperty(propData);
          if (propData.roomDetails?.[0]) {
            const r = propData.roomDetails[0];
            setRoom(r);
            setImages(filterImages(r.images || []));
            setAmenities(extractAmenities(r));
          }
        }

        if (ratesRes.ok) {
          const ratesData = await ratesRes.json();
          setRatesCalendar(ratesData.calendar_items || []);
        }
      } catch {
        // Keep defaults
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [propertyId, roomTypeId]);

  // Scroll to hash section after data loads (e.g. from booking search)
  useEffect(() => {
    if (loading) return;
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    // Remove hash to prevent browser default scroll
    history.replaceState(null, "", window.location.pathname + window.location.search);
    // Wait for DOM + images to settle, then scroll
    const t1 = setTimeout(() => scrollToSection(hash, false), 500);
    const t2 = setTimeout(() => scrollToSection(hash, true), 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [loading]);

  // Track active section with IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const sectionIds = SECTIONS.map((s) => s.id);

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { rootMargin: "-150px 0px -60% 0px", threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [loading]);

  // Auto-rotate images
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImage((c) => (c + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentImage((c) => (c - 1 + images.length) % images.length);
  }, [images.length]);

  const nextImage = useCallback(() => {
    setCurrentImage((c) => (c + 1) % images.length);
  }, [images.length]);

  const bedrooms = room?.bedrooms ?? 0;
  const bathrooms = room?.bathrooms ?? 0;
  const guests = room?.max_people ?? maxGuests;
  const description = room?.description || property?.description || "";
  const address = property ? `${property.address?.trim()}, ${property.city}, ${property.country}` : "";
  const checkInHour = property?.ratesSettings?.check_in_hour;
  const checkOutHour = property?.ratesSettings?.check_out_hour;
  const petsAllowed = room?.pets_allowed ?? false;
  const area = room?.area ?? 0;
  const areaUnit = room?.area_unit ?? "sqm";

  // Group amenities by category
  const amenityGroups: Record<string, string[]> = {};
  amenities.forEach((a) => {
    const cat = a.category;
    const label =
      cat === "cooking" ? "Kitchen & Dining" :
      cat === "entertainment" ? "Entertainment" :
      cat === "heating" ? "Heating & Cooling" :
      cat === "laundry" ? "Bathroom & Laundry" :
      cat === "miscellaneous" ? "Safety & Security" :
      cat === "outside" ? "Outdoor" :
      cat === "room" ? "Rooms & Spaces" :
      cat === "pool" ? "Pool & Spa" :
      "Other";
    if (!amenityGroups[label]) amenityGroups[label] = [];
    amenityGroups[label].push(a.label);
  });

  // Build weekly rates from calendar
  const weeklyRates: { day: string; price: number }[] = [];
  if (ratesCalendar.length >= 7) {
    ratesCalendar.slice(0, 7).forEach((item) => {
      const date = new Date(item.date + "T00:00:00");
      const dayIndex = (date.getDay() + 6) % 7;
      weeklyRates.push({
        day: DAY_NAMES[dayIndex],
        price: item.prices?.[0]?.price_per_day ?? 0,
      });
    });
  }
  const perGuestRate = ratesCalendar[0]?.prices?.[0]?.price_per_additional_guest ?? 0;
  const guestThreshold = ratesCalendar[0]?.prices?.[0]?.additional_guests_starts_from ?? 0;
  const currencyCode = property?.currency_code || "PHP";
  const { formatPrice: ctxFormatPrice } = useCurrency();
  const fmtPrice = (amount: number) => {
    if (!amount || isNaN(amount)) return "";
    return ctxFormatPrice(amount, currencyCode);
  };
  const minPrice = property?.original_min_price ?? 0;

  // Host info (from props — Lodgify API doesn't expose owner details)
  const hostName = host?.name || "";
  const hostInitials = hostName
    .split(" ")
    .filter(Boolean)
    .map((n) => n.charAt(0).toUpperCase())
    .join("");
  const hostEmail = host?.email || "";
  const hostPhone = host?.phone || "";
  const hostTagline = host?.tagline || "Let me know how I can help";

  return (
    <div>
      {/* Image gallery */}
      <div className="mb-8">
        <section id="photos">
          {loading ? (
            <div className="rounded-2xl bg-cream-100 aspect-[16/9] sm:aspect-[2.2/1] animate-pulse" />
          ) : images.length > 0 ? (
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] sm:aspect-[2.2/1] bg-cream-100 shadow-lg">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={images[currentImage]}
                    alt={`${propertyName} photo ${currentImage + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 80vw"
                    unoptimized
                  />
                </motion.div>
              </AnimatePresence>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              {/* Property name overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-white drop-shadow-lg">
                  {propertyName}
                </h1>
                {address && (
                  <p className="mt-2 text-white/70 text-sm sm:text-base">
                    {address}
                  </p>
                )}
              </div>

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors"
                  >
                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors"
                  >
                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Dots */}
                  <div className="absolute bottom-3 right-6 sm:right-8 flex items-center gap-x-1.5">
                    {images.slice(0, 8).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImage(i)}
                        className={`size-2 rounded-full transition-all ${
                          i === currentImage
                            ? "bg-white w-5"
                            : "bg-white/40 hover:bg-white/60"
                        }`}
                      />
                    ))}
                    {images.length > 8 && (
                      <span className="text-[10px] text-white/50 ml-1">+{images.length - 8}</span>
                    )}
                  </div>

                  {/* Counter */}
                  <div className="absolute top-4 right-4 rounded-full bg-black/30 backdrop-blur-sm px-3 py-1 text-xs text-white">
                    {currentImage + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
          ) : null}

          {/* Quick facts */}
          <div className="flex flex-wrap gap-3 mt-6">
            <span className="inline-flex items-center gap-x-2 rounded-full bg-sage-50 border border-sage-200 px-4 py-2 text-sm text-sage-700 font-medium">
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              Up to {guests} guests
            </span>
            {bedrooms > 0 && (
              <span className="inline-flex items-center gap-x-2 rounded-full bg-sage-50 border border-sage-200 px-4 py-2 text-sm text-sage-700 font-medium">
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2 22V7l10-5 10 5v15M6 12h12v10H6zM10 16h4" />
                </svg>
                {bedrooms} Bedroom{bedrooms > 1 ? "s" : ""}
              </span>
            )}
            {bathrooms > 0 && (
              <span className="inline-flex items-center gap-x-2 rounded-full bg-sage-50 border border-sage-200 px-4 py-2 text-sm text-sage-700 font-medium">
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 12h16a1 1 0 011 1v3a4 4 0 01-4 4H7a4 4 0 01-4-4v-3a1 1 0 011-1zM6 12V5a2 2 0 012-2h1a2 2 0 012 2v7" />
                </svg>
                {bathrooms} Bathroom{bathrooms > 1 ? "s" : ""}
              </span>
            )}
            {area > 0 && (
              <span className="inline-flex items-center gap-x-2 rounded-full bg-sage-50 border border-sage-200 px-4 py-2 text-sm text-sage-700 font-medium">
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
                {area} {areaUnit}
              </span>
            )}
          </div>
        </section>
      </div>

      {/* Sticky section nav */}
      <div
        ref={stickyRef}
        className="sticky top-[59px] sm:top-[103px] z-40 -mx-4 sm:-mx-6 lg:-mx-8 mb-8"
      >
        <div className="bg-white border-b border-cream-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center">
            <nav className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-x-6 sm:gap-x-8">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`relative whitespace-nowrap py-3.5 text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? "text-sage-800"
                        : "text-cream-400 hover:text-sage-600"
                    }`}
                  >
                    {section.label}
                    {activeSection === section.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sage-700 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Description */}
        <section id="about">
          {loading ? (
            <div className="space-y-3">
              <div className="h-4 bg-cream-100 rounded animate-pulse w-full" />
              <div className="h-4 bg-cream-100 rounded animate-pulse w-5/6" />
              <div className="h-4 bg-cream-100 rounded animate-pulse w-4/6" />
            </div>
          ) : description ? (
            <div className="rounded-2xl bg-white border border-cream-200 p-6 sm:p-8 shadow-sm">
              <h2 className="font-serif text-lg font-semibold text-sage-800 mb-4">About This Property</h2>
              <div
                className="property-description max-w-none text-sm text-cream-600 leading-relaxed [&_h2]:font-serif [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-sage-800 [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:font-serif [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-sage-700 [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-2 [&_strong]:text-sage-700 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul]:space-y-1 [&_li]:text-cream-600 [&_a]:text-rose-600 [&_a]:underline [&_a:hover]:text-rose-700"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </div>
          ) : null}
        </section>

        {/* Amenities (grouped) */}
        <section id="amenities">
          {!loading && Object.keys(amenityGroups).length > 0 && (
            <div className="rounded-2xl bg-white border border-cream-200 p-6 sm:p-8 shadow-sm">
              <h2 className="font-serif text-lg font-semibold text-sage-800 mb-6">Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(amenityGroups).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-sage-700 mb-3">{category}</h3>
                    <ul className="space-y-2">
                      {items.map((item) => (
                        <li key={item} className="flex items-center gap-x-2 text-sm text-cream-600">
                          <svg className="size-4 text-sage-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* House Rules */}
        <section id="house-rules">
          {!loading && (checkInHour != null || checkOutHour != null || petsAllowed) && (
            <div className="rounded-2xl bg-white border border-cream-200 p-6 sm:p-8 shadow-sm">
              <h2 className="font-serif text-lg font-semibold text-sage-800 mb-6">House Rules</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {checkInHour != null && (
                  <div className="flex items-start gap-x-3">
                    <div className="size-10 rounded-xl bg-sage-50 flex items-center justify-center flex-shrink-0">
                      <svg className="size-5 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-sage-700">Check-in</p>
                      <p className="text-sm text-cream-600">{formatHour(checkInHour)}</p>
                    </div>
                  </div>
                )}
                {checkOutHour != null && (
                  <div className="flex items-start gap-x-3">
                    <div className="size-10 rounded-xl bg-sage-50 flex items-center justify-center flex-shrink-0">
                      <svg className="size-5 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-sage-700">Check-out</p>
                      <p className="text-sm text-cream-600">{formatHour(checkOutHour)}</p>
                    </div>
                  </div>
                )}
                {petsAllowed && (
                  <div className="flex items-start gap-x-3">
                    <div className="size-10 rounded-xl bg-sage-50 flex items-center justify-center flex-shrink-0">
                      <svg className="size-5 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-sage-700">Pets</p>
                      <p className="text-sm text-cream-600">Pets welcome</p>
                    </div>
                  </div>
                )}
                {room?.has_parking && (
                  <div className="flex items-start gap-x-3">
                    <div className="size-10 rounded-xl bg-sage-50 flex items-center justify-center flex-shrink-0">
                      <svg className="size-5 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21a.75.75 0 00.75-.75V11.25a3 3 0 00-2.15-2.878L16.5 7.5h-4.014a3 3 0 00-2.143.9L7.5 11.25H3.375c-.621 0-1.125.504-1.125 1.125v3.375" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-sage-700">Parking</p>
                      <p className="text-sm text-cream-600">On-site parking available</p>
                    </div>
                  </div>
                )}
                {room?.has_wifi && (
                  <div className="flex items-start gap-x-3">
                    <div className="size-10 rounded-xl bg-sage-50 flex items-center justify-center flex-shrink-0">
                      <svg className="size-5 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-sage-700">WiFi</p>
                      <p className="text-sm text-cream-600">High-speed internet</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Weekly Rates */}
        <section id="rates">
          {!loading && weeklyRates.length === 7 && (
            <div className="rounded-2xl bg-white border border-cream-200 p-6 sm:p-8 shadow-sm">
              <h2 className="font-serif text-lg font-semibold text-sage-800 mb-2">Standard Rates</h2>
              {perGuestRate > 0 && guestThreshold > 0 && (
                <p className="text-sm text-cream-500 mb-6">
                  + {fmtPrice(perGuestRate)} per guest/night after {guestThreshold} guests
                </p>
              )}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      {weeklyRates.map((r) => (
                        <th
                          key={r.day}
                          className={`px-3 py-2 text-xs font-semibold text-center ${
                            r.day === "Sat" || r.day === "Sun"
                              ? "text-rose-600"
                              : "text-sage-600"
                          }`}
                        >
                          {r.day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {weeklyRates.map((r) => (
                        <td
                          key={r.day}
                          className={`px-3 py-3 text-center text-sm font-medium ${
                            r.day === "Sat" || r.day === "Sun"
                              ? "text-rose-700 bg-rose-50"
                              : "text-sage-700"
                          }`}
                        >
                          {fmtPrice(r.price)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Location */}
        <section id="location">
          {!loading && property?.latitude && property?.longitude && (
            <div className="rounded-2xl bg-white border border-cream-200 p-6 sm:p-8 shadow-sm">
              <h2 className="font-serif text-lg font-semibold text-sage-800 mb-4">Location</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-x-3">
                  <svg className="size-5 text-sage-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-sage-700">{address}</p>
                    <p className="text-xs text-cream-500 mt-1">
                      Search &quot;{propertyName}&quot; on Google Maps or Waze for the exact pin
                    </p>
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-x-2 rounded-xl bg-sage-50 border border-sage-200 px-4 py-2.5 text-sm font-medium text-sage-700 hover:bg-sage-100 transition-colors"
                >
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                  </svg>
                  Open in Google Maps
                </a>
              </div>
            </div>
          )}
        </section>

        {/* Calendar + Price calculator */}
        <section id="booking">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AvailabilityCalendar propertyId={propertyId} />
            <PriceCalculator
              propertyId={propertyId}
              roomTypeId={roomTypeId}
              propertyName={propertyName}
              maxGuests={guests}
            />
          </div>
        </section>

        {/* About Host */}
        {!loading && hostName && (
          <section id="host">
            <div className="rounded-2xl bg-white border border-cream-200 p-6 sm:p-8 shadow-sm">
              <h2 className="font-serif text-lg font-semibold text-sage-800 mb-6">About Your Host</h2>
              <div className="flex items-center gap-x-4">
                <div className="size-16 rounded-full bg-sage-100 border-2 border-sage-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-sage-700">{hostInitials}</span>
                </div>
                <div>
                  <p className="text-base font-semibold text-sage-800">{hostName}</p>
                  <p className="text-sm text-cream-500 mt-0.5">{hostTagline}</p>
                </div>
              </div>

              {/* Contact info */}
              {(hostEmail || hostPhone) && (
                <div className="mt-6 pt-6 border-t border-cream-200">
                  <h3 className="text-sm font-semibold text-sage-700 mb-4">Contact Us</h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {hostEmail && (
                      <a
                        href={`mailto:${hostEmail}`}
                        className="inline-flex items-center gap-x-3 rounded-xl bg-sage-50 border border-sage-200 px-4 py-3 text-sm text-sage-700 hover:bg-sage-100 transition-colors"
                      >
                        <svg className="size-5 text-sage-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        {hostEmail}
                      </a>
                    )}
                    {hostPhone && (
                      <a
                        href={`tel:${hostPhone}`}
                        className="inline-flex items-center gap-x-3 rounded-xl bg-sage-50 border border-sage-200 px-4 py-3 text-sm text-sage-700 hover:bg-sage-100 transition-colors"
                      >
                        <svg className="size-5 text-sage-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                        {hostPhone}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Sticky bottom booking bar */}
      {!loading && (
        <StickyBottomBar
          propertyName={propertyName}
          address={address}
          minPrice={minPrice}
          fmtPrice={fmtPrice}
          onBook={() => scrollToSection("booking")}
          activeSection={activeSection}
        />
      )}
    </div>
  );
}

/* ── Sticky bottom booking bar ── */

function StickyBottomBar({
  propertyName,
  address,
  minPrice,
  fmtPrice,
  onBook,
  activeSection,
}: {
  propertyName: string;
  address: string;
  minPrice: number;
  fmtPrice: (amount: number) => string;
  onBook: () => void;
  activeSection: string;
}) {
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const handleScroll = () => setPastHero(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const visible = pastHero && activeSection !== "booking";

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0"
      }`}
    >
      <div className="bg-white/95 backdrop-blur-md border-t border-cream-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Property info */}
          <div className="hidden sm:block min-w-0 flex-1">
            <p className="text-sm font-semibold text-sage-800 truncate">
              {propertyName}
            </p>
            <div className="flex items-center gap-x-1.5 mt-0.5">
              <svg className="size-3 text-sage-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <p className="text-xs text-cream-500 truncate">{address}</p>
            </div>
          </div>

          {/* Price */}
          <div className="flex-shrink-0 text-right sm:text-left">
            {minPrice > 0 && (
              <p className="text-sm">
                <span className="text-xs text-cream-400">from </span>
                <span className="font-bold text-sage-800">{fmtPrice(minPrice)}</span>
                <span className="text-xs text-cream-400"> / night</span>
              </p>
            )}
          </div>

          {/* Book button */}
          <button
            onClick={onBook}
            className="flex-shrink-0 rounded-full bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
