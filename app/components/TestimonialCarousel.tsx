"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedSection from "./AnimatedSection";

const avatarColors = [
  "from-orange-400 to-rose-500",
  "from-emerald-400 to-teal-500",
  "from-violet-400 to-purple-500",
  "from-sky-400 to-blue-500",
  "from-amber-400 to-orange-500",
  "from-pink-400 to-fuchsia-500",
  "from-teal-400 to-cyan-500",
  "from-rose-400 to-red-500",
  "from-indigo-400 to-violet-500",
  "from-lime-400 to-emerald-500",
];

function getInitials(name: string) {
  const parts = name.replace(/\s+[A-Z]\.?$/, "").split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
}

const testimonials = [
  {
    stars: 5,
    text: `After long flight from USA my wife's family met us and we sent to the house. It was exactly as advertised and easily accommodated all 10 of us. The kids enjoyed the pool and we were able to rest after our travels. I love that the house was freshly cleaned up, big bedrooms, big bathrooms with walk-in closets and all bathrooms have warm water heater! It's a major plus points since we have seniors and a baby girl who needs a warm shower. We would really consider booking with them again!`,
    author: "Kenneth Manuel P.",
    platform: "Airbnb",
  },
  {
    stars: 5,
    text: `The place was absolutely stunning! Clean, spacious, and the pool was perfect for our family gathering. The host was very accommodating and responsive. Location is great, close to restaurants and malls. We had an amazing weekend staycation. Highly recommended for families and groups looking for a private pool experience in Quezon City!`,
    author: "Maria Santos R.",
    platform: "Booking.com",
  },
  {
    stars: 5,
    text: `Best staycation experience we've had in QC! The property exceeded our expectations. Everything was well-maintained and the amenities were top-notch. The pool area is beautiful and very Instagram-worthy. The bedrooms are comfortable with clean linens. We'll definitely be coming back for our next celebration!`,
    author: "James dela Cruz",
    platform: "Airbnb",
  },
  {
    stars: 5,
    text: `We booked this place for my daughter's birthday party and it was perfect! The house is beautiful, the pool is clean, and there's plenty of space for everyone. The host was very helpful with our arrangements. The kids absolutely loved it. Great value for money considering the size and quality of the property.`,
    author: "Angela Reyes T.",
    platform: "Booking.com",
  },
  {
    stars: 5,
    text: `A hidden gem in the heart of Quezon City! We were looking for a venue for our team building and this property was the perfect choice. Spacious living areas, well-equipped kitchen, and the pool area was the highlight. Everything was spotless upon arrival. Will definitely recommend to colleagues!`,
    author: "Patrick Lim S.",
    platform: "Airbnb",
  },
  {
    stars: 5,
    text: `Our family reunion was a blast at this beautiful property! Accommodated all 15 of us comfortably. The pool was the center of all fun activities. Kitchen was fully stocked for our cooking needs. The location is accessible yet peaceful. Already planning our next visit!`,
    author: "Christine Go M.",
    platform: "Booking.com",
  },
  {
    stars: 5,
    text: `Exceeded all our expectations! From the moment we arrived, everything was perfect. The house is exactly as pictured, if not better in person. Clean, comfortable beds, great water pressure, and the pool was sparkling clean. The host went above and beyond to make our stay memorable.`,
    author: "Roberto Tan V.",
    platform: "Airbnb",
  },
  {
    stars: 5,
    text: `We celebrated New Year's Eve here and it was absolutely perfect. The property has everything you need for a great celebration. The outdoor area with the pool was the highlight. Neighbors were quiet and we had complete privacy. One of the best vacation rentals we've stayed at!`,
    author: "Diana Cruz L.",
    platform: "Booking.com",
  },
  {
    stars: 5,
    text: `Amazing property for the price! We booked for a weekend getaway with friends and had the time of our lives. The pool is well-maintained, rooms are spacious, and the common areas are great for socializing. Very clean and the host is very responsive. Five stars all the way!`,
    author: "Michael Aquino B.",
    platform: "Airbnb",
  },
  {
    stars: 5,
    text: `This was our third time booking and it never disappoints! The property is always well-maintained and clean. Perfect for our annual family gathering. The kids love the pool and the adults love the comfortable living spaces. Already booked for next year!`,
    author: "Sofia Mendoza P.",
    platform: "Booking.com",
  },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 80 : -80, opacity: 0 }),
};

export default function TestimonialCarousel() {
  const [[current, direction], setSlide] = useState([0, 0]);

  const paginate = useCallback(
    (dir: number) => {
      setSlide(([prev]) => [
        (prev + dir + testimonials.length) % testimonials.length,
        dir,
      ]);
    },
    []
  );

  useEffect(() => {
    const timer = setInterval(() => paginate(1), 6000);
    return () => clearInterval(timer);
  }, [paginate]);

  const t = testimonials[current];

  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-sage-800 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(190,162,206,0.08),transparent_70%)]" />
      <div className="noise absolute inset-0" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <AnimatedSection>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block text-xs tracking-[0.3em] uppercase text-sage-300 font-semibold mb-4">
              Testimonials
            </span>
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
              Top-Tier Experiences From Our Happy Customers
            </h2>
            <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-orange-400 to-transparent" />
          </div>
        </AnimatedSection>

        {/* Carousel */}
        <div className="relative mx-auto mt-10 sm:mt-16 max-w-3xl">
          {/* Quote mark */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-orange-400/10 text-[120px] font-serif leading-none select-none">
            &ldquo;
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-x-1 mb-10">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className="size-5 text-orange-400 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>

          {/* Slide */}
          <div className="relative min-h-[180px] sm:min-h-[220px] flex items-center justify-center">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="text-center w-full"
              >
                <p className="font-serif italic text-base/7 text-white/80 sm:text-lg/8 lg:text-xl/9">
                  {t.text}
                </p>
                <div className="mt-8 flex items-center justify-center gap-x-3">
                  <div
                    className={`size-10 rounded-full bg-gradient-to-br ${avatarColors[current % avatarColors.length]} flex items-center justify-center text-white text-sm font-bold shadow-lg`}
                  >
                    {getInitials(t.author)}
                  </div>
                  <div className="text-left">
                    <p className="text-base font-semibold text-white">
                      {t.author}
                    </p>
                    <p className="text-xs text-orange-400/70 tracking-wider uppercase">
                      via {t.platform}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Arrows */}
          <div className="flex items-center justify-center gap-x-3 sm:gap-x-4 mt-8 sm:mt-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => paginate(-1)}
              aria-label="Previous testimonial"
              className="size-12 rounded-full border border-white/10 bg-white/5 hover:bg-orange-400/20 hover:border-orange-400/30 text-white flex items-center justify-center transition-colors"
            >
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </motion.button>

            {/* Mobile counter */}
            <span className="text-xs text-white/50 tabular-nums sm:hidden">
              {current + 1} / {testimonials.length}
            </span>

            {/* Dots — hidden on xs, shown on sm+ */}
            <div className="hidden sm:flex gap-x-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() =>
                    setSlide([i, i > current ? 1 : -1])
                  }
                  aria-label={`Go to testimonial ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-8 h-2 bg-orange-400"
                      : "size-2 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => paginate(1)}
              aria-label="Next testimonial"
              className="size-12 rounded-full border border-white/10 bg-white/5 hover:bg-orange-400/20 hover:border-orange-400/30 text-white flex items-center justify-center transition-colors"
            >
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
