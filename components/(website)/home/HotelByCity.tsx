"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import GradientButton from "@/components/GradientButton";
import { useMemo } from "react";
import {
  fetchActiveHotels,
  selectActiveHotels,
  selectHotelLoading,
  selectHotelError,
} from "@/lib/redux/features/hotelSlice";
import { AppDispatch } from "@/lib/redux/store";
import Link from "next/link";

// Figma MCP asset URLs
const VECTOR02_IMG = "/images/hotels-flower-vector-right.svg";

export default function Hotels() {
  const dispatch = useDispatch<AppDispatch>();
  const hotels = useSelector(selectActiveHotels);
  const isLoading = useSelector(selectHotelLoading);
  const error = useSelector(selectHotelError);

  useEffect(() => {
    dispatch(fetchActiveHotels());
  }, [dispatch]);

  // Derive unique cities with a representative image and count
  const cityTiles = useMemo(() => {
    if (!hotels || hotels.length === 0) return [] as { city: string; image: string; count: number }[];
    const map = new Map<string, { image: string; count: number }>();
    for (const h of hotels) {
      const city = h?.location?.city?.trim();
      if (!city) continue;
      const firstImage = (h.images && h.images[0]) || "/images/hotels-image.png";
      if (!map.has(city)) {
        map.set(city, { image: firstImage, count: 1 });
      } else {
        const entry = map.get(city)!;
        entry.count += 1;
      }
    }
    return Array.from(map.entries()).map(([city, { image, count }]) => ({ city, image, count }));
  }, [hotels]);

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
          Explore Hotels Near You
        </motion.p>

        {/* Main Heading */}
        <motion.h2
          className="font-cormorant font-bold text-3xl md:text-5xl lg:text-6xl text-[#212d47] text-center leading-tight mb-10 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Find the Perfect Stay for Your Wedding Weekend
        </motion.h2>

        {/* City Tiles Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-10 md:mb-16">
          {isLoading && (
            <div className="col-span-full flex justify-center items-center min-h-32">
              <span className="text-neutral-500 font-cormorant text-lg">Loading hotels...</span>
            </div>
          )}
          {!isLoading && error && (
            <div className="col-span-full flex justify-center items-center min-h-32">
              <span className="text-red-500 font-cormorant text-lg">{error}</span>
            </div>
          )}
          {!isLoading && !error && cityTiles.length === 0 && (
            <div className="col-span-full flex justify-center items-center min-h-32">
              <span className="text-neutral-500 font-cormorant text-lg">No cities found.</span>
            </div>
          )}

          {!isLoading && !error && cityTiles.slice(0, 8).map((tile, idx) => (
            <motion.div
              key={tile.city}
              className="relative group overflow-hidden rounded-md border border-[#212d47]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.05 * (idx + 1) }}
            >
              <Link href={`/venue?search=${encodeURIComponent(tile.city)}`} className="block">
                <div
                  className="bg-center bg-cover bg-no-repeat w-full aspect-[7/8]"
                  style={{ backgroundImage: `url('${tile.image}')` }}
                  aria-label={tile.city}
                >
                  <div className="absolute inset-0 bg-black/30 transition-opacity group-hover:bg-black/40" />
                </div>
                <div className="absolute left-0 bottom-0 w-full">
                  <div className="bg-[#212d47] border-t-4 border-white rounded-b-lg px-4 py-3 flex items-center justify-between">
                    <p className="font-cormorant font-bold text-lg md:text-xl text-white uppercase truncate">
                      {tile.city}
                    </p>
                    <span className="text-white/80 text-sm">{tile.count}</span>
                  </div>
                </div>
              </Link>
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
          <Link href="/venue" passHref >
                <GradientButton>EXPLORE MORE</GradientButton>
            </Link>
        </motion.div>
      </div>
    </section>
  );
}
