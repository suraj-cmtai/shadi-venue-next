"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import PricePopup from "@/components/(website)/price-popup";
import { useState } from "react";

// Figma MCP asset URLs
const ARROW_IMG = "/images/offer-arrow-right.svg";
const LINE_IMG = "/images/offer-line-horizontal.svg";

const offerData = {
  heading: "Need Guidance? Get Help!",
  description:
    "Feeling unsure of where to start? Don't worry! Our team is here to provide the guidance and support you need to make the right decisions and achieve your goals",
  subtitle: "Allow it to unfold",
  offerTitle: "Exclusive Price Offer",
};

export default function Offer() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <section className="w-full py-12 md:py-20 bg-white" id="offer">
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-between gap-8 px-4 md:px-8">
        {/* Left: Heading & Description */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Decorative vertical line */}
          <div className="flex items-start gap-4">
            <div className="hidden lg:block h-full min-h-32 w-1 bg-[#212d47] rounded-sm mt-1" aria-hidden="true" />
            <div className="flex-1">
              <motion.h2
                className="font-dancing-script font-normal text-2xl md:text-4xl lg:text-5xl text-[#212d47] mb-2 leading-tight"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
              >
                {offerData.heading}
              </motion.h2>
              <motion.p
                className="font-cormorant font-medium text-base md:text-lg text-[#7d7d7d] leading-relaxed mt-2"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
              >
                {offerData.description}
              </motion.p>
            </div>
          </div>
        </div>

        {/* Right: Offer Card */}
        <motion.div
          className="flex-1 w-full max-w-md lg:max-w-sm mt-8 lg:mt-0"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <button
            type="button"
            onClick={() => setShowPopup(true)}
            className="relative bg-[#212d47] rounded-md flex flex-col justify-center px-6 py-6 min-h-28 shadow-sm w-full text-left focus:outline-none cursor-pointer"
          >
            {/* Subtitle */}
            <div className="flex flex-col gap-1">
              <span className="font-cormorant font-light text-xs md:text-sm text-white">
                {offerData.subtitle}
              </span>
              
            </div>
            {/* Offer Title & Arrow */}
            <div className="flex items-center justify-between mt-2">
              <span className="font-cormorant font-bold text-sm md:text-base text-white uppercase tracking-wide">
                {offerData.offerTitle}
              </span>
                            
              <span className="ml-4 flex-shrink-0">
                <Image
                  src={ARROW_IMG}
                  alt="Arrow"
                  width={40}
                  height={40}
                  className="w-8 h-8 object-contain"
                />
              </span>
            </div>
            {/* Decorative line */}
            <div className="h-0.5 w-8 my-1">
                <Image
                  src={LINE_IMG}
                  alt="Decorative line"
                  width={32}
                  height={2}
                  className="h-0.5 w-8 object-contain"
                />
              </div>
          </button>
        </motion.div>
        <PricePopup open={showPopup} onClose={() => setShowPopup(false)} />
      </div>
    </section>
  );
}
