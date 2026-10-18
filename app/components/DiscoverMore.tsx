"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import AnimatedSection from "./AnimatedSection";

export default function DiscoverMore() {
  return (
    <section id="discover" className="py-16 sm:py-24 lg:py-32 relative overflow-hidden bg-sage-50">
      {/* Background accent */}
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-sage-50/40 to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-2 items-center">
          {/* Image */}
          <AnimatedSection>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative group"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-sage-900/15">
                <Image
                  src="/interior.png"
                  alt="Cubao Caveroom brick archway interior"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-sage-900/50 via-transparent to-transparent" />

                {/* Label overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="inline-flex items-center gap-x-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-1.5 text-xs font-medium text-white border border-white/20">
                    <span className="size-1.5 rounded-full bg-sage-300" />
                    Cubao Caveroom
                  </span>
                </div>
              </div>

              {/* Decorative border accent */}
              <div className="absolute -inset-3 rounded-2xl border border-sage-400/10 -z-10" />
            </motion.div>
          </AnimatedSection>

          {/* Text */}
          <div>
            <AnimatedSection>
              <span className="inline-block text-xs tracking-[0.3em] uppercase text-sage-500 font-semibold mb-4">
                Explore
              </span>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-sage-800 sm:text-4xl lg:text-5xl leading-[1.1]">
                Discover <span className="text-gradient">More</span>
              </h2>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <p className="mt-6 text-base/7 text-cream-500">
                Navigate our simplified website and explore our residences to
                find the perfect fit for your needs and enjoy a truly exceptional
                stay in Quezon City.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <div className="mt-8 space-y-4">
                {[
                  {
                    title: "Tropical Poolhouse QC",
                    desc: "Private pool house perfect for families and gatherings",
                    href: "/tropical-poolhouse",
                  },
                  {
                    title: "Cubao Caveroom",
                    desc: "Unique industrial-themed space for unforgettable stays",
                    href: "/cubao-caveroom",
                  },
                ].map((item) => (
                  <motion.a
                    key={item.title}
                    href={item.href}
                    whileHover={{ x: 4 }}
                    className="group flex items-start gap-x-3 sm:gap-x-4 rounded-xl border border-cream-200 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-sage-300 transition-all"
                  >
                    <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-sage-50">
                      <svg
                        className="size-5 text-sage-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-sage-800 group-hover:text-sage-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-cream-500">
                        {item.desc}
                      </p>
                    </div>
                    <svg
                      className="size-5 text-cream-300 group-hover:text-sage-400 transition-colors mt-0.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </motion.a>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.4}>
              <motion.a
                href="/all-properties"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="mt-8 inline-flex items-center gap-x-2 rounded-full bg-rose-600 px-7 py-3 text-sm font-medium text-white shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-colors"
              >
                View all properties
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
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </motion.a>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}
