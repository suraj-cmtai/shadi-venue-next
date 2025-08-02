"use client";

import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { Play, Pause } from "lucide-react";

// Figma MCP asset URLs
const VECTOR_IMG = "http://localhost:3845/assets/fe8013e8bce8077f23e153a26e579ad15936dbf8.svg";

export default function VideoSection() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoError, setIsVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoLoad = () => setIsVideoLoaded(true);
  const handleVideoError = () => setIsVideoError(true);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Responsive text and layout data
  const heading = "Lovely Moments on Joyful Days";
  const description =
    "Experience beautiful moments during your joyful days, creating memories that will be cherished forever and bring happiness to your heart.";

  return (
    <section className="w-full">
      <div className="relative w-full bg-[#595959] overflow-hidden min-h-[40vh] h-[60vh] md:h-[80vh] flex items-center justify-center">
        {/* Decorative Flower Vector (top-left, faded) */}
        <div className="absolute left-0 top-0 z-10 w-32 h-32 md:w-48 md:h-48 opacity-10 pointer-events-none select-none">
          <img
            src={VECTOR_IMG}
            alt="Decorative flower"
            className="w-full h-full object-contain"
            aria-hidden="true"
          />
        </div>
        {/* Video */}
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover ${isVideoLoaded ? "block" : "hidden"}`}
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => {
            setIsVideoLoaded(true);
            setIsPlaying(true);
          }}
          onError={handleVideoError}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        >
          <source src="/videos/video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Fallback Image */}
        {(!isVideoLoaded || isVideoError) && (
          <div
            className="absolute inset-0 w-full h-full bg-center bg-cover bg-no-repeat"
            style={{
              backgroundImage: `url('${VECTOR_IMG}')`,
              backgroundColor: "#595959",
            }}
          />
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />
        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          {/* Play/Pause Button */}
          <button
            aria-label={isPlaying ? "Pause video" : "Play video"}
            onClick={handlePlayPause}
            className="flex items-center justify-center rounded-full border-2 border-white bg-white/10 hover:bg-white/20 transition-colors duration-200 w-20 h-20 md:w-24 md:h-24 mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            type="button"
          >
            {isPlaying ? (
              <Pause className="w-12 h-12 md:w-16 md:h-16 text-white" />
            ) : (
              <Play className="w-12 h-12 md:w-16 md:h-16 text-white" />
            )}
          </button>
          <motion.h2
            className="font-cormorant font-bold text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl uppercase mb-2 md:mb-3 leading-tight text-white text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {heading}
          </motion.h2>
          <motion.p
            className="font-cormorant font-normal text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto text-white text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {description}
          </motion.p>
        </div>
        {/* Decorative Vector (center, faded, behind content) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-1/2 md:w-1/3 opacity-20 z-0">
          <img
            alt="Decorative element"
            className="w-full h-auto"
            src={VECTOR_IMG}
          />
        </div>
      </div>
    </section>
  );
}