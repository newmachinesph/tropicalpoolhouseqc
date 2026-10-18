"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import AnimatedSection from "./AnimatedSection";
import { CurrencySelector } from "./CurrencyContext";

export default function Footer() {
  return (
    <footer className="relative bg-sage-900 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(190,162,206,0.05),transparent_60%)]" />
      <div className="noise absolute inset-0" />

      {/* CTA Banner */}
      <div className="relative border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <AnimatedSection>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">
                Ready for your <span className="text-gradient">tropical escape</span>?
              </h2>
              <p className="mt-4 text-base/7 text-sage-400">
                Book now and experience the best staycation in Quezon City.
              </p>
              <motion.a
                href="/all-properties"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="mt-8 inline-flex items-center gap-x-2 rounded-full bg-rose-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-rose-600/20 hover:bg-rose-700 transition-colors"
              >
                Book Your Stay
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
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Main footer */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-y-10 py-12 sm:grid-cols-2 lg:grid-cols-4 gap-x-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div>
              <p className="text-sm font-semibold text-white tracking-wide">
                Tropical Pool House
              </p>
              <p className="text-xs text-sage-400">
                Quezon City, Philippines
              </p>
            </div>
            <p className="mt-4 max-w-xs text-sm/6 text-sage-400">
              Premium vacation rentals in the heart of Quezon City. Experience
              luxury, comfort, and unforgettable moments.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-white/50 font-semibold mb-4">
              Properties
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Tropical Poolhouse QC", href: "/tropical-poolhouse" },
                { label: "Cubao Caveroom", href: "/cubao-caveroom" },
                { label: "All Properties", href: "/all-properties" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-sage-400 hover:text-sage-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-white/50 font-semibold mb-4">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-sage-400">
              <li className="flex items-start gap-x-2">
                <svg
                  className="size-4 mt-0.5 text-sage-300/60 shrink-0"
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
                29 North Road, Quezon City, NCR, Philippines 1111
              </li>
              <li>
                <a
                  href="mailto:info@khawahospitality.com"
                  className="flex items-center gap-x-2 hover:text-sage-300 transition-colors"
                >
                  <svg
                    className="size-4 text-sage-300/60 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                  info@khawahospitality.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-y-4 border-t border-white/5 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-sage-500">
            &copy; {new Date().getFullYear()} Tropical Poolhouse QC. All rights reserved.
          </p>
          <div className="flex items-center gap-x-5">
            {/* Currency */}
            <CurrencySelector variant="footer" />
            <div className="h-3 w-px bg-white/10" />
            {/* Social */}
            <div className="flex items-center gap-x-4">
              <a
                href="https://www.facebook.com/tropicalpoolhouseqc"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-sage-500 hover:text-white transition-colors"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/tropicalpoolhouseqc"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-sage-500 hover:text-white transition-colors"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
