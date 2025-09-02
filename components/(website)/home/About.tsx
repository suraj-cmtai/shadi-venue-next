"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import GradientButton from "@/components/GradientButton";
import Link from "next/link";
import { 
  fetchActiveAboutContent,
  selectActiveAboutContent,
  selectIsLoading,
  selectHasFetched,
  selectError
} from "@/lib/redux/features/aboutSlice";
import { AppDispatch } from "@/lib/redux/store";

// Figma MCP asset URLs (fallback images if no data from Redux)
const VECTOR_IMG = "/images/about-flower-vector-bottom-right-corner.svg";
const VECTOR01_IMG = "/images/about-flower-shadow-right-image-vector.svg";
const VECTOR02_IMG = "/images/about-flower-shadow-top-left-vector.svg";

// Default/fallback content
const DEFAULT_ABOUT_CONTENT = {
  title: "We Build Your Dream Around You",
  subtitle: "ABOUT US",
  description: "At SHADIVENUE, we believe that a wedding is not just a ceremony—it's a once-in-a-lifetime experience, a celebration of love, culture, and togetherness. Founded with a vision to make every couple's dream wedding a seamless reality, SHADIVENUE specializes in destination wedding bookings across India, curating unforgettable experiences in the country's most enchanting locations.",
  buttonText: "More",
  buttonLink: "/about",
  image: "/images/about-new/Bride & Groom_- @kashtag90 & @jhalakshah_ Wedding….jpg"
};

export default function About() {
  const dispatch = useDispatch<AppDispatch>();
  const activeAboutContent = useSelector(selectActiveAboutContent);
  const isLoading = useSelector(selectIsLoading);
  const hasFetched = useSelector(selectHasFetched);
  const error = useSelector(selectError);
  const [isClient, setIsClient] = useState(false);

  // Load data on component mount
  useEffect(() => {
    setIsClient(true);
    if (!hasFetched) {
      dispatch(fetchActiveAboutContent());
    }
  }, [dispatch, hasFetched]);

  // Get the first active about content or use default
  const aboutContent = activeAboutContent && activeAboutContent.length > 0 
    ? activeAboutContent[0] 
    : DEFAULT_ABOUT_CONTENT;

  return (
    <section className="relative w-full bg-neutral-50 overflow-x-clip">
      {/* Loading State */}
      {!isClient && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
      {isClient && isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error State */}
      {isClient && error && !isLoading && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Error loading content: {error}</p>
            <p className="text-sm text-gray-600 mt-2">Displaying default content instead.</p>
          </div>
        </div>
      )}

      {/* Decorative Top Left */}
      <div className="hidden md:block absolute left-0 top-0 z-0 w-1/4 max-w-xs pointer-events-none">
        <img
          src={VECTOR02_IMG}
          alt="Decorative element"
          className="w-full h-auto"
        />
      </div>
      {/* Decorative Bottom Right (use VECTOR_IMG as per instruction) */}
      <div className="hidden md:block absolute right-0 bottom-0 z-0 w-1/4 max-w-xs pointer-events-none opacity-20">
        <img
          src={VECTOR_IMG}
          alt="Decorative element bottom right"
          className="w-full h-auto"
        />
      </div>

      {/* Main About Section */}
      <div className="w-full">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 px-4 md:px-8 py-12 md:py-20 relative z-10">
          {/* Left: Text */}
          <motion.div
            className="w-full lg:w-1/2 flex flex-col items-start"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.p
              className="font-cormorant font-medium text-base md:text-lg text-black uppercase tracking-wider mb-2 md:mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {aboutContent.subtitle}
            </motion.p>
            <motion.h2
              className="font-cormorant font-bold text-2xl md:text-4xl lg:text-5xl text-[#212d47] mb-4 md:mb-8 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {aboutContent.title}
            </motion.h2>
            <motion.p
              className="font-cinzel text-sm md:text-base lg:text-lg text-[#7d7d7d] leading-relaxed mb-6 md:mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {aboutContent.description}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Link href={aboutContent.buttonLink}>
                <GradientButton>
                  {aboutContent.buttonText}
                </GradientButton>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: Framed Image with very light gray bg, flower vector, and translucent bottom left vector */}
          <motion.div
            className="w-full lg:w-1/2 flex items-center justify-end relative z-10 mt-12 lg:mt-10"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            {/* Outer Frame with very light gray background */}
            <div className="relative w-full h-full pt-8 pr-12 pb-8 pl-8 bg-gray-100 shadow-xl flex items-center justify-center rounded-lg">
              {/* Decorative flower vector (already present) */}
              <div className="hidden md:block absolute right-0 top-0 z-10 w-1/3 max-w-xs pointer-events-none">
                <img
                  src={VECTOR01_IMG}
                  alt="Decorative flower"
                  className="w-full h-auto"
                />
              </div>
              {/* Decorative PNG bottom-left corner inside the gray frame, translucent */}
              <div className="absolute -left-4 -bottom-4 w-32 h-32 md:w-60 md:h-64 z-64 opacity-90">
                <div className="relative w-full h-full rotate-[-10deg]">
                  <img
                    src="/images/wedding/shadi-venue.png"
                    alt="venue-card"
                    className="object-contain w-full h-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white font-cinzel text-sm font-bold text-center pointer-events-none rotate-[42deg]">
                      SHADI VENUE
                    </p>
                  </div>
                </div>
              </div>
              {/* Decorative SVG bottom-right inside the gray frame, similar to bottom-left but using VECTOR_IMG */}
              <div className="absolute -right-4 -bottom-6 w-32 h-32 md:w-60 md:h-64 z-64 opacity-90">
                <div className="relative w-full h-full rotate-[10deg]">
                  <img
                    src={VECTOR_IMG}
                    alt="Decorative flower bottom right"
                    className="object-contain w-full h-full"
                  />
                </div>
              </div>
              {/* White inner frame */}
              <div className="bg-white p-1 md:p-2 rounded-md relative z-10 w-full">
                <div className="relative w-full aspect-[4/5] overflow-hidden rounded-md">
                  <img
                    src={aboutContent.image}
                    alt="About Us"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to default image if the dynamic image fails to load
                      e.currentTarget.src = "/images/about-new/Bride & Groom_- @kashtag90 & @jhalakshah_ Wedding….jpg";
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}