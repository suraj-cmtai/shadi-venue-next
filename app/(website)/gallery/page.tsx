"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  fetchActiveGallery,
  selectActiveGalleryList,
  selectIsLoading,
  selectError,
} from "@/lib/redux/features/gallerySlice";

function GalleryCard({
  imageUrl,
  altText = "Gallery image",
  spanTwo = false,
  onClick,
}: {
  imageUrl: string;
  altText?: string;
  spanTwo?: boolean;
  onClick?: () => void;
}) {
  // Responsive card: span 2 columns on md+ if spanTwo, else 1
  return (
    <motion.div
      className={`relative overflow-hidden shadow hover:shadow-lg transition-all duration-300 w-full cursor-pointer ${
        spanTwo ? "col-span-1 md:col-span-2" : "col-span-1"
      } h-48 xs:h-56 sm:h-64 md:h-72 lg:h-80`}
      whileHover={{ scale: 1.03 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      onClick={onClick}
      role="button"
      aria-label={altText}
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
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);

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

  // Build image list for the modal when gallery data loads/changes
  useEffect(() => {
    if (Array.isArray(gallery)) {
      const images = gallery
        .map((g: any) => g?.image)
        .filter((src: any) => typeof src === "string" && src.length > 0);
      setGalleryImages(images);
      if (images.length === 0) {
        setIsGalleryOpen(false);
      }
    }
  }, [gallery]);

  // Hero image carousel effect
  useEffect(() => {
    if (galleryImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentHeroImage((prev) => (prev + 1) % galleryImages.length);
      }, 4000); // Change image every 4 seconds
      return () => clearInterval(interval);
    }
  }, [galleryImages]);

  const openGalleryAt = (index: number) => {
    if (index >= 0 && index < galleryImages.length) {
      setGalleryIndex(index);
      setIsGalleryOpen(true);
    }
  };

  const handlePrevImage = () => {
    setGalleryIndex((prev) =>
      galleryImages.length > 0
        ? (prev - 1 + galleryImages.length) % galleryImages.length
        : 0
    );
  };

  const handleNextImage = () => {
    setGalleryIndex((prev) =>
      galleryImages.length > 0
        ? (prev + 1) % galleryImages.length
        : 0
    );
  };

  return (
    <>
      {/* Hero Section */}
      <section className="w-full relative flex items-center justify-center overflow-hidden min-h-[40vh] sm:min-h-[50vh] bg-black">
        {/* Dynamic Background Images */}
        {galleryImages.length > 0 && (
          <div className="absolute inset-0 z-0">
            {galleryImages.map((image, index) => (
              <Image
                key={image}
                src={image}
                alt="Gallery Background"
                fill
                className={`object-cover transition-opacity duration-1000 ${
                  index === currentHeroImage ? 'opacity-50' : 'opacity-0'
                }`}
                priority={index === 0}
                unoptimized
              />
            ))}
            {/* 80% Black Background Overlay */}
            <div className="absolute inset-0 bg-black opacity-80"></div>
          </div>
        )}
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
            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {gallery && gallery.length > 0 ? (
                gallery.map((img, i) => (
                  <GalleryCard
                    key={img.id}
                    imageUrl={img.image}
                    altText={img.title || img.description || "Gallery image"}
                    spanTwo={i === 0 && isMdUp}
                    onClick={() => openGalleryAt(i)}
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
              {/* Image Gallery Modal */}
              <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
          <DialogContent className="w-auto max-w-none p-0 overflow-hidden">
            <div className="relative bg-black">
              {galleryImages.length > 0 && (
                <img
                  src={galleryImages[galleryIndex]}
                  alt={`Gallery Image ${galleryIndex + 1}`}
                  className="w-full h-[70vh] object-contain bg-black"
                />
              )}
              {/* Controls */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    aria-label="Previous image"
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#212d47] rounded-full p-2 shadow"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    aria-label="Next image"
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#212d47] rounded-full p-2 shadow"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/80 text-sm px-2 py-1 rounded bg-black/40">
                    {galleryIndex + 1} / {galleryImages.length}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
    </>
  );
}
