"use client";

import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";

const activities = [
  {
    name: "Eastwood City Mall",
    category: "Shopping & Dining",
    description:
      "A vibrant mall complex with shops, restaurants, and a walk-in park.",
    distance: "10 min drive",
    icon: (
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
          d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
      </svg>
    ),
  },
  {
    name: "Art in Island Museum",
    category: "Art & Culture",
    description:
      "Southeast Asia's largest 3D interactive art museum. Perfect for photos.",
    distance: "15 min drive",
    icon: (
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
          d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
        />
      </svg>
    ),
  },
  {
    name: "La Mesa Eco Park",
    category: "Nature & Outdoors",
    description:
      "Scenic trails, picnic areas, and lake views. A green oasis in the city.",
    distance: "20 min drive",
    icon: (
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
          d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 00-8.862 12.872M12.75 3.031a9 9 0 016.69 14.036m0 0l-.177-.529A2.25 2.25 0 0017.128 15H16.5l-.324-.324a1.453 1.453 0 00-2.328.377l-.036.073a1.586 1.586 0 01-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 01-5.276 3.67"
        />
      </svg>
    ),
  },
  {
    name: "Cubao Expo",
    category: "Nightlife & Culture",
    description:
      "Vintage shops, art galleries, and lively bars in a retro complex.",
    distance: "10 min drive",
    icon: (
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
          d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
        />
      </svg>
    ),
  },
  {
    name: "UP Diliman Campus",
    category: "Parks & Heritage",
    description:
      "Historic university grounds with the iconic Sunken Garden and Oblation.",
    distance: "15 min drive",
    icon: (
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
          d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
        />
      </svg>
    ),
  },
  {
    name: "Maginhawa Food Street",
    category: "Food & Drink",
    description:
      "Quezon City's famous food street with hundreds of unique eateries.",
    distance: "12 min drive",
    icon: (
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
          d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M16.5 8.25V4.125a2.25 2.25 0 00-2.25-2.25h-4.5a2.25 2.25 0 00-2.25 2.25V8.25"
        />
      </svg>
    ),
  },
];

export default function ThingsToDo() {
  return (
    <section
      id="things-to-do"
      className="py-16 sm:py-24 lg:py-32 relative overflow-hidden"
    >
      {/* Subtle background accent */}
      <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-sage-50/30 to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <AnimatedSection>
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block text-xs tracking-[0.3em] uppercase text-sage-500 font-semibold mb-4">
              Explore Quezon City
            </span>
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-sage-800 sm:text-3xl lg:text-4xl">
              Things to <span className="text-gradient">Do</span> Nearby
            </h2>
            <p className="mt-4 mx-auto max-w-xl text-base/7 text-cream-500">
              From food crawls to art museums, Quezon City has something for
              every traveler.
            </p>
          </div>
        </AnimatedSection>

        {/* Activity grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity, i) => (
            <AnimatedSection key={activity.name} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group rounded-2xl border border-cream-200 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-sage-300 transition-all h-full"
              >
                {/* Icon + category */}
                <div className="flex items-center gap-x-3 mb-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sage-50">
                    {activity.icon}
                  </div>
                  <span className="text-xs font-medium text-sage-400 uppercase tracking-wider">
                    {activity.category}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-semibold text-sage-800 group-hover:text-sage-600 transition-colors">
                  {activity.name}
                </h3>
                <p className="mt-2 text-sm/6 text-cream-500">
                  {activity.description}
                </p>

                {/* Distance tag */}
                <div className="mt-4 flex items-center gap-x-1.5 text-sage-400">
                  <svg
                    className="size-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                  <span className="text-xs font-medium">
                    {activity.distance}
                  </span>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
