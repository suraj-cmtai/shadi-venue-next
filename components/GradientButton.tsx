"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import * as React from "react";

// Figma MCP asset
const VECTOR_ICON = "/images/drop-left-arrow.svg";

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

/**
 * GradientButton - Modern, accessible, animated button with right icon.
 * - White border around the button
 * - Max width is always small (max-w-xs) on all devices
 * - Text is always visible, even on mobile
 * - Minimal gap between text and arrow, like a regular button
 * - Equal padding around text and icon
 */
export default function GradientButton({
  children,
  className,
  ...props
}: GradientButtonProps) {
  return (
    <Button
      className={cn(
        // Layout and color
        "inline-flex items-center justify-center bg-[#212d47] hover:bg-[#1a2236] text-white font-cormorant font-bold uppercase rounded-xs transition-all duration-200",
        // White border
        "border border-white",
        // Height: always consistent
        "h-10",
        // Max width is always small, never overflows
        "max-w-xs",
        // Equal padding all around (y and x)
        "py-2 px-2 text-base",
        // Word break and text wrapping utilities for long text
        "break-words whitespace-normal overflow-hidden text-ellipsis",
        "leading-none",
        "cursor-pointer",
        className
      )}
      {...props}
    >
      <span className="flex items-center gap-1 w-full justify-center">
        <span className="break-words whitespace-normal overflow-hidden text-ellipsis">
          {children}
        </span>
        <motion.img
          src={VECTOR_ICON}
          alt="Arrow Icon"
          className="h-3 w-3 flex-shrink-0"
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        />
      </span>
    </Button>
  );
}