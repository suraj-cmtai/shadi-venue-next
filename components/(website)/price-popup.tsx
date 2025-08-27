"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type PricePopupProps = {
  trigger?: React.ReactNode;
  heading?: string;
  subheading?: string;
  open?: boolean;
  onClose?: () => void;
};

export default function PricePopup({
  trigger,
  heading = "Get Exclusive Price Offer",
  subheading = "Register today to unlock special pricing and personal assistance",
  open: openProp,
  onClose,
}: PricePopupProps) {
  const isControlled = openProp !== undefined;
  const [openUncontrolled, setOpenUncontrolled] = useState(false);
  const open = isControlled ? !!openProp : openUncontrolled;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Simulate async and log data
      console.log("PricePopup submission:", { name, phone });
      await new Promise((r) => setTimeout(r, 800));
      setOpenUncontrolled(false);
      setName("");
      setPhone("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isControlled) {
          if (!next && onClose) onClose();
        } else {
          setOpenUncontrolled(next);
        }
      }}
    >
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button className="bg-[#212d47] text-black">
              Get Exclusive Price
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md bg-white border border-[#212d47]/10 shadow-2xl p-0 overflow-hidden rounded-2xl">
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-[#212d47] to-[#3a4a76] p-6 md:p-7 text-black">
          <div className="inline-flex items-center gap-2 text-[10px] md:text-xs px-3 py-1 rounded-full bg-white/80 text-[#212d47] shadow-sm ring-1 ring-black/5">
            <span className="text-xs">👑</span>
            <span className="tracking-wide font-medium">Limited time offer</span>
          </div>
          <h3 className="mt-3 text-2xl md:text-3xl font-serif leading-snug">{heading}</h3>
          <div className="mt-1 h-1 w-12 rounded-full bg-white/60" aria-hidden="true" />
          <p className="mt-1.5 text-xs md:text-sm text-black/80 max-w-md">{subheading}</p>
        </div>

        {/* Form */}
        <div className="p-6 md:p-7">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#212d47]">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                required
                className="bg-white rounded-lg border-gray-200 focus-visible:ring-[#212d47]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#212d47]">Phone</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                type="tel"
                pattern="^\\+?[0-9\\s-]{7,15}$"
                required
                className="bg-white rounded-lg border-gray-200 focus-visible:ring-[#212d47]"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#212d47] text-white rounded-full h-11 shadow-md hover:shadow-lg transition"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Register Now"
              )}
            </Button>
            <p className="text-xs text-gray-500 text-center">No spam. We’ll contact you with your personalized offer.</p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}


