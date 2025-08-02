"use client";

import { MapPin, Phone, Facebook, Twitter, Linkedin, Rss } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * TopBar component displays contact info and social media links.
 * Responsive: hidden on mobile, visible on sm+ screens.
 * Uses Lucide icons and accessible markup.
 */
const CONTACTS = [
  {
    icon: MapPin,
    label: "Location",
    value: "ORCHID CENTER, GOLF COURSE ROAD, GURGAON",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "9555119999",
  },
];

const SOCIALS = [
  {
    icon: Facebook,
    label: "Facebook",
    href: "#",
  },
  {
    icon: Twitter,
    label: "Twitter",
    href: "#",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    href: "#",
  },
  {
    icon: null,
    label: "Instagram",
    href: "#",
    svg: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    icon: Rss,
    label: "RSS Feed",
    href: "#",
  },
];

export default function TopBar() {
  return (
    <div className="hidden sm:block w-full bg-[#212d47] text-white py-2 px-4 sm:py-3 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-2 sm:gap-0 sm:flex-row justify-between items-center w-full">
        {/* Contact Details */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-6 md:gap-8 w-full sm:w-auto">
          {CONTACTS.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-white" aria-hidden="true" />
              <span className="text-xs sm:text-sm font-medium truncate" title={value}>
                {value}
              </span>
            </div>
          ))}
        </div>
        {/* Social Media Icons */}
        <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-0">
          {SOCIALS.map(({ icon: Icon, label, href, svg }) => (
            <a
              key={label}
              href={href}
              className={cn(
                "text-white hover:text-gray-300 transition-colors duration-200 flex items-center"
              )}
              aria-label={label}
              tabIndex={0}
            >
              {Icon ? <Icon className="w-4 h-4" aria-hidden="true" /> : svg}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
