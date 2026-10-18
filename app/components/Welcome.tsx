"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import AnimatedSection from "./AnimatedSection";

export default function Welcome() {
  return (
    <section id="welcome" className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-sage-50/50 to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section label */}
        <AnimatedSection>
          <span className="inline-block text-xs tracking-[0.3em] uppercase text-sage-500 font-semibold mb-4">
            About Us
          </span>
        </AnimatedSection>

        <div className="grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-2 items-center">
          {/* Text */}
          <div>
            <AnimatedSection>
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-sage-800 sm:text-4xl lg:text-5xl leading-[1.1]">
                Welcome to Our
                <br />
                <span className="text-gradient">Exclusive</span> Quezon City
                Retreats
              </h2>
            </AnimatedSection>

            <AnimatedSection delay={0.15}>
              <p className="mt-8 text-base/7 text-cream-500">
                Experience unique comfort and unique charm with our Quezon City
                residences. Each property is designed to provide a distinctive
                and memorable stay, combining modern amenities with inviting
                atmospheres.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.25}>
              <p className="mt-4 text-base/7 text-cream-500">
                Wake up in a stylish and thoughtfully designed space, perfect for
                both relaxation and productivity. Enjoy the convenience of our
                prime locations, close to major attractions and dining options.
                Whether you&apos;re here for business or leisure, our homes
                offer the ideal retreat in the heart of Quezon City.
              </p>
            </AnimatedSection>

            {/* Stats */}
            <AnimatedSection delay={0.35}>
              <div className="mt-8 sm:mt-10 grid grid-cols-3 gap-4 sm:gap-6">
                {[
                  { value: "8.7", label: "Booking.com\nRating" },
                  { value: "500+", label: "Happy\nGuests" },
                  { value: "4.9", label: "Airbnb\nRating" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl sm:text-3xl font-serif font-semibold text-gradient">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-cream-500 whitespace-pre-line leading-tight">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>

          {/* Image */}
          <AnimatedSection delay={0.2}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-sage-900/10">
                <Image
                  src="/logo-wall.png"
                  alt="Tropical Pool House logo displayed in property entrance"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                />
                {/* Gradient overlay at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-sage-900/30 via-transparent to-transparent" />
              </div>

              {/* Floating card accent */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="absolute -bottom-6 -left-6 glass rounded-xl p-4 shadow-xl border border-white/50 hidden sm:block"
              >
                <div className="flex items-center gap-x-3">
                  <div className="flex -space-x-2">
                    {[
                      { initials: "KM", gradient: "from-orange-400 to-rose-500" },
                      { initials: "MS", gradient: "from-emerald-400 to-teal-500" },
                      { initials: "JC", gradient: "from-violet-400 to-purple-500" },
                    ].map((a) => (
                      <div
                        key={a.initials}
                        className={`size-8 rounded-full bg-gradient-to-br ${a.gradient} border-2 border-white flex items-center justify-center text-[10px] font-bold text-white`}
                      >
                        {a.initials}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-sage-800">
                      500+ guests
                    </p>
                    <p className="text-xs text-cream-500">loved their stay</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
