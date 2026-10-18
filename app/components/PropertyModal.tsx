"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import AvailabilityCalendar from "./AvailabilityCalendar";
import PriceCalculator from "./PriceCalculator";

interface PropertyModalProps {
  open: boolean;
  onClose: () => void;
  propertyId: number;
  roomTypeId: number;
  propertyName: string;
  maxGuests: number;
  images: string[];
  description: string;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
}

export default function PropertyModal({
  open,
  onClose,
  propertyId,
  roomTypeId,
  propertyName,
  maxGuests,
  images,
  description,
  bedrooms,
  bathrooms,
  amenities,
}: PropertyModalProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Auto-rotate images
  useEffect(() => {
    if (!open || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImage((c) => (c + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [open, images.length]);

  // Reset on open
  useEffect(() => {
    if (open) setCurrentImage(0);
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const prevImage = useCallback(() => {
    setCurrentImage((c) => (c - 1 + images.length) % images.length);
  }, [images.length]);

  const nextImage = useCallback(() => {
    setCurrentImage((c) => (c + 1) % images.length);
  }, [images.length]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 sm:inset-8 lg:inset-12 z-[90] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-cream-200 flex-shrink-0">
              <h2 className="font-serif text-xl font-semibold text-sage-800">
                {propertyName}
              </h2>
              <button
                onClick={onClose}
                className="size-9 rounded-full flex items-center justify-center text-cream-500 hover:bg-cream-100 transition-colors"
              >
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-6xl mx-auto px-5 sm:px-6 py-6 space-y-8">
                {/* Image gallery */}
                {images.length > 0 && (
                  <div className="relative rounded-xl overflow-hidden aspect-[16/9] sm:aspect-[2/1] bg-cream-100">
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
                          sizes="(max-width: 1024px) 90vw, 70vw"
                          unoptimized
                        />
                      </motion.div>
                    </AnimatePresence>

                    {/* Nav arrows */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors"
                        >
                          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors"
                        >
                          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        {/* Dots */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-x-1.5">
                          {images.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentImage(i)}
                              className={`size-2 rounded-full transition-all ${
                                i === currentImage
                                  ? "bg-white w-5"
                                  : "bg-white/50 hover:bg-white/70"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Counter */}
                    <div className="absolute top-3 right-3 rounded-full bg-black/30 backdrop-blur-sm px-3 py-1 text-xs text-white">
                      {currentImage + 1} / {images.length}
                    </div>
                  </div>
                )}

                {/* Quick facts */}
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-x-1.5 rounded-full bg-sage-50 px-4 py-2 text-sm text-sage-700 font-medium">
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                    Up to {maxGuests} guests
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 rounded-full bg-sage-50 px-4 py-2 text-sm text-sage-700 font-medium">
                    {bedrooms} Bedroom{bedrooms > 1 ? "s" : ""}
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 rounded-full bg-sage-50 px-4 py-2 text-sm text-sage-700 font-medium">
                    {bathrooms} Bathroom{bathrooms > 1 ? "s" : ""}
                  </span>
                  {amenities.slice(0, 8).map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center rounded-full bg-cream-100 px-4 py-2 text-sm text-cream-600 font-medium"
                    >
                      {a}
                    </span>
                  ))}
                </div>

                {/* Description */}
                {description && (
                  <div
                    className="prose prose-sm max-w-none text-cream-600 prose-headings:text-sage-800 prose-headings:font-serif prose-strong:text-sage-700"
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                )}

                {/* Calendar + Price calculator */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AvailabilityCalendar propertyId={propertyId} />
                  <PriceCalculator
                    propertyId={propertyId}
                    roomTypeId={roomTypeId}
                    propertyName={propertyName}
                    maxGuests={maxGuests}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
