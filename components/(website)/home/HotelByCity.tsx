"use client";

import { useEffect, useState } from "react";
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    dispatch(fetchActiveHotels());
  }, [dispatch]);

  // Derive unique cities with a representative image and count
  const cityTiles = useMemo(() => {
    if (!hotels || hotels.length === 0)
      return [] as { city: string; image: string; count: number }[];
    const map = new Map<string, { image: string; count: number }>();
    for (const h of hotels) {
      const city = h?.location?.city?.trim();
      if (!city) continue;
      const firstImage =
        (h.images && h.images[0]) || "/images/hotels-image.png";
      if (!map.has(city)) {
        map.set(city, { image: firstImage, count: 1 });
      } else {
        const entry = map.get(city)!;
        entry.count += 1;
      }
    }
    return Array.from(map.entries()).map(([city, { image, count }]) => ({
      city,
      image,
      count,
    }));
  }, [hotels]);

  // Distribute cities across rows with minimum 4 items per row
  const rows = useMemo(() => {
    const total = cityTiles.length;
    const distributed: { city: string; image: string; count: number }[][] = [];
    
    if (total < 4) {
      // Less than 4 items: single row
      distributed.push(cityTiles);
    } else if (total < 8) {
      // 4-7 items: single row of 4+ items
      distributed.push(cityTiles);
    } else if (total < 12) {
      // 8-11 items: two rows of 4+ items each
      const itemsPerRow = Math.ceil(total / 2);
      distributed.push(cityTiles.slice(0, itemsPerRow));
      distributed.push(cityTiles.slice(itemsPerRow));
    } else {
      // 12+ items: three rows with minimum 4 items each
      const itemsPerRow = Math.ceil(total / 3);
      distributed.push(cityTiles.slice(0, itemsPerRow));
      distributed.push(cityTiles.slice(itemsPerRow, itemsPerRow * 2));
      distributed.push(cityTiles.slice(itemsPerRow * 2));
    }
    
    return distributed.filter(row => row.length > 0);
  }, [cityTiles]);

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
          Explore Hotels Near You
        </motion.p>

        {/* Main Heading */}
        <motion.h2
          className="font-dancing-script font-normal text-3xl md:text-4xl lg:text-5xl text-[#212d47] text-center mb-12 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Unforgettable Wedding Locations Across India
        </motion.h2>

        {/* Three independent horizontally scrollable rows */}
        <div className="w-full flex flex-col gap-6 mb-10 md:mb-16">
          {!isClient && (
            <div className="w-full flex justify-center items-center min-h-32">
              <span className="text-neutral-500 font-cormorant text-lg">
                Loading hotels...
              </span>
            </div>
          )}
          {isClient && isLoading && (
            <div className="w-full flex justify-center items-center min-h-32">
              <span className="text-neutral-500 font-cormorant text-lg">
                Loading hotels...
              </span>
            </div>
          )}
          {isClient && !isLoading && error && (
            <div className="w-full flex justify-center items-center min-h-32">
              <span className="text-red-500 font-cormorant text-lg">
                {error}
              </span>
            </div>
          )}
          {isClient && !isLoading && !error && cityTiles.length === 0 && (
            <div className="w-full flex justify-center items-center min-h-32">
              <span className="text-neutral-500 font-cormorant text-lg">
                No cities found.
              </span>
            </div>
          )}

          {isClient && !isLoading && !error && rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="w-full grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row gap-3 md:gap-6 md:overflow-x-auto py-2"
              style={{
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {row.map((tile, idx) => (
                <motion.div
                  key={`${tile.city}-${idx}`}
                  className="relative group overflow-hidden rounded-md border border-[#212d47] w-full md:shrink-0 md:w-64 lg:w-72"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.05 * (idx + 1) }}
                >
                  <Link
                    href={`/venue?search=${encodeURIComponent(tile.city)}`}
                    className="block"
                  >
                    <div
                      className="relative bg-center bg-cover bg-no-repeat w-full aspect-[7/8]"
                      style={{ backgroundImage: `url('${tile.image}')` }}
                      aria-label={tile.city}
                    >
                      <div className="absolute inset-0 bg-black/30 transition-opacity group-hover:bg-black/40" />
                      {/* Floating label */}
                      <div className="absolute left-1/2 bottom-6 -translate-x-1/2">
                        <div className="bg-[#212d47] rounded-lg px-4 py-3 flex items-center gap-3 shadow-lg">
                          <p className="font-cormorant font-bold text-white text-base md:text-lg uppercase whitespace-nowrap">
                            {tile.city}
                          </p>
                          <span className="text-white/90 text-sm font-medium">
                            {tile.count}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
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