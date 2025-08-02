"use client";

import { motion } from "framer-motion";
import BookAnAppointmentButton from "@/components/ui/BookAnAppointmentButton";
import GradientButton from "@/components/GradientButton";

// Image URLs
const IMAGES_IMG = "/images/venue-image-1.png";
const FINISHING_TOUCHES_IMG = "/images/venue-image-2.png";
const IMAGES1_IMG = "/images/venue-image-3.png";
const FINISHING_TOUCHES1_IMG = "/images/venue-image-4.png"; // Use a different image for the 4th card if available

const VENUES = [
  {
    title: "Banquet Hall",
    img: IMAGES_IMG,
  },
  {
    title: "Marriage Garden / Lawns",
    img: FINISHING_TOUCHES_IMG,
  },
  {
    title: "Wedding Resorts",
    img: IMAGES1_IMG,
  },
  {
    title: "Destination Wedding Venues",
    img: FINISHING_TOUCHES1_IMG,
  },
];

export default function Venue() {
  return (
    <section className="relative w-full bg-white py-12 md:py-20">
      {/* Decorative element (top left, faded) */}
      <div className="pointer-events-none absolute left-0 top-0 z-0 h-40 w-40 md:h-72 md:w-72 opacity-10 select-none" aria-hidden>
        {/* You can use a faded SVG or background image here if available */}
      </div>

      {/* Content Container */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-8 flex flex-col items-center">
        {/* Venue Label */}
        <motion.p
          className="font-cormorant font-medium text-xs md:text-sm text-[#212d47] text-center uppercase tracking-[0.2em] mb-2 md:mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          venue
        </motion.p>

        {/* Main Heading */}
        <motion.h2
          className="font-cormorant font-bold text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-[#212d47] text-center leading-tight mb-10 md:mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Handpicked Restaurant Venues For Unforgettable Wedding Moments
          <span className="hidden md:inline">.</span>
        </motion.h2>

        {/* Venue Cards Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full mb-10 md:mb-16"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.12,
              },
            },
          }}
        >
          {VENUES.map((venue, idx) => (
            <motion.div
              key={venue.title}
              className="relative group rounded-xs overflow-hidden shadow-none flex flex-col h-full"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <div
                className="w-full h-full min-h-[220px] md:min-h-[280px] lg:min-h-[320px] bg-center bg-cover border border-[#212d47] rounded-xs flex-1"
                style={{
                  backgroundImage: `url('${venue.img}')`,
                }}
              />
              {/* Overlay label */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-6 w-[85%]">
                <div className="bg-[#212d47] border border-white px-2 py-2 md:py-3 md:px-0 w-full rounded-xs">
                  <p className="font-cormorant font-medium md:font-bold text-xs md:text-base lg:text-lg xl:text-xl text-white text-center uppercase tracking-wide">
                    {venue.title}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-full flex justify-center"
        >
          <GradientButton className="px-8 py-2 text-xs md:text-sm font-medium tracking-wider bg-[#212d47] text-white border border-[#212d47] rounded-xs shadow-none hover:bg-[#1a2236] transition">
            EXPLORE MORE
          </GradientButton>
        </motion.div>
      </div>
    </section>
  );
}
