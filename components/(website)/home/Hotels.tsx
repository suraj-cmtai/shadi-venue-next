"use client";

import { motion } from "framer-motion";
import GradientButton from "@/components/GradientButton";

// Figma MCP asset URLs
const IMAGES_IMG = "/images/hotels-image.png";
const VECTOR02_IMG = "/images/hotels-flower-vector-right.svg";
const VECTOR_IMG = "http://localhost:3845/assets/dba2002fa2cc741c5c2d1c6d5887fdda1add2711.svg";

// Example hotel data (can be replaced with real data)
const HOTELS = [
  {
    id: 1,
    name: "Hotels",
    image: IMAGES_IMG,
  },
  {
    id: 2,
    name: "Hotels",
    image: IMAGES_IMG,
  },
  {
    id: 3,
    name: "Hotels",
    image: IMAGES_IMG,
  },
  {
    id: 4,
    name: "Hotels",
    image: IMAGES_IMG,
  },
];

export default function Hotels() {
  return (
    <section className="relative w-full bg-neutral-50 py-16 md:py-24">
      {/* Decorative Vector (right, desktop only) */}
      <div className="hidden lg:block absolute right-0 top-0 h-full z-0">
        <img
          src={VECTOR02_IMG}
          alt="Decorative flower vector"
          className="h-full w-auto object-contain rotate-180 scale-y-[-1]"
          aria-hidden="true"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center px-4 md:px-8">
        {/* Hotels Label */}
        <motion.p
          className="font-cormorant font-medium text-lg md:text-xl text-black text-center uppercase tracking-wider mb-2 md:mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Hotels
        </motion.p>

        {/* Main Heading */}
        <motion.h2
          className="font-cormorant font-bold text-3xl md:text-5xl lg:text-6xl text-[#212d47] text-center leading-tight mb-10 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Where to Stay for the Wedding Weekend
        </motion.h2>

        {/* Hotel Cards Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-10 md:mb-16">
          {HOTELS.map((hotel, idx) => (
            <motion.div
              key={hotel.id}
              className="relative flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * (idx + 1) }}
            >
              <div
                className="bg-center bg-cover bg-no-repeat w-full aspect-[7/8] rounded-xs border border-[#212d47]"
                style={{ backgroundImage: `url('${hotel.image}')` }}
                aria-label={hotel.name}
              />
              <div className="absolute left-0 bottom-0 w-full">
                <div className="bg-[#212d47] border-t-4 border-white rounded-b-lg px-4 py-3 flex items-center">
                  <p className="font-cormorant font-bold text-lg md:text-xl text-white uppercase">
                    {hotel.name}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          className="w-full flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <GradientButton>
            explore More
          </GradientButton>
        </motion.div>
      </div>
    </section>
  );
}
