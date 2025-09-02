"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import GradientButton from "@/components/GradientButton";
import {
  fetchPremiumHotel,
  selectPremiumHotel,
  selectHotelLoading,
  selectHotelError,
} from "@/lib/redux/features/hotelSlice";
import { AppDispatch } from "@/lib/redux/store";
import Link from "next/link";

// Figma MCP asset URLs
const VECTOR02_IMG = "/images/hotels-flower-vector-right.svg";

export default function Hotels() {
  const dispatch = useDispatch<AppDispatch>();
  const hotels = useSelector(selectPremiumHotel);
  const isLoading = useSelector(selectHotelLoading);
  const error = useSelector(selectHotelError);

  useEffect(() => {
    dispatch(fetchPremiumHotel());
  }, [dispatch]);

  // Keep all hotels for the slider, no need to slice
  const displayedHotels = hotels || [];

  return (
    <section className="relative w-full bg-neutral-50 py-16 md:py-24 overflow-hidden">
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
          className="font-dancing-script font-normal text-3xl md:text-5xl lg:text-6xl text-[#212d47] text-center mb-12 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          India’s Most Beautiful Wedding Venues for Your Special Day
        </motion.h2>

        {/* Grid of hotels (max 8 items) */}
        <div className="w-full mb-10 md:mb-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {isLoading && (
            <div className="col-span-full w-full flex justify-center items-center min-h-32">
              <span className="text-neutral-500 font-cormorant text-lg">Loading hotels...</span>
            </div>
          )}
          {!isLoading && error && (
            <div className="col-span-full w-full flex justify-center items-center min-h-32">
              <span className="text-red-500 font-cormorant text-lg">{error}</span>
            </div>
          )}
          {!isLoading && !error && displayedHotels.length === 0 && (
            <div className="col-span-full w-full flex justify-center items-center min-h-32">
              <span className="text-neutral-500 font-cormorant text-lg">No hotels found.</span>
            </div>
          )}
          {!isLoading && !error && displayedHotels.slice(0, 8).map((hotel, idx) => (
            <motion.div
              key={hotel.id}
              className="relative flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.05 * (idx + 1) }}
            >
              <div
                className="relative bg-center bg-cover bg-no-repeat w-full aspect-[7/8] rounded-xs border border-[#212d47]"
                style={{
                  backgroundImage:
                    hotel.images && hotel.images.length > 0
                      ? `url('${hotel.images[0]}')`
                      : "url('/images/hotels-image.png')",
                }}
                aria-label={hotel.name}
              >
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-x-0 bottom-6 flex justify-center px-4">
                  <div className="bg-[#212d47] rounded-lg px-4 py-3 shadow-lg max-w-full">
                    <p className="font-cormorant font-bold text-white text-base md:text-lg uppercase truncate text-center max-w-full">
                      <Link href={`/venue/${hotel.id}`} passHref className="block truncate">
                        {hotel.name || "Hotel Name"}
                      </Link>
                    </p>
                  </div>
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
          <Link href="/venue" passHref>
            <GradientButton>EXPLORE MORE</GradientButton>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}