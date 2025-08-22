"use client";

import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import GradientButton from "@/components/GradientButton";
import {
  // Imports from vendorSlice
  fetchActiveVendors,
  selectActiveVendors,
  selectVendorLoading,
  selectVendorError,
} from "@/lib/redux/features/vendorSlice";
import { AppDispatch } from "@/lib/redux/store";
import Link from "next/link";

// Figma MCP asset URLs can remain the same
const VECTOR02_IMG = "/images/hotels-flower-vector-right.svg";

// Renamed component for better clarity
export default function VendorsByCity() {
  const dispatch = useDispatch<AppDispatch>();

  // Using selectors from vendorSlice
  const activeVendors = useSelector(selectActiveVendors);
  const isLoading = useSelector(selectVendorLoading);
  const error = useSelector(selectVendorError);

  useEffect(() => {
    // Dispatching the action from vendorSlice
    dispatch(fetchActiveVendors());
  }, [dispatch]);

  // The core logic, now adapted for the Vendor data structure
  const cityTiles = useMemo(() => {
    if (!activeVendors || activeVendors.length === 0)
      return [] as { city: string; image: string; count: number }[];

    const map = new Map<string, { image: string; count: number }>();

    for (const vendor of activeVendors) {
      // Get city directly from the vendor object
      const city = vendor.city?.trim();
      if (!city) continue;

      // Use coverImageUrl as the representative image for the city
      const firstImage = vendor.coverImageUrl || "/images/hotels-image.png"; // Fallback image

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
  }, [activeVendors]);

  return (
    <section className="relative w-full bg-neutral-50 py-16 md:py-24 overflow-hidden">
      <div className="hidden lg:block absolute right-0 top-0 h-full z-0">
        <img
          src={VECTOR02_IMG}
          alt="Decorative flower vector"
          className="h-full w-auto object-contain rotate-180 scale-y-[-1]"
          aria-hidden="true"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center px-4 md:px-8">
        {/* Updated Text Content */}
        <motion.p
          className="font-cormorant font-medium text-lg md:text-xl text-black text-center uppercase tracking-wider mb-2 md:mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Explore Vendors Near You
        </motion.p>

        <motion.h2
          className="font-cormorant font-bold text-3xl md:text-5xl lg:text-6xl text-[#212d47] text-center leading-tight mb-10 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Discover Professionals Near You
        </motion.h2>

        <div
          className="w-full flex flex-row gap-6 md:gap-8 mb-10 md:mb-16 overflow-x-auto scrollbar-hide py-4"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {/* Updated loading/error messages */}
          {isLoading && (
            <div className="w-full flex justify-center items-center min-h-32">
              <span className="text-neutral-500 font-cormorant text-lg">
                Loading vendors...
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
          {!isLoading && !error && cityTiles.length === 0 && (
            <div className="w-full flex justify-center items-center min-h-32">
              <span className="text-neutral-500 font-cormorant text-lg">
                No cities with vendors found.
              </span>
            </div>
          )}

          {!isLoading &&
            !error &&
            cityTiles.slice(0, 8).map((tile, idx) => (
              <motion.div
                key={tile.city}
                className="relative group overflow-hidden rounded-md border border-[#212d47] shrink-0 w-64 sm:w-72"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.05 * (idx + 1) }}
              >
                {/* Updated Link to point to a vendors page with a city filter */}
                <Link
                  href={`/vendors?city=${encodeURIComponent(tile.city)}`}
                  className="block"
                >
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
                      <span className="text-white/80 text-sm">
                        {tile.count}
                      </span>
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
          {/* Updated link to point to the main vendors page */}
          <Link href="/vendors" passHref>
            <GradientButton>EXPLORE MORE</GradientButton>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
