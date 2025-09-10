"use client";

import { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import {
  fetchActiveHeroSlides,
  selectActiveHeroSlides,
  selectIsLoading,
} from "@/lib/redux/features/heroSlice";
import { motion, AnimatePresence } from "framer-motion";
import GradientButton from "@/components/GradientButton";
import Image from "next/image";
import Link from "next/link";

/**
 * Hero Section
 * Dynamically displays active hero slides from Redux store.
 * Uses Framer Motion for transitions and shadcn button for CTA.
 * Fully responsive, accessible, and Figma-fidelity.
 * Slides move left (prev) every 3 seconds automatically.
 */
const ARROW_IMG = "/images/arrow.svg";
const ARROW1_IMG = "/images/arrow1.svg";

export default function Hero() {
  const dispatch = useAppDispatch();
  const heroSlides = useAppSelector(selectActiveHeroSlides);
  const isLoading = useAppSelector(selectIsLoading);

  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [direction, setDirection] = useState<1 | -1>(-1);
  // Keep fallback visible until first real slide has fully loaded
  const [showFallbackBg, setShowFallbackBg] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const imageLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch active hero slides on mount
  useEffect(() => {
    dispatch(fetchActiveHeroSlides());
  }, [dispatch]);

  // Set up fallback timing logic
  useEffect(() => {
    if (heroSlides.length > 0 && !imagesLoaded) {
      // Set a 3-second timeout to check if images have loaded
      imageLoadTimeoutRef.current = setTimeout(() => {
        if (!imagesLoaded) {
          // If images haven't loaded in 3 seconds, show fallback for full 5 seconds
          fallbackTimeoutRef.current = setTimeout(() => {
            setShowFallbackBg(false);
          }, 2000); // Additional 2 seconds to make total 5 seconds
        }
      }, 3000);
    }

    return () => {
      if (imageLoadTimeoutRef.current) clearTimeout(imageLoadTimeoutRef.current);
      if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
    };
  }, [heroSlides, imagesLoaded]);

  // Reset index if slides change
  useEffect(() => {
    if (heroSlides.length > 0 && currentIndex >= heroSlides.length) {
      setCurrentIndex(0);
    }
  }, [heroSlides, currentIndex]);

  // Auto-advance slides (faster cadence for more energy)
  useEffect(() => {
    if (heroSlides.length === 0) return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
    }, 7000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [heroSlides, currentIndex]);

  const nextImage = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
  };

  const prevImage = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  // Track first render to skip initial fade and avoid white flash
  const isFirstRenderRef = useRef(true);
  useEffect(() => {
    isFirstRenderRef.current = false;
  }, []);

  // If loading or no slides, show a fallback hero with image and text
  if (isLoading || heroSlides.length === 0) {
    return (
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-black">
        {/* Fallback Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/herofallback.avif"
            alt="Wedding inspiration"
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </div>
        {/* Overlay */}
        <div className="absolute inset-0" aria-hidden="true" />
        {/* Fallback Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 text-center text-white flex flex-col items-center justify-center w-full">
          <h1 className="font-dancing-script font-bold text-4xl md:text-6xl mb-6 md:mb-8 leading-tight">
            Plan Your Perfect Wedding
          </h1>
          <p className="font-cormorant text-lg md:text-2xl mb-8 opacity-95">
            Discover venues, vendors, and inspiration—loading your experience…
          </p>
          <Link href="/venue" className="w-full max-w-xs">
            <GradientButton>
              Explore Venues
            </GradientButton>
          </Link>
        </div>
      </section>
    );
  }

  const { image, heading, subtext, cta } = heroSlides[currentIndex];

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Fallback background underneath to avoid visible swap */}
      {showFallbackBg && (
        <div className="absolute inset-0">
          <Image
            src="/herofallback.avif"
            alt="Wedding inspiration"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 " aria-hidden="true" />
        </div>
      )}
      {/* Background Image with smooth crossfade (no black gap) */}
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={image || currentIndex}
          initial={isFirstRenderRef.current ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 will-change-transform will-change-opacity"
        >
          <Image
            src={image}
            alt={heading || "Wedding hero image"}
            fill
            className="object-cover"
            priority
            unoptimized
            onLoadingComplete={() => {
              setImagesLoaded(true);
              // Clear any pending timeouts
              if (imageLoadTimeoutRef.current) clearTimeout(imageLoadTimeoutRef.current);
              if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
              // Show real image after a short delay for smooth transition
              setTimeout(() => setShowFallbackBg(false), 500);
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlay for better text readability over real slide */}
      {!showFallbackBg && (
        <div className="absolute inset-0" aria-hidden="true" />
      )}

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 text-center text-white flex flex-col items-center justify-center w-full">
        {/* Main Heading */}
        <motion.h1
          className="font-dancing-script font-bold text-4xl md:text-6xl mb-6 md:mb-8 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {heading}
        </motion.h1>

        {/* Subtitle + Arrows */}
        <motion.div
          className="flex items-center justify-center gap-4 mb-8 md:mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Prev Arrow */}
          <button
            onClick={prevImage}
            aria-label="Previous slide"
            className="hidden sm:inline-flex focus:outline-none hover:scale-110 transition-transform"
            tabIndex={0}
            type="button"
          >
            <img src={ARROW_IMG} alt="Previous" className="h-12 w-auto" />
          </button>
          <p className="font-cormorant font-normal text-lg md:text-2xl leading-relaxed">
            {subtext}
          </p>
          {/* Next Arrow */}
          <button
            onClick={nextImage}
            aria-label="Next slide"
            className="hidden sm:inline-flex focus:outline-none hover:scale-110 transition-transform"
            tabIndex={0}
            type="button"
          >
            <img src={ARROW1_IMG} alt="Next" className="h-12 w-auto" />
          </button>
        </motion.div>

        {/* Mobile arrows below subtext for better UX */}
        <div className="flex sm:hidden justify-center gap-8 mb-8">
          <button
            onClick={prevImage}
            aria-label="Previous slide"
            className="focus:outline-none hover:scale-110 transition-transform"
            tabIndex={0}
            type="button"
          >
            <img src={ARROW_IMG} alt="Previous" className="h-10 w-auto" />
          </button>
          <button
            onClick={nextImage}
            aria-label="Next slide"
            className="focus:outline-none hover:scale-110 transition-transform"
            tabIndex={0}
            type="button"
          >
            <img src={ARROW1_IMG} alt="Next" className="h-10 w-auto" />
          </button>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex justify-center items-center"
        >
          <Link href="/contact" className="w-full max-w-xs">
          <GradientButton>
            {cta}
          </GradientButton>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}