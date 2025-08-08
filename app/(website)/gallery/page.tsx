"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  fetchActiveGallery,
  selectActiveGalleryList,
  selectIsLoading,
  selectError,
} from "@/lib/redux/features/gallerySlice";

/**
 * GalleryPage displays a responsive gallery of images with decorative elements.
 * - Uses Tailwind for all sizing, spacing, and responsive utilities.
 * - Fully responsive: grid adapts from 1 to 5 columns, card heights scale, and decorative images hide on mobile.
 * - Accessible: all images have alt text, navigation uses semantic elements.
 * - No fixed pixel values except for decorative image containers (which are responsive).
 */

function GalleryCard({
  imageUrl,
  altText = "Gallery image",
  spanTwo = false,
}: {
  imageUrl: string;
  altText?: string;
  spanTwo?: boolean;
}) {
  // Responsive card: span 2 columns on md+ if spanTwo, else 1
  return (
    <motion.div
      className={`relative overflow-hidden shadow hover:shadow-lg transition-all duration-300 w-full ${
        spanTwo ? "col-span-1 md:col-span-2" : "col-span-1"
      } h-48 xs:h-56 sm:h-64 md:h-72 lg:h-80`}
      whileHover={{ scale: 1.03 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Image
        src={imageUrl}
        alt={altText}
        fill
        className="object-cover hover:scale-105 transition-transform duration-300"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
        priority={spanTwo}
      />
    </motion.div>
  );
}

export default function GalleryPage() {
  // Responsive logic for spanTwo: only on md+ screens
  const [isMdUp, setIsMdUp] = useState(false);

  // Redux
  const dispatch = useDispatch();
  const gallery = useSelector(selectActiveGalleryList);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  useEffect(() => {
    dispatch(fetchActiveGallery() as any);
  }, [dispatch]);

  useEffect(() => {
    const checkScreen = () => setIsMdUp(window.innerWidth >= 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="w-full relative flex items-center justify-center overflow-hidden min-h-[40vh] sm:min-h-[50vh] bg-[#595959]">
        {/* Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#595959] opacity-60"></div>
        </div>
        {/* Content */}
        <div className="w-full max-w-7xl mx-auto px-4 relative z-10 text-center flex flex-col items-center justify-center py-16 sm:py-24">
          <motion.h1
            className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-wide uppercase mb-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            GALLERY
          </motion.h1>
          <div className="mx-auto w-10 h-0.5 bg-black mb-2" />
          {/* Breadcrumb */}
          <nav
            className="mb-8 flex items-center justify-center text-gray-300 text-xs xs:text-sm md:text-base"
            aria-label="Breadcrumb"
          >
            <Link
              href="/"
              className="text-white hover:text-gray-300 transition-colors duration-300"
            >
              Home
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link
              href="/gallery"
              className="text-white hover:text-gray-300 transition-colors duration-300"
              aria-current="page"
            >
              <span className="font-medium">Gallery</span>
            </Link>
          </nav>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="w-full relative bg-white py-10 sm:py-16 min-h-screen">
        {/* Decorative Leaves Left */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-0 hidden md:block">
          <div className="relative w-72 md:w-[28rem] h-60 md:h-[22rem]">
            <Image
              src="/images/wedding/Vector_1.png"
              alt="Decorative leaf"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        {/* Decorative Leaves Right */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-0 hidden md:block">
          <div className="relative w-64 md:w-[25rem] h-60 md:h-[22rem]">
            <Image
              src="/images/wedding/Vector_4.png"
              alt="Decorative leaf"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        <div className="w-full max-w-7xl mx-auto relative z-10 px-2 sm:px-4 md:px-8">
          <h2 className="text-center text-xl xs:text-2xl sm:text-3xl md:text-4xl font-cormorant text-[#1a2238] mb-8 sm:mb-12 font-semibold">
            Gallery Showcase
          </h2>
          {/* Loading/Error State */}
          {isLoading ? (
            <div className="flex justify-center items-center min-h-40">
              <span className="text-lg text-gray-500">Loading...</span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center min-h-40">
              <span className="text-lg text-red-500">{error}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {gallery && gallery.length > 0 ? (
                gallery.map((img, i) => (
                  <GalleryCard
                    key={img.id}
                    imageUrl={img.image}
                    altText={img.title || img.description || "Gallery image"}
                    spanTwo={i === 0 && isMdUp}
                  />
                ))
              ) : (
                <div className="col-span-full text-center text-gray-400 py-12">
                  No images found.
                </div>
              )}
            </div>
          )}
          <div className="text-center mt-8 sm:mt-10">
            <Button
              variant="default"
              className="bg-[#1a2238] text-white text-xs sm:text-sm py-2 px-6 tracking-widest uppercase hover:bg-[#0f172a] transition-colors rounded"
              aria-label="Load more images"
              disabled
            >
              Load More <span aria-hidden>↓</span>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
