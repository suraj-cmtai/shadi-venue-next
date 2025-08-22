"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { 
  fetchActiveProcessSteps,
  selectActiveProcessSteps,
  selectIsLoading,
  selectHasFetched,
  selectError
} from "@/lib/redux/features/aboutSlice";
import { AppDispatch } from "@/lib/redux/store";

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

export default function Process() {
  const dispatch = useDispatch<AppDispatch>();
  const activeProcessSteps = useSelector(selectActiveProcessSteps);
  const isLoading = useSelector(selectIsLoading);
  const hasFetched = useSelector(selectHasFetched);
  const error = useSelector(selectError);

  // Load data on component mount
  useEffect(() => {
    if (!hasFetched) {
      dispatch(fetchActiveProcessSteps());
    }
  }, [dispatch, hasFetched]);

  // Get active process steps sorted by order or use default
  const processSteps = activeProcessSteps && activeProcessSteps.length > 0 
    ? [...activeProcessSteps].sort((a, b) => a.order - b.order)
    : DEFAULT_PROCESS_STEPS;

  return (
    <section className="relative w-full bg-white overflow-x-clip">
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
            <p className="text-red-600">Error loading process steps: {error}</p>
            <p className="text-sm text-gray-600 mt-2">Displaying default content instead.</p>
          </div>
        </div>
      )}

      {/* Planning Process Section */}
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
          <motion.div
            className="text-center mb-10 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-2 md:gap-4 mb-2 md:mb-4">
              <img 
                src="/images/about-decorative-vector-left.svg" 
                alt="Decorative" 
                className="h-4 w-auto" 
              />
              <h3 className="font-cormorant font-medium text-xs md:text-lg text-black uppercase tracking-wider">
                Our Planning Process
              </h3>
              <img 
                src="/images/about-decorative-vector-right.svg" 
                alt="Decorative" 
                className="h-4 w-auto" 
              />
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
  );
}
