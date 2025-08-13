"use client";

import { motion } from "framer-motion";
import GradientButton from "@/components/GradientButton";

// Images
const THEME1_IMG = "/images/wedding-image-1.png";
const THEME2_IMG = "/images/wedding-image-2.png";
const THEME3_IMG = "/images/wedding-image-3.png";
const THEME4_IMG = "/images/wedding-image-4.png";
const THEME5_IMG = "/images/wedding-image-5.png";
const THEME6_IMG = "/images/wedding-image-6.png";
const VECTOR1_IMG = "/images/wedding-flower-top-left-vector.svg";

const WEDDING_THEMES = [
  {
    id: 1,
    image: THEME1_IMG,
    title: "Destination",
    description: "Scenic outdoor wedding with mountain backdrop",
  },
  {
    id: 2,
    image: THEME2_IMG,
    title: "Grand & Luxurious",
    description: "Opulent indoor setting with golden accents",
  },
  {
    id: 3,
    image: THEME3_IMG,
    title: "Intimate & Minimalist",
    description: "Elegant outdoor evening reception",
  },
  {
    id: 4,
    image: THEME4_IMG,
    title: "International",
    description: "Fantastical indoor space with aurora lighting",
  },
  {
    id: 5,
    image: THEME5_IMG,
    title: "Modern & Stylish",
    description: "Contemporary design with sleek aesthetics",
  },
  {
    id: 6,
    image: THEME6_IMG,
    title: "Pocket Friendly Stunners",
    description: "Beautiful weddings on a budget",
  },
];

export default function Wedding() {
  const textColor = "text-[#212d47]";

  return (
    <section className="relative w-full bg-white overflow-hidden">
      {/* Decorative Flower */}
      <img
        src={VECTOR1_IMG}
        alt="Decorative element"
        className="hidden xl:block absolute left-0 top-0 z-10 w-24 h-24 lg:w-32 lg:h-32 xl:w-48 xl:h-48 pointer-events-none select-none opacity-80"
        aria-hidden="true"
      />

      {/* Container */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 relative">

        {/* Heading */}
        <div className="flex flex-col items-center mb-6 sm:mb-8 md:mb-10 lg:mb-14">
          <motion.p
            className={`font-cormorant font-medium text-[10px] xs:text-xs sm:text-sm ${textColor} text-center uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-1 sm:mb-2`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            wedding theme
          </motion.p>
          <motion.h2
            className={`font-cormorant font-bold text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl ${textColor} text-center leading-tight px-2 sm:px-4`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            From <span className={textColor}>&apos;Yes&apos;</span> To <span className={textColor}>&apos;I Do&apos;</span> - we&apos;re with you
          </motion.h2>
        </div>

        {/* Desktop & Tablet Large: Horizontal Scroll */}
        <div className="hidden lg:block relative">
          <div className="w-full">
            <div
              className="flex flex-nowrap gap-4 lg:gap-6 xl:gap-8 items-end h-[70vh] lg:h-[75vh] xl:h-[80vh] overflow-x-auto overflow-y-hidden scrollbar-hide pb-2"
            >
              {WEDDING_THEMES.map((theme, index) => (
                <motion.div
                  key={theme.id}
                  className="relative shrink-0 w-64 lg:w-72 xl:w-80 2xl:w-96 h-full rounded-xs overflow-hidden group flex flex-col justify-end cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  {/* Image */}
                  <div
                    className="absolute inset-0 bg-center bg-cover bg-no-repeat h-full w-full transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url('${theme.image}')` }}
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 group-hover:via-black/30 transition-all duration-300" />
                  {/* Border */}
                  <div className="absolute inset-2 border-2 border-white/80 group-hover:border-white rounded-xs pointer-events-none transition-colors duration-300" />
                  {/* Text */}
                  <div className="relative z-10 flex flex-col items-center justify-end px-4 lg:px-6 pb-6 lg:pb-8 xl:pb-10 w-full">
                    <span className="font-cinzel font-bold text-base lg:text-lg xl:text-xl 2xl:text-2xl text-white text-center uppercase drop-shadow-lg">
                      {theme.title}
                    </span>
                    <span className="font-cormorant font-medium text-xs lg:text-sm xl:text-base text-white/90 text-center mt-1 lg:mt-2 drop-shadow-sm max-w-[90%]">
                      {theme.description}
                    </span>
                    <div className="mt-4 lg:mt-6 w-full flex justify-center">
                      <GradientButton>Explore Theme</GradientButton>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Hide scrollbar */}
            <style jsx>{`
              .scrollbar-hide {
                scrollbar-width: none;
                -ms-overflow-style: none;
              }
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>
          </div>

          {/* CTA */}
          <div className="flex justify-center mt-8 lg:mt-12 xl:mt-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <GradientButton>EXPLORE MORE</GradientButton>
            </motion.div>
          </div>
        </div>

        {/* Mobile & Tablet Small: Grid Layout */}
        <div className="block lg:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {WEDDING_THEMES.map((theme, index) => (
              <motion.div
                key={theme.id}
                className="relative aspect-[3/4] rounded-xs overflow-hidden flex flex-col justify-end group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Image */}
                <div
                  className="absolute inset-0 bg-center bg-cover bg-no-repeat h-full w-full transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url('${theme.image}')` }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 group-hover:via-black/30 transition-all duration-300" />
                {/* Border */}
                <div className="absolute inset-2 border-2 border-white/80 group-hover:border-white rounded-xs pointer-events-none transition-colors duration-300" />
                {/* Text */}
                <div className="relative z-10 flex flex-col items-start justify-end px-3 sm:px-4 pb-4 sm:pb-6 w-full">
                  <span className="font-cinzel font-bold text-sm xs:text-base sm:text-lg md:text-xl text-white uppercase drop-shadow-lg">
                    {theme.title}
                  </span>
                  <span className="font-cormorant font-medium text-xs xs:text-sm md:text-base text-white/90 mt-1 drop-shadow-sm">
                    {theme.description}
                  </span>
                  <div className="mt-3 sm:mt-4 w-full flex justify-start">
                    <GradientButton>Explore Theme</GradientButton>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-6 sm:mt-8 md:mt-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <GradientButton>EXPLORE MORE</GradientButton>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
