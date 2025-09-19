"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, MessageSquareMore } from "lucide-react";
import { FaWhatsapp, FaFacebookF, FaXTwitter } from "react-icons/fa6";

const NAVY = "#212d47";

const circleButtonClass =
  "w-12 h-12 rounded-full flex items-center justify-center shadow-lg border border-white/70 bg-[#212d47] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40";

const FloatingButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 200);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, []);

  const encodedUrl = useMemo(() => encodeURIComponent(shareUrl || ""), [shareUrl]);
  const encodedText = useMemo(
    () => encodeURIComponent("Check this out from Shadi Venue ✨"),
    []
  );

  const whatsappHref = useMemo(
    () => `https://wa.me/?phone=9810703693`,
    [encodedText, encodedUrl]
  );
  const facebookHref = useMemo(
    () => `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    [encodedUrl]
  );
  const twitterHref = useMemo(
    () => `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    [encodedUrl, encodedText]
  );

  const scrollToTop = () => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (_) {
      window.scrollTo(0, 0);
    }
  };

  return (
    <div
      className="fixed right-4 bottom-4 md:right-6 md:bottom-6 z-50"
      aria-label="Quick actions"
    >
      {/* Socials stack */}
      <div className="flex flex-col items-end gap-3 mb-3 select-none">
        <AnimatePresence initial={false}>
          {isChatOpen && (
            <motion.div
              key="socials"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col items-end gap-2"
            >
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on WhatsApp"
                className={circleButtonClass}
                style={{ backgroundColor: NAVY }}
              >
                <FaWhatsapp className="text-xl" />
              </a>
              <a
                href={facebookHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on Facebook"
                className={circleButtonClass}
                style={{ backgroundColor: NAVY }}
              >
                <FaFacebookF className="text-lg" />
              </a>
              <a
                href={twitterHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on X"
                className={circleButtonClass}
                style={{ backgroundColor: NAVY }}
              >
                <FaXTwitter className="text-lg" />
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main buttons column */}
      <div className="flex flex-col items-end gap-3">
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              key="scrolltop"
              type="button"
              aria-label="Scroll to top"
              onClick={scrollToTop}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.18 }}
              className={circleButtonClass}
              style={{ backgroundColor: NAVY }}
            >
              <ChevronUp className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

        <button
          type="button"
          aria-label={isChatOpen ? "Close share menu" : "Open share menu"}
          onClick={() => setIsChatOpen((v) => !v)}
          className={circleButtonClass}
          style={{ backgroundColor: NAVY }}
        >
          <MessageSquareMore className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default FloatingButton;
