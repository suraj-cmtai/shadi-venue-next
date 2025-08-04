import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error && "message" in error) {
    return (error as { message?: string }).message || "Unknown error";
  }
  return String(error);
}