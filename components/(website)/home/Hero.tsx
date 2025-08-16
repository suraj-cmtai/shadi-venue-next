"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import {
  fetchActiveHeroSlides,
  selectActiveHeroSlides,
  selectIsLoading,
} from "@/lib/redux/features/heroSlice";
import { motion } from "framer-motion";
import GradientButton from "@/components/GradientButton";
import Image from "next/image";

/**
 * Hero Section
 * Dynamically displays active hero slides from Redux store.
 * Uses Framer Motion for transitions and shadcn button for CTA.
 * Fully responsive, accessible, and Figma-fidelity.
 */
const ARROW_IMG = "/images/arrow.svg";
const ARROW1_IMG = "/images/arrow1.svg";

export default function Hero() {
  const dispatch = useAppDispatch();
  const heroSlides = useAppSelector(selectActiveHeroSlides);
  const isLoading = useAppSelector(selectIsLoading);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch active hero slides on mount
  useEffect(() => {
    dispatch(fetchActiveHeroSlides());
  }, [dispatch]);

  // Reset index if slides change
  useEffect(() => {
    if (heroSlides.length > 0 && currentIndex >= heroSlides.length) {
      setCurrentIndex(0);
    }
  }, [heroSlides, currentIndex]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  // If loading or no slides, show nothing (could add a skeleton if desired)
  if (isLoading || heroSlides.length === 0) {
    return (
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gray-100">
        <div className="max-w-7xl mx-auto w-full flex flex-col items-center justify-center">
          <span className="text-lg text-gray-400">Loading...</span>
        </div>
      </section>
    );
  }

  const { image, heading, subtext, cta } = heroSlides[currentIndex];

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0"
      >
        <Image
          src={image}
          alt={heading || "Wedding hero image"}
          fill
          className="object-cover"
          priority
        />
      </motion.div>

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30" aria-hidden="true" />

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
          <GradientButton>
            {cta}
          </GradientButton>
        </motion.div>
      </div>
    </section>
  );
}