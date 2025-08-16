"use client";

import { motion } from "framer-motion";
import GradientButton from "@/components/GradientButton";
import { useState } from "react";
import Image from "next/image";

// Hero Images
const heroImages = [
  "/images/home page/hero1.jpg",
  "/images/home page/hero2.jpg"
];

const ARROW_IMG = "/images/arrow.svg";
const ARROW1_IMG = "/images/arrow1.svg";

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <motion.div 
        key={currentImageIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0"
      >
        <Image
          src={heroImages[currentImageIndex]}
          alt="Wedding hero image"
          fill
          className="object-cover"
          priority
        />
      </motion.div>
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
      
      {/* Slider Navigation */}
      <button 
        onClick={prevImage} 
        className="absolute left-4 z-20 transform hover:scale-110 transition-transform"
        aria-label="Previous image"
      >
        <img src={ARROW_IMG} alt="Previous" className="h-12 w-auto" />
      </button>
      
      <button 
        onClick={nextImage} 
        className="absolute right-4 z-20 transform hover:scale-110 transition-transform"
        aria-label="Next image"
      >
        <img src={ARROW1_IMG} alt="Next" className="h-12 w-auto" />
      </button>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 text-center text-white">
        {/* Main Heading */}
        <motion.h1 
          className="font-dancing-script font-bold text-[min(4vw,64px)] mb-6 md:mb-8 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Effortless Planning for Your Dream Wedding!
        </motion.h1>
        
        
        {/* Subtitle */}
        <motion.p 
          className="font-cormorant font-normal text-[min(2vw,24px)] mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed mt-36"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Plan your dream wedding with ease and confidence.
        </motion.p>

        {/* Decorative Elements */}
      <motion.div 
        className="absolute left-2 top-2/3 -translate-y-1/2 hidden lg:block"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <img src={ARROW_IMG} alt="Decorative arrow" className="h-24 w-auto" />
      </motion.div>
      
      <motion.div 
        className="absolute right-2 top-2/3 -translate-y-1/2 hidden lg:block"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <img src={ARROW1_IMG} alt="Decorative arrow" className="h-24 w-auto " />
      </motion.div>
        
        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex justify-center items-center"
        >
          <GradientButton>
            Book Appointment
          </GradientButton>
        </motion.div>
      </div>
      
      
      
      {/* Bottom Polygon */}
      {/* <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <img src={POLYGON_IMG} alt="Decorative polygon" className="h-3 w-auto" />
      </motion.div> */}
    </section>
  );
}