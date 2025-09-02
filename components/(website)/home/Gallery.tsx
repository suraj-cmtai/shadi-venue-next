"use client";
/**
 * Gallery Section - Responsive, Figma-fidelity, scrollable gallery with ellipses overlaying the top and bottom of the images.
 * - Uses all provided images as backgrounds, no scroll bar, horizontal scroll feel.
 * - Ellipse SVGs overlay the top and bottom of the image row, always visible.
 * - Fully responsive, no fixed px values, uses Tailwind utilities.
 * - No new icon packages, all assets from Figma payload.
 * - Accessible and documented.
 */

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch } from "@/lib/redux/store";
import {
  fetchActiveGallery,
  selectActiveGalleryList,
  selectIsLoading,
  selectError,
} from "@/lib/redux/features/gallerySlice";

/**
 * Figma asset constants
 */
const imgEllipseTop = "/images/gallery-ellipse-vector-1.svg";
const imgEllipseBottom = "/images/gallery-ellipse-vector-2.svg";
const imgVector08 = "/images/gallery-flower-top-right-vector-.svg";

/**
 * Gallery component displays a horizontally scrollable gallery with decorative ellipses overlaying the top and bottom of the image row.
 * - Ellipses are visually above the images, creating a curved effect.
 * - No border around the gallery.
 * - Fully accessible and responsive.
 */
export default function Gallery() {
  const dispatch = useDispatch<AppDispatch>();
  const galleryImages = useSelector(selectActiveGalleryList);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  useEffect(() => {
    dispatch(fetchActiveGallery());
  }, [dispatch]);

  return (
    <section
      className="relative w-full py-8 md:py-16 bg-white overflow-hidden"
      data-name="gallery"
      aria-labelledby="gallery-heading"
    >
      {/* Section Content */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center gap-4 md:gap-8 px-2 md:px-8">
        {/* Section Label */}
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          id="gallery-label"
          className="font-cormorant font-medium text-center text-black text-base md:text-lg tracking-wide mt-8 md:mt-12"
        >
          Gallery
        </motion.p>
        {/* Section Heading */}
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          id="gallery-heading"
          className="font-dancing-script font-normal text-3xl md:text-4xl lg:text-5xl text-[#212d47] text-center mb-12 leading-tight"
        >
          Memorable Wedding Highlights in Our Gallery
        </motion.h2>

        {/* Gallery Scrollable Row with Ellipse Overlays */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative w-full"
        >
          <div
            className="relative w-full"
            aria-label="Gallery images"
            tabIndex={0}
          >
            {/* Ellipse overlays */}
            <div className="pointer-events-none absolute left-0 top-0 w-full flex justify-center z-20">
              <img
                src={imgEllipseTop}
                alt=""
                aria-hidden="true"
                className="w-full max-w-none h-16 md:h-28 object-cover"
                draggable={false}
              />
            </div>
            <div className="pointer-events-none absolute left-0 bottom-0 w-full flex justify-center z-20">
              <img
                src={imgEllipseBottom}
                alt=""
                aria-hidden="true"
                className="w-full max-w-none h-14 md:h-24 object-cover"
                draggable={false}
              />
            </div>
            {/* Gallery images row */}
            <div
              className="relative flex flex-row gap-4 md:gap-6 overflow-x-auto overflow-y-hidden scrollbar-hide py-8 md:py-14"
              style={{
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {isLoading ? (
                <div className="w-full flex justify-center items-center min-h-32 text-gray-400 text-lg">
                  Loading gallery...
                </div>
              ) : error ? (
                <div className="w-full flex justify-center items-center min-h-32 text-red-500 text-lg">
                  {error}
                </div>
              ) : galleryImages && galleryImages.length > 0 ? (
                galleryImages.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    className="shrink-0 rounded-xs bg-center bg-cover bg-no-repeat aspect-[3/4] w-40 md:w-72 lg:w-80 xl:w-96 h-60 md:h-96"
                    style={{ backgroundImage: `url('${item.image}')` }}
                    whileHover={{ scale: 1.03 }}
                    tabIndex={0}
                    aria-label={item.title ? `Gallery image: ${item.title}` : `Gallery image ${idx + 1}`}
                  >
                    <span className="sr-only">
                      {item.title || `Gallery image ${idx + 1}`}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="w-full flex justify-center items-center min-h-32 text-gray-400 text-lg">
                  No gallery images found.
                </div>
              )}
            </div>
            {/* No border overlay */}
          </div>
          {/* Decorative vector (top right) */}
          <div className="hidden md:block absolute -top-12 right-0 w-32 h-32 z-10">
            <img
              src={imgVector08}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-contain rotate-180 scale-y-[-1]"
              draggable={false}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}