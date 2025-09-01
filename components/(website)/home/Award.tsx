"use client";

import { motion } from "framer-motion";

// Asset URLs
const IMAGES02_IMG = "/images/award-image-2.png";
const IMAGES01_IMG = "/images/award-image-1.png";
const VECTOR_IMG = "/images/award-flower-vector-1.svg";
const LINE_IMG = "/images/award-line-vector.svg";
const VECTOR1_IMG = "/images/award-decorative-left-vector.svg";
const VECTOR2_IMG = "/images/award-decorative-right-vector.svg";
const VECTOR06_IMG = "/images/award-flower-left-bg-vector.svg";

const counters = [
  {
    value: "135",
    label: "Weddings Hosted Annually",
  },
  {
    value: "08",
    label: "Years of Exceptional Service",
  },
  {
    value: "1925",
    label: "Custom Decorations Created",
  },
  {
    value: "225",
    label: "Sunny Days Each Year",
  },
];

export default function Award() {
  return (
    <div className="relative w-full bg-white overflow-x-hidden">
      {/* Desktop Layout */}
      <div className="hidden lg:flex w-full items-stretch justify-center py-16 relative">
        {/* Left Image */}
        <div className="flex-shrink-0 flex items-end">
          <img
            src={IMAGES01_IMG}
            alt="Left"
            className="h-[320px] w-auto object-cover rounded-xs"
            style={{ minWidth: 120, maxHeight: 400 }}
          />
        </div>
        {/* Center Content */}
        <div className="relative flex-1 flex flex-col items-center justify-center px-0">
          {/* Background Rectangle */}
          <div className="absolute inset-0 bg-neutral-50 rounded-xs shadow-none z-0" />
          {/* Top Decorative Vectors and Label */}
          <div className="relative flex flex-col items-center z-10 pt-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <img src={VECTOR1_IMG} alt="" className="h-3 w-auto" />
              <span className="font-cormorant font-medium text-[15px] text-black uppercase tracking-[1.5px] px-2">
                AWARDS AND REVIEWS
              </span>
              <img src={VECTOR2_IMG} alt="" className="h-3 w-auto " />
            </div>
            <h2 className="font-dancing-script font-normal text-[28px] xl:text-[36px] 2xl:text-[40px] text-[#212d47] text-center mb-8 leading-tight px-2">
              Ranked Among the Top Ten Wedding Venues in India
            </h2>
          </div>
          {/* Counters */}
          <div className="relative z-10 w-full flex flex-row items-end justify-center gap-8 xl:gap-16 px-8 pb-8">
            {counters.map((counter, idx) => (
              <div key={counter.label} className="flex flex-col items-center min-w-[140px]">
                <div className="font-dancing-script font-bold text-[32px] xl:text-[38px] 2xl:text-[44px] text-[#212d47] mb-1">
                  {counter.value}
                </div>
                <div className="w-8 h-[2px] mb-1">
                  <img src={LINE_IMG} alt="" className="w-full h-full object-contain" />
                </div>
                <div className="font-cormorant font-normal text-[13px] xl:text-[15px] text-[#7d7d7d] uppercase text-center tracking-wide">
                  {counter.label}
                </div>
              </div>
            ))}
          </div>
          {/* Left Decorative Vector */}
          <img
            src={VECTOR_IMG}
            alt=""
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[60px] w-auto z-10"
            style={{ transform: "translateY(-50%)" }}
          />
          {/* Right Decorative Vector */}
          <img
            src={VECTOR06_IMG}
            alt=""
            className="absolute right-0 top-1/2 -translate-y-1/2 h-[60px] w-auto z-10"
            style={{ transform: "translateY(-50%)" }}
          />
        </div>
        {/* Right Image */}
        <div className="flex-shrink-0 flex items-end">
          <img
            src={IMAGES02_IMG}
            alt="Right"
            className="h-[320px] w-auto object-cover rounded-xs"
            style={{ minWidth: 120, maxHeight: 400 }}
          />
        </div>
      </div>
      {/* Mobile/Tablet Responsive Layout */}
      <div className="block lg:hidden w-full max-w-3xl mx-auto px-2 py-10">
        <div className="flex w-full items-stretch justify-center">
          {/* Left Image */}
          <div className="flex-shrink-0 flex items-end">
            <img
              src={IMAGES01_IMG}
              alt="Left"
              className="h-[90px] w-auto object-cover"
              style={{ minWidth: 60, maxHeight: 120 }}
            />
          </div>
          {/* Center Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-2">
            <div className="flex items-center justify-center gap-1 mb-1 mt-2">
              <img src={VECTOR1_IMG} alt="" className="h-2 w-auto" />
              <span className="font-cormorant font-medium text-[11px] text-black uppercase tracking-[1.2px] px-1">
                AWARDS AND REVIEWS
              </span>
              <img src={VECTOR2_IMG} alt="" className="h-2 w-auto " />
            </div>
            <h2 className="font-dancing-script font-normal text-[16px] xs:text-[18px] sm:text-[20px] text-[#212d47] text-center mb-4 leading-tight px-1">
              Among The Top Ten Wedding Venues In The All Countries
            </h2>
            {/* Counters */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 w-full justify-items-center">
              {counters.map((counter, idx) => (
                <div key={counter.label} className="flex flex-col items-center min-w-[80px]">
                  <div className="font-dancing-script font-bold text-[18px] xs:text-[20px] text-[#212d47] mb-1">
                    {counter.value}
                  </div>
                  <div className="w-6 h-[2px] mb-1">
                    <img src={LINE_IMG} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="font-cormorant font-normal text-[9px] xs:text-[10px] text-[#7d7d7d] uppercase text-center tracking-wide">
                    {counter.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Right Image */}
          <div className="flex-shrink-0 flex items-end">
            <img
              src={IMAGES02_IMG}
              alt="Right"
              className="h-[90px] w-auto object-cover"
              style={{ minWidth: 60, maxHeight: 120 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
