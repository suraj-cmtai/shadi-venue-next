"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import GradientButton from "@/components/GradientButton";
import Link from "next/link";
import {
  fetchActiveWeddings,
  selectActiveWeddingsList,
  selectIsLoading,
  selectError,
} from "@/lib/redux/features/weddingSlice";
import { AppDispatch } from "@/lib/redux/store";

// Decorative vector image constant
const VECTOR1_IMG = "/images/wedding-flower-top-left-vector.svg";

/**
 * Wedding Themes Section
 * Dynamically fetches and displays all active wedding themes in a horizontal scroll (all breakpoints).
 * Uses Framer Motion for animation and shadcn GradientButton for CTAs.
 */
export default function Wedding() {
  const dispatch = useDispatch<AppDispatch>();
  const themes = useSelector(selectActiveWeddingsList);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  useEffect(() => {
    dispatch(fetchActiveWeddings());
  }, [dispatch]);

  const textColor = "text-[#212d47]";

  return (
    <section className="relative w-full bg-white overflow-hidden">
      {/* Decorative Flower */}
      <img
        src={VECTOR1_IMG}
        alt="Decorative element"
        className="hidden xl:block absolute left-0 top-0 z-10 w-24 h-24 lg:w-32 lg:h-32 xl:w-48 xl:h-48 pointer-events-none select-none opacity-80"
        aria-hidden="true"
      />

      {/* Container */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 relative">
        {/* Heading */}
        <div className="flex flex-col items-center mb-6 sm:mb-8 md:mb-10 lg:mb-14">
          <motion.p
            className={`font-cormorant font-medium text-[10px] xs:text-xs sm:text-sm ${textColor} text-center uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-1 sm:mb-2`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            wedding theme
          </motion.p>
          <motion.h2
            className={`font-cormorant font-bold text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl ${textColor} text-center leading-tight px-2 sm:px-4`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            From <span className={textColor}>&apos;Yes&apos;</span> To <span className={textColor}>&apos;I Do&apos;</span> - we&apos;re with you
          </motion.h2>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex justify-center items-center min-h-32">
            <span className="text-red-500 font-cormorant text-lg">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center min-h-32">
            <span className="text-neutral-500 font-cormorant text-lg">Loading themes...</span>
          </div>
        )}

        {/* Themes Horizontal Scroll (All Breakpoints) */}
        {!isLoading && !error && (
          <div className="relative">
            <div
              className="flex flex-nowrap gap-4 sm:gap-6 md:gap-8 items-end h-[60vh] sm:h-[65vh] md:h-[70vh] lg:h-[75vh] xl:h-[80vh] overflow-x-auto overflow-y-hidden scrollbar-hide pb-2"
              aria-label="Wedding themes scroll"
              tabIndex={0}
              role="region"
            >
              {themes && themes.length > 0 ? (
                themes.map((theme, index) => (
                  <motion.div
                    key={theme.id}
                    className="relative shrink-0 w-56 sm:w-64 md:w-72 lg:w-80 xl:w-96 h-full rounded-xs overflow-hidden group flex flex-col justify-end cursor-pointer"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                  >
                    {/* Image */}
                    <div
                      className="absolute inset-0 bg-center bg-cover bg-no-repeat h-full w-full transition-transform duration-500 group-hover:scale-110"
                      style={{
                        backgroundImage: `url('${theme.images?.main || ""}')`,
                      }}
                      aria-label={theme.theme}
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 group-hover:via-black/30 transition-all duration-300" />
                    {/* Border */}
                    <div className="absolute inset-2 border-2 border-white/80 group-hover:border-white rounded-xs pointer-events-none transition-colors duration-300" />
                    {/* Text */}
                    <div className="relative z-10 flex flex-col items-center justify-end px-4 md:px-6 pb-6 md:pb-8 xl:pb-10 w-full">
                      <span className="font-cinzel font-bold text-base md:text-lg xl:text-xl 2xl:text-2xl text-white text-center uppercase drop-shadow-lg">
                        {theme.theme}
                      </span>
                      <span className="font-cormorant font-medium text-xs md:text-sm xl:text-base text-white/90 text-center mt-1 md:mt-2 drop-shadow-sm max-w-[90%]">
                        {theme.description}
                      </span>
                      <div className="mt-4 md:mt-6 w-full flex justify-center">
                        <Link href={`/wedding/${theme.id}`} passHref >
                            <GradientButton>Explore Theme</GradientButton>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex justify-center items-center w-full min-h-32">
                  <span className="text-neutral-500 font-cormorant text-lg">No wedding themes found.</span>
                </div>
              )}
            </div>
            {/* Hide scrollbar */}
            <style jsx>{`
              .scrollbar-hide {
                scrollbar-width: none;
                -ms-overflow-style: none;
              }
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>
          </div>
        )}

        {/* CTA */}
        <div className="flex justify-center mt-8 md:mt-12 xl:mt-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Link href="/wedding" passHref >
                <GradientButton>EXPLORE MORE</GradientButton>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
