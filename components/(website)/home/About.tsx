"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import GradientButton from "@/components/GradientButton";
import Link from "next/link";
import { 
  fetchActiveAboutContent,
  fetchActiveProcessSteps,
  selectActiveAboutContent,
  selectActiveProcessSteps,
  selectIsLoading,
  selectHasFetched,
  selectError
} from "@/lib/redux/features/aboutSlice";
import { AppDispatch } from "@/lib/redux/store";

// Figma MCP asset URLs (fallback images if no data from Redux)
const IMAGE_IMG = "/images/about-shadi-image-1.png";
const VECTOR_IMG = "/images/about-flower-vector-bottom-right-corner.svg";
const NAME_IMG = "/images/about-sticky-tape-name-tag-vector.svg";
const VECTOR01_IMG = "/images/about-flower-shadow-right-image-vector.svg";
const VECTOR02_IMG = "/images/about-flower-shadow-top-left-vector.svg";
const VECTOR2_IMG = "/images/about-decorative-vector-left.svg";
const VECTOR3_IMG = "/images/about-decorative-vector-right.svg";

// Default/fallback content
const DEFAULT_ABOUT_CONTENT = {
  title: "We Build Your Dream Around You",
  subtitle: "ABOUT US",
  description: "At SHADIVENUE, we believe that a wedding is not just a ceremony—it's a once-in-a-lifetime experience, a celebration of love, culture, and togetherness. Founded with a vision to make every couple's dream wedding a seamless reality, SHADIVENUE specializes in destination wedding bookings across India, curating unforgettable experiences in the country's most enchanting locations.",
  buttonText: "More",
  buttonLink: "/about",
  image: "/images/about-new/Bride & Groom_- @kashtag90 & @jhalakshah_ Wedding….jpg"
};

// Process step icon image constants (fallback)
const PROCESS_STEP_ICONS = [
  "/images/about-process-icon-1.png",
  "/images/about-process-icon-2.png",
  "/images/about-process-icon-3.png",
  "/images/about-process-icon-4.png",
];

const DEFAULT_PROCESS_STEPS = [
  {
    id: "1",
    icon: PROCESS_STEP_ICONS[0],
    title: "Tell us your dream",
    bgColor: "bg-white border border-[#212d47] text-black",
    titleColor: "text-[#212d47]",
    description: "Begin by sharing your vision—ceremony style, guest count, must-haves, and budget. Whether it's an intimate garden affair 🌿 or a lavish palace weekend 👑, your story sets the stage.",
    order: 1,
    status: "active" as const,
    createdOn: "",
    updatedOn: ""
  },
  {
    id: "2",
    icon: PROCESS_STEP_ICONS[1],
    title: "We curate the best venues",
    bgColor: "bg-[#212d47] text-white",
    titleColor: "text-white",
    description: "Using your preferences, we handpick venues that match your vibe and budget. We showcase the ambiance, logistics, and unique offerings so you can truly feel the space before deciding.",
    order: 2,
    status: "active" as const,
    createdOn: "",
    updatedOn: ""
  },
  {
    id: "3",
    icon: PROCESS_STEP_ICONS[2],
    title: "You choose, We Coordinate",
    bgColor: "bg-white border border-[#212d47] text-black",
    titleColor: "text-[#212d47]",
    description: "Once a venue is selected, our team handles all logistics—negotiations, contracts, vendor coordination, scheduling—so you can breathe easy and enjoy the process.",
    order: 3,
    status: "active" as const,
    createdOn: "",
    updatedOn: ""
  },
  {
    id: "4",
    icon: PROCESS_STEP_ICONS[3],
    title: "Your Day, Our Touch",
    bgColor: "bg-[#212d47] text-white",
    titleColor: "text-white",
    description: "On your wedding day, our experienced coordinators oversee every detail: setup, vendor timing, special requests, and troubleshooting—bringing your dream to life seamlessly.",
    order: 4,
    status: "active" as const,
    createdOn: "",
    updatedOn: ""
  },
];

