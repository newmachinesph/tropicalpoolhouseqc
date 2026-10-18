"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import AnimatedSection from "./AnimatedSection";
import { useCurrency } from "./CurrencyContext";

interface RoomImage {
  text: string;
  url: string;
}

interface LodgifyProperty {
  id: number;
  name: string;
  image_url: string;
  currency_code: string;
  original_min_price: number;
  original_max_price: number;
  city: string;
  country: string;
  rooms: { id: number; name: string }[];
  roomDetails?: {
    id: number;
    name: string;
    max_people: number;
    bedrooms: number;
    bathrooms: number;
    has_wifi: boolean;
    has_parking: boolean;
    pets_allowed: boolean | null;
    images: RoomImage[];
    amenities: Record<string, { name: string; text: string }[]>;
    description?: string;
  }[];
}

// Map Lodgify property IDs to local metadata
const propertyMeta: Record<
  number,
  {
    roomTypeId: number;
    type: string;
    rating: number;
    ratingPlatform: string;
    fallbackImage: string;
    highlights: string[];
    displayName?: string;
    slug: string;
  }
> = {
  441486: {
    roomTypeId: 507608,
    type: "Private Pool House",
    rating: 4.9,
    ratingPlatform: "Airbnb",
    fallbackImage: "/399bc411-4005-47cc-9a7a-98042eb38450.jpg",
    highlights: ["Private Pool", "3 Bedrooms", "Full Kitchen"],
    slug: "/tropical-poolhouse",
  },
  694188: {
    roomTypeId: 761253,
    type: "Industrial Cave Room",
    rating: 8.7,
    ratingPlatform: "Booking.com",
    fallbackImage: "/interior.png",
    highlights: ["Unique Design", "City Center", "Cozy Retreat"],
    displayName: "Cubao Caveroom",
    slug: "/cubao-caveroom",
  },
};

// Fallback data in case API fails
const fallbackProperties: LodgifyProperty[] = [
  {
    id: 441486,
    name: "Tropical Poolhouse QC",
    image_url: "",
    currency_code: "PHP",
    original_min_price: 11000,
    original_max_price: 20000,
    city: "Quezon City",
    country: "Philippines",
    rooms: [{ id: 507608, name: "Tropical Poolhouse QC" }],
    roomDetails: [
      {
        id: 507608,
        name: "Tropical Poolhouse QC",
        max_people: 20,
        bedrooms: 3,
        bathrooms: 5,
        has_wifi: true,
        has_parking: true,
        pets_allowed: null,
        images: [],
        amenities: {},
      },
    ],
  },
  {
    id: 694188,
    name: "Spacious Caveroom in Lower Floor | Prime Location",
    image_url: "",
    currency_code: "PHP",
    original_min_price: 5500,
    original_max_price: 7525,
    city: "Quezon City",
    country: "Philippines",
    rooms: [{ id: 761253, name: "Spacious Caveroom" }],
    roomDetails: [
      {
        id: 761253,
        name: "Spacious Caveroom",
        max_people: 8,
        bedrooms: 2,
        bathrooms: 2,
        has_wifi: true,
        has_parking: false,
        pets_allowed: null,
        images: [],
        amenities: {},
      },
    ],
  },
];

// Removed local formatPrice — using CurrencyContext instead

// Filter images: skip PNGs (screenshots), speedtest, wifi-related images
function getPropertyImages(property: LodgifyProperty): string[] {
  const meta = propertyMeta[property.id];
  const rawImages = property.roomDetails?.[0]?.images || [];

  const filtered = rawImages
    .filter((img) => {
      const url = (img.url || "").toLowerCase();
      const text = (img.text || "").toLowerCase();
      if (url.endsWith(".png")) return false;
      if (
        text.includes("speed") ||
        text.includes("wifi") ||
        text.includes("internet")
      )
        return false;
      if (url.includes("speedtest") || url.includes("wifi")) return false;
      return true;
    })
    .map((img) => (img.url.startsWith("//") ? `https:${img.url}` : img.url));

  if (filtered.length > 0) return filtered;

  // Fallback to property-level image
  if (property.image_url) {
    const url = property.image_url.startsWith("//")
      ? `https:${property.image_url}`
      : property.image_url;
    return [url];
  }

  return meta ? [meta.fallbackImage] : ["/placeholder.jpg"];
}

