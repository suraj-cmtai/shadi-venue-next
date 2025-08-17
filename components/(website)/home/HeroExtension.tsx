"use client";

import GradientButton from "@/components/GradientButton";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import {
  fetchActiveImages,
  fetchContent,
  selectActiveImages,
  selectContent,
  selectRandomImageByType,
  selectIsLoading,
  ImageType
} from "@/lib/redux/features/heroExtensionSlice";
import Link from "next/link";

// Fallback images in case no images are available
const FALLBACK_IMAGES = [
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

// Helper function to get a random image from an array
const getRandomImage = (images: any[]) => {
  if (!images || images.length === 0) return null;
  return images[Math.floor(Math.random() * images.length)];
};

export default function HeroExtension() {
  const dispatch = useDispatch<AppDispatch>();
  const activeImages = useSelector(selectActiveImages);
  const content = useSelector(selectContent);
  const isLoading = useSelector(selectIsLoading);

  useEffect(() => {
    dispatch(fetchActiveImages());
    dispatch(fetchContent());
  }, [dispatch]);

  // Get random images for each type, with fallbacks
  const getImageForType = (type: ImageType, fallbackIndex: number) => {
    const typeImages = activeImages[type] || [];
    const randomImage = getRandomImage(typeImages);
    return randomImage ? {
      src: randomImage.imageUrl,
      alt: randomImage.altText
    } : {
      src: FALLBACK_IMAGES[fallbackIndex],
      alt: `Wedding image ${fallbackIndex + 1}`
    };
  };

  const images = {
    tallLeft: getImageForType('tall_left', 0),
    mainCenter: getImageForType('main_center', 1),
    bottomLeft: getImageForType('bottom_left', 2),
    centerBottom: getImageForType('center_bottom', 3),
    topRight: getImageForType('top_right', 4),
    farRight: getImageForType('far_right', 5)
  };

  // Default content with fallbacks
  const sectionContent = content || {
    title: "Effortless Planning for Your Dream Wedding",
    subtitle: "HELLO,",
    buttonText: "Contact Us",
    buttonLink: "/contact"
  };

  if (isLoading) {
    return (
      <section className="relative w-full bg-white overflow-hidden font-cormorant">
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </section>
    );
  }

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
              src={images.tallLeft.src}
              alt={images.tallLeft.alt}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="rounded-lg overflow-hidden shadow-lg w-full">
            <img
              src={images.bottomLeft.src}
              alt={images.bottomLeft.alt}
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
                  src={images.mainCenter.src}
                  alt={images.mainCenter.alt}
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
                  {sectionContent.subtitle}
                </span>
                <h2 className="font-bold text-4xl lg:text-5xl text-[#212d47] leading-tight my-4">
                  {sectionContent.title}
                </h2>
                <div className="mt-2">
                  <Link href={sectionContent.buttonLink}>
                    <GradientButton>
                      {sectionContent.buttonText}
                    </GradientButton>
                  </Link>
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
                src={images.centerBottom.src}
                alt={images.centerBottom.alt}
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
              src={images.topRight.src}
              alt={images.topRight.alt}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="rounded-lg overflow-hidden shadow-lg w-full">
            <img
              src={images.farRight.src}
              alt={images.farRight.alt}
              className="object-cover w-full h-full"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}