export default function About() {
  const dispatch = useDispatch<AppDispatch>();
  const activeAboutContent = useSelector(selectActiveAboutContent);
  const activeProcessSteps = useSelector(selectActiveProcessSteps);
  const isLoading = useSelector(selectIsLoading);
  const hasFetched = useSelector(selectHasFetched);
  const error = useSelector(selectError);

  // Load data on component mount
  useEffect(() => {
    if (!hasFetched) {
      dispatch(fetchActiveAboutContent());
      dispatch(fetchActiveProcessSteps());
    }
  }, [dispatch, hasFetched]);

  // Get the first active about content or use default
  const aboutContent = activeAboutContent && activeAboutContent.length > 0 
    ? activeAboutContent[0] 
    : DEFAULT_ABOUT_CONTENT;

  // Get active process steps sorted by order or use default
  const processSteps = activeProcessSteps && activeProcessSteps.length > 0 
    ? [...activeProcessSteps].sort((a, b) => a.order - b.order)
    : DEFAULT_PROCESS_STEPS;

  return (
    <section className="relative w-full bg-neutral-50 overflow-x-clip">
      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Error loading content: {error}</p>
            <p className="text-sm text-gray-600 mt-2">Displaying default content instead.</p>
          </div>
        </div>
      )}

      {/* Decorative Top Left */}
      <div className="hidden md:block absolute left-0 top-0 z-0 w-1/4 max-w-xs pointer-events-none">
        <img
          src={VECTOR02_IMG}
          alt="Decorative element"
          className="w-full h-auto"
        />
      </div>
      {/* Decorative Bottom Right (use VECTOR_IMG as per instruction) */}
      <div className="hidden md:block absolute right-0 bottom-0 z-0 w-1/4 max-w-xs pointer-events-none opacity-20">
        <img
          src={VECTOR_IMG}
          alt="Decorative element bottom right"
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
              {aboutContent.subtitle}
            </motion.p>
            <motion.h2
              className="font-cormorant font-bold text-2xl md:text-4xl lg:text-5xl text-[#212d47] mb-4 md:mb-8 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {aboutContent.title}
            </motion.h2>
            <motion.p
              className="font-cinzel text-sm md:text-base lg:text-lg text-[#7d7d7d] leading-relaxed mb-6 md:mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {aboutContent.description}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Link href={aboutContent.buttonLink}>
                <GradientButton>
                  {aboutContent.buttonText}
                </GradientButton>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: Framed Image with very light gray bg, flower vector, and translucent bottom left vector */}
          <motion.div
            className="w-full lg:w-1/2 flex items-center justify-end relative z-10 mt-12 lg:mt-10"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            {/* Outer Frame with very light gray background */}
            <div className="relative w-full h-full pt-8 pr-12 pb-8 pl-8 bg-gray-100 shadow-xl flex items-center justify-center rounded-lg">
              {/* Decorative flower vector (already present) */}
              <div className="hidden md:block absolute right-0 top-0 z-10 w-1/3 max-w-xs pointer-events-none">
                <img
                  src={VECTOR01_IMG}
                  alt="Decorative flower"
                  className="w-full h-auto"
                />
              </div>
              {/* Decorative PNG bottom-left corner inside the gray frame, translucent */}
              <div className="absolute -left-4 -bottom-4 w-32 h-32 md:w-60 md:h-64 z-64 opacity-90">
                <div className="relative w-full h-full rotate-[-10deg]">
                  <img
                    src="/images/wedding/shadi-venue.png"
                    alt="venue-card"
                    className="object-contain w-full h-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white font-cinzel text-sm font-bold text-center pointer-events-none rotate-[42deg]">
                      SHADI VENUE
                    </p>
                  </div>
                </div>
              </div>
              {/* Decorative SVG bottom-right inside the gray frame, similar to bottom-left but using VECTOR_IMG */}
              <div className="absolute -right-4 -bottom-6 w-32 h-32 md:w-60 md:h-64 z-64 opacity-90">
                <div className="relative w-full h-full rotate-[10deg]">
                  <img
                    src={VECTOR_IMG}
                    alt="Decorative flower bottom right"
                    className="object-contain w-full h-full"
                  />
                </div>
              </div>
              {/* White inner frame */}
              <div className="bg-white p-1 md:p-2 rounded-md relative z-10 w-full">
                <div className="relative w-full aspect-[4/5] overflow-hidden rounded-md">
                  <img
                    src={aboutContent.image}
                    alt="About Us"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to default image if the dynamic image fails to load
                      e.currentTarget.src = "/images/about-new/Bride & Groom_- @kashtag90 & @jhalakshah_ Wedding….jpg";
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
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
            {processSteps.map((step, idx) => (
              <motion.div
                key={step.id}
                className={`flex flex-col h-full aspect-auto shadow-sm ${step.bgColor} p-4 md:p-6`}
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
                    onError={(e) => {
                      // Fallback to default icons if dynamic icon fails to load
                      const fallbackIcon = PROCESS_STEP_ICONS[idx] || PROCESS_STEP_ICONS[0];
                      e.currentTarget.src = fallbackIcon;
                    }}
                  />
                </div>
                <h4 className={`font-cormorant font-bold text-lg md:text-xl mb-2 md:mb-4 underline ${step.titleColor}`}>
                  {step.title}
                </h4>
                <p className="font-cinzel text-xs md:text-base leading-relaxed text-left">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );}