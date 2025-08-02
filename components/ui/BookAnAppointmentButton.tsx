"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Figma MCP asset
const VECTOR_ICON = "/images/drop-left-arrow.svg";

interface BookAnAppointmentButtonProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * BookAnAppointmentButton - Modern, accessible, animated button with right icon
 * @param children - Button text
 */
export default function BookAnAppointmentButton({ children, className }: BookAnAppointmentButtonProps) {
  return (
    <Button
      className={cn(
        "relative flex items-center gap-2 bg-[#212d47] hover:bg-[#1a2236] text-white font-cormorant font-bold uppercase rounded-xs h-12 min-w-[12rem] px-6 text-base md:text-lg transition-all duration-200",
        className
      )}
    >
      <span className="flex-1 text-left">{children}</span>
      <motion.img
        src={VECTOR_ICON}
        alt="Arrow Icon"
        className="h-4 w-4 rotate-90"
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      />
    </Button>
  );
} 