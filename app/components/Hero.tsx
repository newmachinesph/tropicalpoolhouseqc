"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import BookingSearch from "./BookingSearch";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background image */}
      <Image
        src="/0c552f04-f279-406d-beb5-a87a423bdc31.jpg"
        alt="Tropical Pool House interior with logo sign"
        fill
        className="object-cover blur-sm scale-105"
        priority
      />
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-sage-900/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-sage-900/80 via-sage-900/40 to-transparent" />

      {/* Two-column layout: text left, booking right */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pt-32 pb-20 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-12 lg:gap-16 items-center">
          {/* Left — text */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-8"
            >
              <span className="inline-flex items-center gap-x-2 rounded-full border border-sage-300/30 bg-sage-300/10 px-4 py-1.5 text-xs tracking-[0.2em] uppercase text-sage-200 backdrop-blur-sm">
                <span className="size-1.5 rounded-full bg-orange-400 animate-pulse" />
                Quezon City, Philippines
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-7xl leading-[0.95]"
            >
              Your tropical
              <br />
              <span className="text-gradient">escape</span> in
              <br />
              the city
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-6 sm:mt-8 max-w-lg text-base/7 sm:text-lg/8 text-cream-200/70"
            >
              Experience exclusive pool houses and uniquely designed cave rooms in
              the heart of Quezon City. Where luxury meets comfort.
            </motion.p>

            {/* Badges row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="mt-8 flex flex-col items-start gap-3"
            >
              <div className="glass-dark rounded-lg px-4 py-2.5 flex items-center gap-x-2.5 border border-white/10">
                <Image
                  src="/Airbnb_Logo_Bélo.svg"
                  alt="Airbnb"
                  width={58}
                  height={18}
                  className="brightness-0 invert h-[18px] w-auto"
                />
                <div className="h-5 w-px bg-white/20" />
                <span className="text-xs text-white/70">Guest Favorite</span>
              </div>
              <div className="glass-dark rounded-lg px-4 py-2.5 flex items-center gap-x-2.5 border border-white/10">
                <Image
                  src="/Booking.com_logo.svg"
                  alt="Booking.com"
                  width={106}
                  height={18}
                  className="brightness-0 invert h-[18px] w-auto"
                />
                <div className="h-5 w-px bg-white/20" />
                <span className="text-xs text-white/70">Fabulous | 8.7</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="mt-8 sm:mt-10 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4"
            >
              <motion.a
                href="/all-properties"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-full bg-rose-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-rose-600/30 hover:bg-rose-700 transition-colors text-center"
              >
                Book Your Stay
              </motion.a>
              <motion.a
                href="#properties"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group rounded-full border border-white/20 bg-white/5 backdrop-blur-sm px-8 py-3.5 text-sm font-medium text-white hover:bg-white/10 transition-all flex items-center justify-center gap-x-2"
              >
                Explore Properties
                <svg
                  className="size-4 transition-transform group-hover:translate-x-1"
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
              </motion.a>
            </motion.div>
          </div>

          {/* Right — Custom booking search */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            id="booking"
          >
            <div className="glass-dark rounded-2xl border border-white/10 p-4 sm:p-6 shadow-2xl">
              <BookingSearch />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex flex-col items-center gap-y-2"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">
            Scroll
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-orange-400/60 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
}
