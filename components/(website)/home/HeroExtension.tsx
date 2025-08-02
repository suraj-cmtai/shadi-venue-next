"use client";

import GradientButton from "@/components/GradientButton";
import { motion } from "framer-motion";

// NOTE: A placeholder GradientButton is used as the original component was not provided.
// You should replace this with your actual GradientButton component.


/**
 * HeroExtension section with precise Figma fidelity.
 * All images and vectors are positioned and sized to match the provided screenshot.
 * Responsive, accessible, and uses only Tailwind utility classes.
 */

const IMAGES = [
  "/images/hero-extension-1.png", // Tall left
  "/images/hero-extension-2.png", // Main center
  "/images/hero-extension-3.png", // Bottom left
  "/images/hero-extension-4.png", // Center bottom
  "/images/hero-extension-5.png", // Top right
  "/images/hero-extension-6.png", // Far right
];
const VECTOR_LEFT = "/images/hero-extension-vector-1.svg";
const VECTOR_RIGHT = "/images/hero-extension-vector.svg";
const VECTOR_SHADOW_FLOWER_TOP_RIGHT = "/images/hero-extension-vector-2.svg";


export default function HeroExtension() {
  return (
    <section className="relative w-full bg-white overflow-hidden font-cormorant">
      {/* Decorative Vectors */}
      <motion.img
        src={VECTOR_LEFT}
        alt=""
        className="pointer-events-none select-none hidden md:block absolute left-[-2%] top-[20%] h-auto w-[15%] max-w-[200px]"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        aria-hidden="true"
      />
      
       <motion.img
        src={VECTOR_RIGHT}
        alt=""
        className="pointer-events-none select-none hidden md:block absolute right-[2%] top-[55%] h-auto w-[18%] max-w-[250px]"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        aria-hidden="true"
      />
      <motion.img
        src={VECTOR_SHADOW_FLOWER_TOP_RIGHT}
        alt=""
        className="pointer-events-none select-none absolute right-0 top-0 h-auto w-[20%] max-w-[280px] opacity-30 md:opacity-100"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-7xl mx-auto flex flex-row items-center justify-center px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        {/* Left column images */}
        <motion.div
          className="hidden md:flex flex-col justify-start items-center gap-4 w-[15%] self-stretch"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="rounded-lg overflow-hidden shadow-lg w-full">
            <img
              src={IMAGES[0]}
              alt="Bride and groom in a decorated hall"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="rounded-lg overflow-hidden shadow-lg w-full">
            <img
              src={IMAGES[2]}
              alt="Outdoor wedding canopy at dusk"
              className="object-cover w-full h-full"
            />
          </div>
        </motion.div>

        {/* Center content block */}
        <div className="w-full md:w-[60%] lg:w-[55%] px-4 md:px-8 flex-shrink-0 z-10">
          <div className="flex flex-col items-center">
            {/* Top section: Main image + Text */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full">
              <motion.div
                className="w-full md:w-1/2 rounded-lg overflow-hidden shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <img
                  src={IMAGES[1]}
                  alt="Bride showering groom with rose petals"
                  className="object-cover w-full h-full aspect-[3/4]"
                />
              </motion.div>
              <motion.div
                className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left py-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <span className="font-bold text-base text-[#212d47] uppercase tracking-widest">
                  HELLO,
                </span>
                <h2 className="font-bold text-4xl lg:text-5xl text-[#212d47] leading-tight my-4">
                  Effortless Planning for Your Dream Wedding
                </h2>
                <div className="mt-2">
                   <GradientButton>Contact Us</GradientButton>
                </div>
              </motion.div>
            </div>
            {/* Bottom image */}
            <motion.div
              className="w-full rounded-lg overflow-hidden shadow-lg mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <img
                src={IMAGES[3]}
                alt="Bride and groom on a floral stage"
                className="object-cover w-full h-full aspect-[16/7]"
              />
            </motion.div>
          </div>
        </div>

        {/* Right column images */}
        <motion.div
          className="hidden md:flex flex-col justify-start items-center gap-4 w-[15%] self-stretch"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <div className="rounded-lg overflow-hidden shadow-lg w-full">
            <img
              src={IMAGES[4]}
              alt="Wedding ceremony by the sea"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="rounded-lg overflow-hidden shadow-lg w-full">
            <img
              src={IMAGES[5]}
              alt="Outdoor wedding aisle with floral arrangements"
              className="object-cover w-full h-full"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}