// Extract amenity names from room data using human-readable text field
function getAmenityNames(property: LodgifyProperty): string[] {
  const room = property.roomDetails?.[0];
  if (!room) return [];

  const names: string[] = [];
  if (room.has_wifi) names.push("WiFi");
  if (room.has_parking) names.push("Parking");

  // Skip room-structure amenities shown in quick facts
  const skipNames = new Set([
    "RoomsBathroom", "RoomsBedroom", "RoomsToilet", "EntertainmentInternet",
  ]);

  if (room.amenities) {
    Object.values(room.amenities).forEach((group) => {
      group.forEach((a: { name: string; text: string }) => {
        if (!a.text || skipNames.has(a.name)) return;
        const label = a.text.replace(/^\d+\s+/, "");
        if (label && !names.includes(label)) {
          names.push(label);
        }
      });
    });
  }

  return names.slice(0, 10);
}

// Individual property card with its own image rotation
function PropertyCard({
  property,
  loading,
}: {
  property: LodgifyProperty;
  loading: boolean;
}) {
  const { formatPrice } = useCurrency();
  const meta = propertyMeta[property.id] || {
    roomTypeId: 0,
    type: "Vacation Rental",
    rating: 0,
    ratingPlatform: "",
    fallbackImage: "",
    highlights: [],
    slug: "/",
  };
  const room = property.roomDetails?.[0];
  const images = getPropertyImages(property);
  const [currentImage, setCurrentImage] = useState(0);

  // Auto-rotate images every 5 seconds
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImage((c) => (c + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const isRemoteImage = images[currentImage]?.startsWith("https://");
  const displayName =
    meta.displayName ||
    (property.id === 694188 ? "Cubao Caveroom" : property.name);

  return (
    <Link href={meta.slug}>
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`group rounded-2xl overflow-hidden border border-cream-200 bg-white shadow-lg shadow-sage-900/5 hover:shadow-xl transition-shadow cursor-pointer ${
        loading ? "animate-pulse" : ""
      }`}
    >
      {/* Image with auto-rotation */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            {isRemoteImage ? (
              <Image
                src={images[currentImage]}
                alt={`${displayName} photo ${currentImage + 1}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized
              />
            ) : (
              <Image
                src={images[currentImage]}
                alt={`${displayName} photo ${currentImage + 1}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            )}
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-sage-900/40 via-transparent to-transparent" />

        {/* Type badge */}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-x-1.5 rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-xs font-medium text-white border border-white/20">
            {meta.type}
          </span>
        </div>

        {/* Rating badge */}
        {meta.rating > 0 && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-x-1 rounded-full bg-orange-400/90 px-3 py-1 text-xs font-bold text-white shadow-lg">
              <svg className="size-3 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {meta.rating}
            </span>
          </div>
        )}

        {/* Image dots indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-4 flex items-center gap-x-1.5">
            {images.slice(0, 5).map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImage(i);
                }}
                className={`size-1.5 rounded-full transition-all ${
                  i === currentImage
                    ? "bg-white w-4"
                    : "bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
            {images.length > 5 && (
              <span className="text-[10px] text-white/60 ml-0.5">
                +{images.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Live pricing indicator */}
        {!loading && (
          <div className="absolute bottom-4 right-4">
            <span className="inline-flex items-center gap-x-1.5 rounded-full bg-emerald-500/90 backdrop-blur-md px-3 py-1 text-xs font-medium text-white">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-white"></span>
              </span>
              Live Pricing
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-5 sm:p-6">
        <h3 className="font-serif text-xl font-semibold text-sage-800 group-hover:text-sage-600 transition-colors">
          {displayName}
        </h3>

        {/* Capacity row */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-x-1.5 text-sm text-cream-500">
            <svg
              className="size-4 text-cream-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
            Up to {room?.max_people ?? "–"} guests
          </span>
          <span className="text-cream-300">|</span>
          <span className="text-sm text-cream-500">{meta.ratingPlatform}</span>
        </div>

        {/* Highlight tags */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {room?.bedrooms && (
            <span className="inline-flex items-center gap-x-1 rounded-full bg-sage-50 px-3 py-1.5 text-xs text-sage-600 font-medium">
              <svg className="size-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2 22V7l10-5 10 5v15M6 12h12v10H6zM10 16h4" />
              </svg>
              {room.bedrooms} Bed{room.bedrooms > 1 ? "s" : ""}
            </span>
          )}
          {room?.bathrooms && (
            <span className="inline-flex items-center gap-x-1 rounded-full bg-sage-50 px-3 py-1.5 text-xs text-sage-600 font-medium">
              <svg className="size-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 12h16a1 1 0 011 1v3a4 4 0 01-4 4H7a4 4 0 01-4-4v-3a1 1 0 011-1zM6 12V5a2 2 0 012-2h1a2 2 0 012 2v7" />
              </svg>
              {room.bathrooms} Bath{room.bathrooms > 1 ? "s" : ""}
            </span>
          )}
          {room?.has_wifi && (
            <span className="inline-flex items-center gap-x-1 rounded-full bg-sage-50 px-3 py-1.5 text-xs text-sage-600 font-medium">
              <svg className="size-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
              </svg>
              WiFi
            </span>
          )}
          {room?.has_parking && (
            <span className="inline-flex items-center gap-x-1 rounded-full bg-sage-50 px-3 py-1.5 text-xs text-sage-600 font-medium">
              <svg className="size-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h4a4 4 0 010 8H8V7zM8 22V7M3 22h10" />
              </svg>
              Parking
            </span>
          )}
          {meta.highlights
            .filter((h) => !h.includes("Bedroom") && !h.includes("Kitchen"))
            .map((h) => (
              <span
                key={h}
                className="inline-flex items-center gap-x-1 rounded-full bg-sage-50 px-3 py-1.5 text-xs text-sage-600 font-medium"
              >
                <svg className="size-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {h === "Private Pool" ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 17.5c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 21c2-2 4-2 6 0s4 2 6 0 4-2 6 0M5 14V7a2 2 0 012-2h0a2 2 0 012 2v.5" />
                  ) : h === "Unique Design" ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                  ) : h === "City Center" ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  ) : h === "Cozy Retreat" ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  )}
                </svg>
                {h}
              </span>
            ))}
        </div>

        {/* Price + CTA */}
        <div className="mt-5 flex items-center justify-between border-t border-cream-200 pt-5">
          <div>
            <p className="text-xs text-cream-400 uppercase tracking-wider">
              From
            </p>
            <p className="text-lg font-semibold text-sage-800">
              {formatPrice(property.original_min_price, property.currency_code)}
              <span className="text-sm font-normal text-cream-500">
                {" "}
                / night
              </span>
            </p>
          </div>
          <span className="inline-flex items-center gap-x-1.5 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white group-hover:bg-rose-700 transition-colors">
            View Property
            <svg
              className="size-4 transition-transform group-hover:translate-x-0.5"
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
          </span>
        </div>
      </div>
    </motion.div>
    </Link>
  );
}

export default function PropertyListings() {
  const [properties, setProperties] = useState<LodgifyProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await fetch("/api/lodgify/properties");
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        setProperties(data);
      } catch {
        setProperties(fallbackProperties);
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, []);

  const displayProperties =
    properties.length > 0 ? properties : fallbackProperties;

  return (
    <section
      id="properties"
      className="py-16 sm:py-24 lg:py-32 relative overflow-hidden"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <AnimatedSection>
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block text-xs tracking-[0.3em] uppercase text-sage-500 font-semibold mb-4">
              Our Properties
            </span>
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-sage-800 sm:text-3xl lg:text-4xl">
              Find Your Perfect <span className="text-gradient">Stay</span>
            </h2>
          </div>
        </AnimatedSection>

        {/* Property grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {displayProperties.map((property, i) => (
            <AnimatedSection key={property.id} delay={i * 0.15}>
              <PropertyCard
                property={property}
                loading={loading}
              />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
