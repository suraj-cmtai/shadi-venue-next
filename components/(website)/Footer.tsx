"use client";

import { motion } from "framer-motion";
import { Facebook, Twitter, Linkedin, Rss } from "lucide-react";

/**
 * Footer component - Responsive, accessible, Figma-fidelity footer for Shadi Venue.
 * - Uses Tailwind utilities for all sizing, spacing, and layout.
 * - Responsive: stacks vertically on mobile, horizontal on desktop.
 * - No fixed pixel values; all sizing is via Tailwind classes.
 * - Uses map for nav and social items.
 * - Decorative flower image is visually hidden on mobile.
 * - All images and icons are accessible.
 */

const IMAGES = [
  "/images/footer-image-1.png",
  "/images/footer-image-2.png",
  "/images/footer-image-3.png",
  "/images/footer-image-4.png",
  "/images/footer-image-5.png",
  "/images/footer-image-6.png",
];
const LOGO_IMG = "/images/footer.png";
const FLOWER_IMG = "/images/flower-petals.svg";

const NAV1 = ["Theme", "Hotels", "Contact"];
const NAV2 = ["About Me", "Venues", "FAQ"];

const SOCIALS = [
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Rss, label: "RSS", href: "#" },
];

export default function Footer() {
  return (
    <footer className="relative w-full bg-[#212d47] text-white overflow-hidden py-8 md:py-14">
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch gap-8 md:gap-12 px-4 md:px-8">
        {/* Logo + Flower */}
        <div className="w-full lg:w-1/4 flex flex-col items-center justify-start mb-6 lg:mb-0 relative">
          <img
            src={FLOWER_IMG}
            alt="Decorative flower"
            className="hidden md:block absolute left-0 top-0 h-full w-auto max-w-xs blur-2xl opacity-60 select-none pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative z-10 flex flex-col items-center">
            <motion.img
              src={LOGO_IMG}
              alt="Shadi Venue Logo"
              className="h-10 md:h-16 w-auto drop-shadow-lg"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        {/* Images + Info */}
        <div className="w-full lg:w-3/4 flex flex-col items-center">
          {/* Images row */}
          <div className="w-full flex justify-center mb-6">
            <div className="flex flex-row flex-wrap justify-center items-center gap-2 md:gap-4 w-full max-w-2xl">
              {IMAGES.map((src, i) => (
                <motion.div
                  key={src}
                  className="relative h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 rounded-xs overflow-y-clip overflow-x-auto bg-center bg-cover shadow-lg border-2 border-white flex-shrink-0"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                >
                  <img
                    src={src}
                    alt={`Gallery ${i + 1}`}
                    className="object-cover w-full h-full"
                  />
                </motion.div>
              ))}
            </div>
          </div>
          {/* Info sections: nav, nav, address, social */}
          <div className="w-full flex flex-col sm:flex-row items-stretch justify-center gap-6 md:gap-0 text-left  max-w-2xl mx-auto">
            {/* Nav 1 */}
            <div className="flex-1 flex flex-col items-center sm:items-start gap-2 min-w-[90px]">
              <ul className="list-disc list-inside space-y-1">
                {NAV1.map((item) => (
                  <li
                    key={item}
                    className="font-bold font-cormorant text-base md:text-lg leading-8 uppercase"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Nav 2 */}
            <div className="flex-1 flex flex-col items-center sm:items-start gap-2 min-w-[90px]">
              <ul className="list-disc list-inside space-y-1">
                {NAV2.map((item) => (
                  <li
                    key={item}
                    className="font-bold font-cormorant text-base md:text-lg leading-8 uppercase"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Address */}
            <div className="flex-1 flex flex-col justify-center items-center sm:items-start font-bold font-cormorant text-base md:text-lg leading-8 min-w-[120px]">
              <span>Orchid Center, Golf</span>
              <span>course road , Gurgaon</span>
            </div>
            {/* Social & Email */}
            <div className="flex-1 flex flex-col items-center gap-2 min-w-[120px] mt-4 sm:mt-0">
              <span className="font-bold font-cormorant text-base md:text-lg">@shadi venue.com</span>
              <div className="h-px w-16 my-2 bg-white/40" aria-hidden="true" />
              {/* Social icons row */}
              <div className="flex flex-row items-center justify-center gap-3 mt-1">
                {SOCIALS.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="hover:text-primary transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
