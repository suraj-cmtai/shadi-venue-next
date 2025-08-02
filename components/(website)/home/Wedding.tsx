"use client";

import { motion } from "framer-motion";
import GradientButton from "@/components/GradientButton";

// Figma MCP asset URLs
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
    buttonStyle: "outline",
  },
  {
    id: 2,
    image: THEME2_IMG,
    title: "Grand & Luxurious",
    description: "Opulent indoor setting with golden accents",
    buttonStyle: "filled",
  },
  {
    id: 3,
    image: THEME3_IMG,
    title: "Intimate & Minimalist",
    description: "Elegant outdoor evening reception",
    buttonStyle: "outline",
  },
  {
    id: 4,
    image: THEME4_IMG,
    title: "International",
    description: "Fantastical indoor space with aurora lighting",
    buttonStyle: "filled",
  },
  {
    id: 5,
    image: THEME5_IMG,
    title: "Modern & Stylish",
    description: "Contemporary design with sleek aesthetics",
    buttonStyle: "outline",
  },
  {
    id: 6,
    image: THEME6_IMG,
    title: "Pocket Friendly Stunners",
    description: "Beautiful weddings on a budget",
    buttonStyle: "filled",
  },
];

export default function Wedding() {
  const textColor = "text-[#212d47]";
  return (
    <section className="relative w-full bg-white overflow-hidden">
      {/* Decorative Flower (top left, hidden on mobile) */}
      <img
        src={VECTOR1_IMG}
        alt="Decorative element"
        className="hidden lg:block absolute left-0 top-0 z-10 w-32 h-32 md:w-48 md:h-48 pointer-events-none select-none"
        aria-hidden="true"
      />

      {/* Content Container */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 relative">
        {/* Heading Section */}
        <div className="flex flex-col items-center mb-8 md:mb-14">
          <motion.p
            className={`font-cormorant font-medium text-xs md:text-sm ${textColor} text-center uppercase tracking-[0.2em] mb-2`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            wedding theme
          </motion.p>
          <motion.h2
            className={`font-cormorant font-bold text-2xl sm:text-3xl md:text-5xl lg:text-6xl ${textColor} text-center leading-tight`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            From <span className={textColor}>'Yes'</span> To <span className={textColor}>'I Do'</span> - we're with you
          </motion.h2>
        </div>

        {/* Desktop/Tablet: Horizontal Scrollable Cards */}
        <div className="hidden lg:block relative">
          <div className="w-full">
            <div
              className="flex gap-8 items-end h-[80vh] overflow-x-auto scrollbar-hide pb-2"
              style={{
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {WEDDING_THEMES.map((theme, index) => (
                <motion.div
                  key={theme.id}
                  className="relative shrink-0 w-72 xl:w-80 h-full rounded-xs overflow-hidden group flex flex-col justify-end"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {/* Card Image */}
                  <div
                    className="absolute inset-0 bg-center bg-cover bg-no-repeat h-full w-full transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundImage: `url('${theme.image}')` }}
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-300" />
                  {/* Border */}
                  <div className="absolute inset-2 border-2 border-white rounded-xs pointer-events-none" />
                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center justify-end px-6 pb-10 w-full">
                    <span className="font-cinzel font-bold text-lg xl:text-xl text-white text-center uppercase drop-shadow-md">
                      {theme.title}
                    </span>
                    <span className="font-cormorant font-medium text-xs xl:text-sm text-white/80 text-center mt-2 drop-shadow-sm">
                      {theme.description}
                    </span>
                    <div className="mt-6 w-full flex justify-center">
                      <GradientButton>
                        Explore Theme
                      </GradientButton>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Hide scrollbar cross-browser */}
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
          {/* CTA Button */}
          <div className="flex justify-center mt-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <GradientButton>
                EXPLORE MORE
              </GradientButton>
            </motion.div>
          </div>
        </div>

        {/* Mobile/Tablet: Grid Cards */}
        <div className="block lg:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {WEDDING_THEMES.map((theme, index) => (
              <motion.div
                key={theme.id}
                className="relative h-[80vh] rounded-xs overflow-hidden flex flex-col justify-end"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                {/* Card Image */}
                <div
                  className="absolute inset-0 bg-center bg-cover bg-no-repeat h-full w-full transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundImage: `url('${theme.image}')` }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-300" />
                {/* Border */}
                <div className="absolute inset-2 border-2 border-white rounded-xs pointer-events-none" />
                {/* Content */}
                <div className="relative z-10 flex flex-col items-start justify-end px-4 pb-6 w-full">
                  <span className="font-cinzel font-bold text-base md:text-lg text-white uppercase drop-shadow-md">
                    {theme.title}
                  </span>
                  <span className="font-cormorant font-medium text-xs md:text-sm text-white/80 mt-1 drop-shadow-sm">
                    {theme.description}
                  </span>
                  <div className="mt-4 w-full flex justify-start">
                    <GradientButton>
                      Explore Theme
                    </GradientButton>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {/* CTA Button */}
          <div className="text-center mt-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <GradientButton>
                EXPLORE MORE
              </GradientButton>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
