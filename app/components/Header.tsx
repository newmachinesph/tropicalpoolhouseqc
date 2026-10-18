"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import PromotionsBanner from "./PromotionsBanner";
import { CurrencySelector } from "./CurrencyContext";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Tropical Poolhouse QC", href: "/tropical-poolhouse" },
  { label: "Cubao Caveroom", href: "/cubao-caveroom" },
];

export default function Header({ light = false, hideDesktopNav = false }: { light?: boolean; hideDesktopNav?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Scroll progress bar */}
      <ScrollProgress />

      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || light
            ? "bg-white shadow-lg shadow-black/5 border-b border-cream-200"
            : "bg-transparent"
        }`}
      >
        {/* Promotions banner — hides on scroll */}
        <div
          className={`transition-all duration-500 overflow-hidden ${
            scrolled || light ? "max-h-0 opacity-0" : "max-h-20 opacity-100"
          }`}
        >
          <PromotionsBanner />
        </div>

        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4 lg:px-8">
          {/* Currency */}
          <div className="flex lg:flex-1">
            <div className="hidden sm:block">
              <CurrencySelector variant="header" scrolled={scrolled} light={light} />
            </div>
          </div>

          {/* Logo — larger */}
          <Link href="/" className="flex flex-col items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Image
                src="/logo.svg"
                alt="Tropical Pool House"
                width={72}
                height={58}
                className={`w-[48px] sm:w-[60px] lg:w-[72px] h-auto transition-all duration-300 ${
                  scrolled || light ? "" : "brightness-0 invert"
                }`}
                priority
              />
            </motion.div>
          </Link>

          {/* Spacer for layout balance */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end" />

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              className={`-m-2.5 rounded-md p-2.5 transition-colors ${
                scrolled || light ? "text-sage-700" : "text-white"
              }`}
              onClick={() => setMobileOpen(true)}
              aria-expanded={mobileOpen}
              aria-label="Open menu"
            >
              <svg
                className="size-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </nav>

        {/* Desktop nav links — on property pages: visible at top, hidden on scroll */}
        <div
          className={`hidden lg:flex items-center justify-center gap-x-10 pb-3 transition-all ${
            hideDesktopNav
              ? (scrolled ? "opacity-0 pointer-events-none h-0 pb-0" : "opacity-100")
              : (scrolled || light ? "opacity-100" : "opacity-0 pointer-events-none h-0 pb-0")
          }`}
        >
          {navigation.map((item) =>
            item.href.startsWith("/") ? (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-neutral-500 hover:text-sage-700 transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sage-500 transition-all group-hover:w-full" />
              </Link>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-neutral-500 hover:text-sage-700 transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sage-500 transition-all group-hover:w-full" />
              </a>
            )
          )}
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-[70] w-full max-w-sm bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <Image
                  src="/logo.svg"
                  alt="Tropical Pool House"
                  width={56}
                  height={45}
                />
                <button
                  className="-m-2.5 rounded-md p-2.5 text-neutral-500"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <svg
                    className="size-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="px-6 py-8 space-y-1">
                {navigation.map((item, i) => {
                  const className = "block rounded-lg px-4 py-3 text-base font-medium text-neutral-700 hover:bg-sage-50 hover:text-sage-700 transition-colors";
                  const motionProps = {
                    initial: { opacity: 0, x: 20 } as const,
                    animate: { opacity: 1, x: 0 } as const,
                    transition: { delay: 0.1 + i * 0.05 },
                  };
                  return item.href.startsWith("/") ? (
                    <motion.div key={item.label} {...motionProps}>
                      <Link
                        href={item.href}
                        className={className}
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ) : (
                    <motion.a
                      key={item.label}
                      href={item.href}
                      {...motionProps}
                      className={className}
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </motion.a>
                  );
                })}
                {/* Currency selector in mobile menu */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + navigation.length * 0.05 }}
                  className="pt-4 mt-4 border-t border-gray-100 px-4"
                >
                  <p className="text-xs text-neutral-400 uppercase tracking-wider mb-2">Currency</p>
                  <CurrencySelector variant="header" scrolled light />
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const total =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? window.scrollY / total : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px]">
      <motion.div
        className="h-full bg-gradient-to-r from-orange-400 via-rose-500 to-orange-400"
        style={{ scaleX: progress, transformOrigin: "left" }}
      />
    </div>
  );
}
