"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import AnimatedSection from "./AnimatedSection";

const photos = [
  { src: "/29047837-0f35-4883-9cc4-32bfa193df28.jpg", caption: "Pool vibes" },
  { src: "/2b60406f-8345-4b3f-bbf5-51cdfb22ab1e.jpg", caption: "Relax & unwind" },
  { src: "/3518b0e5-4e7e-42d5-a2dc-78e0d9c84905.jpg", caption: "Tropical living" },
  { src: "/36a6612f-1b35-46a4-90f8-c7686d3a5f67.jpg", caption: "Good times" },
  { src: "/399bc411-4005-47cc-9a7a-98042eb38450.jpg", caption: "Paradise found" },
  { src: "/40f0b86a-a61c-422a-aa63-cce4e129e721.jpg", caption: "Escape the city" },
  { src: "/6659b110-d90f-4157-9482-0f08d2ee809c.jpg", caption: "Stay & play" },
  { src: "/953e9bae-b61f-46f3-a6ed-ffd0d8ebd6fb.jpg", caption: "Weekend goals" },
  { src: "/a031eec1-cb18-444f-b905-4b6f08ae7709.jpg", caption: "Chill spot" },
  { src: "/c9057b12-b132-4b0f-85a3-95dc0b92f30c.jpg", caption: "Poolside" },
  { src: "/e6167384-7b42-4297-9268-3e89863ec66c.jpg", caption: "Memories made" },
];

const rotations = [-3, 2, -1.5, 3, -2, 1.5, -2.5, 2.5, -1, 3, -2];

function PolaroidCard({ photo, index }: { photo: typeof photos[number]; index: number }) {
  return (
    <div className="shrink-0" style={{ rotate: `${rotations[index % rotations.length]}deg` }}>
      <div className="relative group">
        {/* Pin / clip */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
          <div className="size-3 rounded-full bg-sage-600 border-2 border-sage-400 shadow-sm" />
          <div className="w-px h-4 bg-sage-400/50" />
        </div>

        <div className="bg-white rounded-sm shadow-lg shadow-sage-900/10 p-3 pb-5 sm:p-4 sm:pb-6 w-[240px] sm:w-[300px] lg:w-[360px] transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl">
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-cream-100">
            <Image
              src={photo.src}
              alt={photo.caption}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 240px, (max-width: 1024px) 300px, 360px"
            />
          </div>
          <p className="mt-3 text-center text-sm text-sage-600 font-medium" style={{ fontFamily: "var(--font-serif)" }}>
            {photo.caption}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PhotoGallery() {
  return (
    <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-10 sm:mb-16">
        <AnimatedSection>
          <div className="text-center">
            <span className="inline-block text-xs tracking-[0.3em] uppercase text-sage-500 font-semibold mb-4">
              Gallery
            </span>
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-sage-800 sm:text-3xl lg:text-4xl">
              Snapshots from <span className="text-gradient">Paradise</span>
            </h2>
          </div>
        </AnimatedSection>
      </div>

      {/* Infinite scroll track */}
      <div className="overflow-hidden">
        <motion.div
          className="flex gap-6 sm:gap-10 pt-6 pb-12 pl-4 sm:pl-0 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ x: { repeat: Infinity, repeatType: "loop", duration: 60, ease: "linear" } }}
        >
          {/* First set */}
          {photos.map((photo, i) => (
            <PolaroidCard key={`a-${i}`} photo={photo} index={i} />
          ))}
          {/* Duplicate for seamless loop */}
          {photos.map((photo, i) => (
            <PolaroidCard key={`b-${i}`} photo={photo} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
