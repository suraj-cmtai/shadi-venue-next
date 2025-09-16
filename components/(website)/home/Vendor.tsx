"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import Image from "next/image";
import GradientButton from "@/components/GradientButton";
import {
  // Imports from vendorSlice
  fetchPremiumVendor,
  selectPremiumVendor,
  selectVendorLoading,
  selectVendorError,
} from "@/lib/redux/features/vendorSlice"; // Changed from hotelSlice
import { AppDispatch } from "@/lib/redux/store";
import Link from "next/link";

// Figma MCP asset URLs (can be kept or changed if needed)
const VECTOR02_IMG = "/images/hotels-flower-vector-right.svg";

// Renamed component for clarity
export default function FeaturedVendors() {
  const dispatch = useDispatch<AppDispatch>();

  // Using selectors from vendorSlice
  const activeVendors = useSelector(selectPremiumVendor);
  const isLoading = useSelector(selectVendorLoading);
  const error = useSelector(selectVendorError);

  useEffect(() => {
    // Dispatching action from vendorSlice
    dispatch(fetchPremiumVendor());
  }, [dispatch]);

  // Filter for premium vendors on the client-side
  const displayedVendors =
    activeVendors?.filter((vendor) => vendor.isPremium) || [];


  return (
    <section className="relative w-full bg-neutral-50 py-16 md:py-24 overflow-hidden">
      {/* Decorative Vector (right, desktop only) */}
      <div className="hidden lg:block absolute right-0 top-0 h-full z-0">
        <Image
          src={VECTOR02_IMG}
          alt="Decorative flower vector"
          width={200}
          height={400}
          className="h-full w-auto object-contain rotate-180 scale-y-[-1]"
          aria-hidden="true"
          unoptimized
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center px-4 md:px-8">
        {/* Updated Label */}
        <motion.p
          className="font-cormorant font-medium text-lg md:text-xl text-black text-center uppercase tracking-wider mb-2 md:mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Featured Vendors
        </motion.p>

        {/* Updated Main Heading */}
        <motion.h2
          className="font-dancing-script font-normal text-3xl md:text-4xl lg:text-5xl text-[#212d47] text-center mb-12 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Premier Wedding Services for Your Special Day
        </motion.h2>

        {/* Grid of featured vendors (max 8 items) */}
        <div className="w-full mb-10 md:mb-16 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {isLoading && (
            <div className="col-span-full w-full flex justify-center items-center min-h-32">
              <span className="text-neutral-500 font-cormorant text-lg">Loading vendors...</span>
            </div>
          )}
          {!isLoading && error && (
            <div className="col-span-full w-full flex justify-center items-center min-h-32">
              <span className="text-red-500 font-cormorant text-lg">{error}</span>
            </div>
          )}
          {!isLoading && !error && displayedVendors.length === 0 && (
            <div className="col-span-full w-full flex justify-center items-center min-h-32">
              <span className="text-neutral-500 font-cormorant text-lg">No featured vendors found.</span>
            </div>
          )}
          {!isLoading && !error && displayedVendors.slice(0, 8).map((vendor, idx) => (
            <motion.div
              key={vendor.id}
              className="relative flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.05 * (idx + 1) }}
            >
              <div
                className="relative bg-center bg-cover bg-no-repeat w-full aspect-[7/8] rounded-xs border border-[#212d47]"
                style={{
                  backgroundImage: vendor.coverImageUrl
                    ? `url('${vendor.coverImageUrl}')`
                    : "url('/images/hotels-image.png')",
                }}
                aria-label={vendor.name}
              >
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-x-0 bottom-2 md:bottom-6 flex justify-center px-2 md:px-4">
                  <div className="bg-[#212d47] rounded-lg px-2 md:px-4 py-2 md:py-3 shadow-lg max-w-[calc(100%-16px)] md:max-w-full">
                    <p className="font-cormorant font-bold text-white text-sm md:text-base lg:text-lg uppercase text-center leading-tight">
                      <Link href={`/vendors/${vendor.id}`} passHref className="block">
                        {vendor.name || "Vendor Name"}
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
          {/* Updated link to a general vendors page */}
          <Link href="/vendors">
            <GradientButton>EXPLORE MORE</GradientButton>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
