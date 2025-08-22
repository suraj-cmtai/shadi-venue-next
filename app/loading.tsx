"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Global App Loading Screen
 * - Uses Framer Motion for entrance animation
 * - Uses shadcn Card for modern look
 * - Loader2 (lucide) for animated spinner
 * - Responsive, accessible, and Figma-fidelity
 * - No fixed px values, only Tailwind utilities
 */

export default function Loading() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e0e7ef]">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "w-full max-w-md mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-lg flex flex-col items-center gap-6 py-12 px-6"
        )}
        aria-label="Loading"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 1.2,
            ease: "linear",
          }}
          className="flex items-center justify-center"
        >
          <Loader2 className="w-12 h-12 text-primary animate-spin" aria-hidden="true" />
        </motion.div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-xl font-cinzel font-semibold text-gray-900 tracking-wide">
            Shadi Venue
          </span>
          <span className="text-base text-gray-600 font-cormorant">
            Loading the perfect wedding experience...
          </span>
        </div>
        <div className="w-full flex flex-col items-center gap-1">
          <div className="w-full h-2 bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                repeat: Infinity,
                repeatType: "loop",
                duration: 2.2,
                ease: "easeInOut",
              }}
              className="h-2 bg-primary/80 rounded-full"
            />
          </div>
          <span className="sr-only">Loading content, please wait...</span>
        </div>
      </motion.div>
    </div>
  );
}
