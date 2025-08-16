"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { fetchActiveTestimonials, selectActiveTestimonials, selectIsLoading } from "@/lib/redux/features/testimonialSlice";
import GradientButton from "@/components/GradientButton";
import Image from "next/image";
import { motion } from "framer-motion";

// Image constants
const imgArrowRight = "/images/testimonials-arrow-right-vector.svg";
const imgArrowLeft = "/images/testimonials-arrow-left-vector.svg";
const imgVectorFlowerRight = "/images/testimonials-flower-right-side-vector.svg";
const imgVectorDecorativeLeft = "/images/testimonials-decorative-left-vector.svg";
const imgVectorDecorativeRight = "/images/testimonials-decorative-right-vector.svg";
const imgQuotes = "/images/testimonials-quotes-vector.svg";
const imgVectorFlowerTopLeft = "/images/testimonials-flower-top-left-bg-vector.svg";

export default function Testimonials() {
  const dispatch = useAppDispatch();
  const testimonials = useAppSelector(selectActiveTestimonials);
  const isLoading = useAppSelector(selectIsLoading);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchActiveTestimonials());
  }, [dispatch]);

  // Reset index if testimonials change
  useEffect(() => {
    if (testimonials.length > 0 && currentIndex >= testimonials.length) {
      setCurrentIndex(0);
    }
  }, [testimonials, currentIndex]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="relative w-full py-12 md:py-24 bg-white overflow-hidden" id="testimonials">
      {/* Decorative flower bg left */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="pointer-events-none absolute left-0 top-0 z-0 w-48 md:w-72 opacity-30"
        aria-hidden="true"
      >
        <Image
          src={imgVectorFlowerTopLeft}
          alt="Decorative flower"
          width={300}
          height={300}
          className="w-full h-auto"
          priority
        />
      </motion.div>

      <div className="relative max-w-7xl mx-auto flex flex-col items-center z-10 px-4">
        {/* Title and subtitle */}
        <div className="w-full flex flex-col items-center mb-8 md:mb-12 relative">
          {/* Subtitle */}
          <div className="flex items-center gap-2 mb-2">
            {/* Decorative left vector */}
            <span className="hidden md:inline-block">
              <Image src={imgVectorDecorativeLeft} alt="Decorative" width={18} height={18} className="w-4 h-4" />
            </span>
            <span className="uppercase tracking-[0.15em] text-sm md:text-base font-cormorant text-black font-medium">
              OUR Testimonials
            </span>
            {/* Decorative right vector */}
            <span className="hidden md:inline-block">
              <Image src={imgVectorDecorativeRight} alt="Decorative" width={18} height={18} className="w-4 h-4" />
            </span>
          </div>
          {/* Main Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-dancing-script text-2xl md:text-5xl text-[#212d47] text-center capitalize font-normal"
          >
            Exceeded All My Expectations.
          </motion.h2>
        </div>

        {/* Main testimonial content */}
        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 relative z-10">
          {/* Images */}
          <div className="flex flex-row gap-4 md:gap-6 items-end">
            {currentTestimonial && currentTestimonial.images && currentTestimonial.images.slice(0, 2).map((imgSrc, idx) => (
              <motion.div
                key={imgSrc}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 * (idx + 1) }}
                className="relative rounded-xs overflow-hidden shadow-lg border-4 border-white"
              >
                <Image
                  src={imgSrc}
                  alt={`Wedding testimonial ${idx + 1}`}
                  width={idx === 0 ? 200 : 220}
                  height={idx === 0 ? 260 : 280}
                  className={idx === 0
                    ? "w-32 md:w-44 lg:w-56 h-auto object-cover"
                    : "w-36 md:w-52 lg:w-64 h-auto object-cover"
                  }
                  priority
                />
              </motion.div>
            ))}
          </div>

          {/* Testimonial Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative bg-neutral-50 rounded-xl shadow-lg px-6 py-8 md:px-10 md:py-10 flex flex-col gap-4 max-w-xl w-full"
          >
            {/* Decorative flower right */}
            <div className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/3 pointer-events-none hidden md:block">
              <Image src={imgVectorFlowerRight} alt="Decorative flower" width={120} height={120} className="w-32 h-auto" />
            </div>
            {/* Quotes icon and testimonial content */}
            <div className="flex items-start flex-col gap-2">
              <span>
                <Image src={imgQuotes} alt="Quotes" width={48} height={48} className="w-12 md:w-14 h-auto" />
              </span>
              {/* Name */}
              <div className="text-[#212d47] text-lg md:text-2xl font-cormorant font-semibold uppercase text-center mt-2">
                {currentTestimonial?.name}
              </div>
              <p className="text-[#7d7d7d] text-base md:text-lg font-cinzel lowercase leading-relaxed">
                {currentTestimonial?.text}
              </p>
              {/* Button */}
            <div className="flex justify-center mt-2">
              <GradientButton className="uppercase font-cormorant font-bold text-base md:text-lg px-6 py-2">
                VIEW THEIR STORY
              </GradientButton>
            </div>
            </div>
            
            
          </motion.div>
        </div>

        {/* Slider controls */}
        <div className="w-full flex items-center justify-center gap-4 mt-8 md:mt-12">
          <button
            onClick={prevTestimonial}
            aria-label="Previous testimonial"
            className="p-2 rounded-full hover:bg-neutral-100 transition"
            disabled={isLoading || testimonials.length === 0}
          >
            <Image src={imgArrowLeft} alt="Previous" width={32} height={32} className="w-6 h-6 rotate-180" />
          </button>
          <span className="font-cormorant text-[#212d47] text-base md:text-lg font-normal">
            {testimonials.length > 0 ? currentIndex + 1 : 0} / {testimonials.length}
          </span>
          <button
            onClick={nextTestimonial}
            aria-label="Next testimonial"
            className="p-2 rounded-full hover:bg-neutral-100 transition"
            disabled={isLoading || testimonials.length === 0}
          >
            <Image src={imgArrowRight} alt="Next" width={32} height={32} className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
}