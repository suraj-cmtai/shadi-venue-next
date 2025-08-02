"use client";

import { motion } from "framer-motion";
import GradientButton from "@/components/GradientButton";

// Figma MCP asset URLs
const IMAGE_IMG = "/images/about-shadi-image-1.png";
const VECTOR_IMG = "/images/about-flower-vector-bottom-right-corner.svg";
const NAME_IMG = "/images/about-sticky-tape-name-tag-vector.svg";
const VECTOR01_IMG = "/images/about-flower-shadow-right-image-vector.svg";
const VECTOR02_IMG = "/images/about-flower-shadow-top-left-vector.svg";
const VECTOR2_IMG = "/images/about-decorative-vector-left.svg";
const VECTOR3_IMG = "/images/about-decorative-vector-right.svg";

// Process step icon image constants
const PROCESS_STEP_ICONS = [
  "/images/about-process-icon-1.png",
  "/images/about-process-icon-2.png",
  "/images/about-process-icon-3.png",
  "/images/about-process-icon-4.png",
];

const PROCESS_STEPS = [
  {
    icon: PROCESS_STEP_ICONS[0],
    title: "Tell us your dream",
    bg: "bg-white border border-[#212d47] text-black",
    titleColor: "text-[#212d47]",
    desc: (
      <>
        Begin by sharing your vision—ceremony style, guest count, must-haves, and budget. Whether it's an intimate garden affair 🌿 or a lavish palace weekend 👑, your story sets the stage.
      </>
    ),
  },
  {
    icon: PROCESS_STEP_ICONS[1],
    title: "We curate the best venues",
    bg: "bg-[#212d47] text-white",
    titleColor: "text-white",
    desc: (
      <>
        Using your preferences, we handpick venues that match your vibe and budget. We showcase the ambiance, logistics, and unique offerings so you can truly feel the space before deciding.
      </>
    ),
  },
  {
    icon: PROCESS_STEP_ICONS[2],
    title: "You choose, We Coordinate",
    bg: "bg-white border border-[#212d47] text-black",
    titleColor: "text-[#212d47]",
    desc: (
      <>
        Once a venue is selected, our team handles all logistics—negotiations, contracts, vendor coordination, scheduling—so you can breathe easy and enjoy the process.
      </>
    ),
  },
  {
    icon: PROCESS_STEP_ICONS[3],
    title: "Your Day, Our Touch",
    bg: "bg-[#212d47] text-white",
    titleColor: "text-white",
    desc: (
      <>
        On your wedding day, our experienced coordinators oversee every detail: setup, vendor timing, special requests, and troubleshooting—bringing your dream to life seamlessly.
      </>
    ),
  },
];

export default function About() {
  return (
    <section className="relative w-full bg-neutral-50 overflow-x-clip">
      {/* Decorative Top Left */}
      <div className="hidden md:block absolute left-0 top-0 z-0 w-1/4 max-w-xs pointer-events-none">
        <img
          src={VECTOR02_IMG}
          alt="Decorative element"
          className="w-full h-auto"
        />
      </div>
      {/* Decorative Bottom Right */}
      <div className="hidden md:block absolute right-0 bottom-0 z-0 w-1/4 max-w-xs pointer-events-none">
        <img
          src={VECTOR01_IMG}
          alt="Decorative element"
          className="w-full h-auto"
        />
      </div>

      {/* Main About Section */}
      <div className="w-full">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 px-4 md:px-8 py-12 md:py-20 relative z-10">
          {/* Left: Text */}
          <motion.div
            className="w-full lg:w-1/2 flex flex-col items-start"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.p
              className="font-cormorant font-medium text-base md:text-lg text-black uppercase tracking-wider mb-2 md:mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              ABOUT US
            </motion.p>
            <motion.h2
              className="font-cormorant font-bold text-2xl md:text-4xl lg:text-5xl text-[#212d47] mb-4 md:mb-8 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              We Build Your Dream <br className="hidden md:block" />
              Around You
            </motion.h2>
            <motion.p
              className="font-cinzel text-sm md:text-base lg:text-lg text-[#7d7d7d] leading-relaxed mb-6 md:mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              At SHADIVENUE, we believe that a wedding is not just a ceremony—it's a once-in-a-lifetime experience, a celebration of love, culture, and togetherness. Founded with a vision to make every couple's dream wedding a seamless reality, SHADIVENUE specializes in destination wedding bookings across India, curating unforgettable experiences in the country's most enchanting locations.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <GradientButton>
                More
              </GradientButton>
            </motion.div>
          </motion.div>

          {/* Right: Image with overlays */}
          <div className="w-full lg:w-1/2 flex justify-center relative">
            <div className="relative w-full max-w-md">
              <div className="relative overflow-hidden  shadow-lg">
                <img
                  src="/images/about-shadi-venue-image.png"
                  alt="Shadi Venue"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Planning Process Section */}
      <div className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
          <motion.div
            className="text-center mb-10 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-2 md:gap-4 mb-2 md:mb-4">
              <img src={VECTOR2_IMG} alt="Decorative" className="h-4 w-auto" />
              <h3 className="font-cormorant font-medium text-xs md:text-lg text-black uppercase tracking-wider">
                Our Planning Process
              </h3>
              <img src={VECTOR3_IMG} alt="Decorative" className="h-4 w-auto" />
            </div>
            <h2 className="font-dancing-script font-normal text-2xl md:text-4xl lg:text-5xl text-[#212d47] capitalize">
              Make It Extraordinary And Memorable.
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
            {PROCESS_STEPS.map((step, idx) => (
              <motion.div
                key={step.title}
                className={`flex flex-col h-full aspect-auto shadow-sm ${step.bg} p-4 md:p-6`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
              >
                <div className="text-center mb-4 flex justify-center">
                  <img
                    src={step.icon}
                    alt={`${step.title} icon`}
                    className="h-12 w-12 md:h-16 md:w-16 object-contain mx-auto"
                    loading="lazy"
                  />
                </div>
                <h4 className={`font-cormorant font-bold text-lg md:text-xl mb-2 md:mb-4 underline ${step.titleColor}`}>
                  {step.title}
                </h4>
                <p className="font-cinzel text-xs md:text-base leading-relaxed text-left">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
