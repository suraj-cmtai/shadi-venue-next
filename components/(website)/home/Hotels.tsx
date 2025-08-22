"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import GradientButton from "@/components/GradientButton";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
          className="font-cormorant font-bold text-3xl md:text-5xl lg:text-6xl text-[#212d47] text-center leading-tight mb-10 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Where to Stay for the Wedding Weekend
        </motion.h2>

        <div
          className="w-full flex flex-row gap-6 md:gap-8 mb-10 md:mb-16 overflow-x-auto scrollbar-hide py-4"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {isLoading && (
            <div className="w-full flex justify-center items-center min-h-32">
              <span className="text-neutral-500 font-cormorant text-lg">
                Loading hotels...
              </span>
            </div>
          )}
          {!isLoading && error && (
            <div className="w-full flex justify-center items-center min-h-32">
              <span className="text-red-500 font-cormorant text-lg">
                {error}
              </span>
            </div>
          )}
          {!isLoading && !error && displayedHotels.length === 0 && (
            <div className="w-full flex justify-center items-center min-h-32">
              <span className="text-neutral-500 font-cormorant text-lg">
                No hotels found.
              </span>
            </div>
          )}
          {!isLoading &&
            !error &&
            displayedHotels.map((hotel, idx) => (
              <motion.div
                key={hotel.id}
                className="relative flex flex-col shrink-0 w-64 sm:w-72"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * (idx + 1) }}
              >
                <div
                  className="bg-center bg-cover bg-no-repeat w-full aspect-[7/8] rounded-xs border border-[#212d47]"
                  style={{
                    backgroundImage:
                      hotel.images && hotel.images.length > 0
                        ? `url('${hotel.images[0]}')`
                        : "url('/images/hotels-image.png')",
                  }}
                  aria-label={hotel.name}
                />
                <div className="absolute left-0 bottom-0 w-full">
                  <div className="bg-[#212d47] border-t-4 border-white rounded-b-lg px-4 py-3 flex items-center">
                    <p className="font-cormorant font-bold text-lg md:text-xl text-white uppercase truncate">
                      <Link href={`/venue/${hotel.id}`} passHref>
                        {hotel.name || "Hotel Name"}
                      </Link>
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
          <Link href="/venue" passHref>
            <GradientButton>EXPLORE MORE</GradientButton>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}