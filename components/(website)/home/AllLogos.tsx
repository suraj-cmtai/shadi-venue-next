"use client";

/**
 * AllLogos - Responsive logo grid for wedding florist branding
 * - Fully responsive: 4 columns on desktop, 2 on tablet, 1 on mobile
 * - Uses Tailwind utilities for spacing, sizing, and typography
 * - No fixed pixel values; all sizing is via Tailwind classes
 * - Accessible and documented
 */

const LOGO1_FLOWER = "/images/all-logos-vector-flower-3.svg";
const LOGO2_FLOWER = "/images/all-logos-vector-flower-2.svg";
const LOGO3_FLOWER = "/images/all-logos-vector-flower-1.svg";
const LOGO4_FLOWER = "/images/all-logos-vector-flower.svg";

const LOGOS = [
  {
    id: "logo1",
    flower: LOGO1_FLOWER,
    title: "HARRIET BOUQUET",
    subtitle: "WEDDING FLORIST",
  },
  {
    id: "logo2",
    flower: LOGO2_FLOWER,
    title: "HARRIET BOUQUET",
    subtitle: "WEDDING FLORIST",
  },
  {
    id: "logo3",
    flower: LOGO3_FLOWER,
    title: "HARRIET BOUQUET",
    subtitle: "WEDDING & EVENT FLORIST",
  },
  {
    id: "logo4",
    flower: LOGO4_FLOWER,
    title: "HARRIET BOUQUET",
    subtitle: "WEDDING FLORAL DESIGN",
  },
];

/**
 * AllLogos component displays a responsive grid of logo variations.
 * - 4 columns on large screens, 2 on medium, 1 on small
 * - Uses Tailwind for all sizing and spacing
 * - Accessible: all images have alt text
 */
export default function AllLogos() {
  return (
    <section className="w-full py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="
            grid 
            grid-cols-1 
            sm:grid-cols-2 
            lg:grid-cols-4 
            gap-8
          "
        >
          {LOGOS.map((logo) => (
            <div
              key={logo.id}
              className="flex flex-col items-center justify-start"
            >
              {/* Flower/leaf vector */}
              <div className="w-full flex items-center justify-center mb-6">
                <img
                  src={logo.flower}
                  alt="Decorative floral vector"
                  className="h-12 sm:h-14 md:h-16 lg:h-20 w-auto object-contain"
                  draggable={false}
                />
              </div>

              {/* Title */}
              <h3 className="font-cinzel font-bold text-gray-900 text-base sm:text-lg md:text-xl text-center mb-2 tracking-wide leading-tight">
                {logo.title}
              </h3>

              {/* Subtitle with lines */}
              <div className="flex items-center w-full justify-center">
                <div className="h-px bg-gray-300 flex-shrink-0 min-w-8 sm:min-w-10 md:min-w-12" />
                <span className="font-cormorant text-gray-500 text-xs sm:text-sm uppercase tracking-widest px-2 sm:px-3 whitespace-nowrap">
                  {logo.subtitle}
                </span>
                <div className="h-px bg-gray-300 flex-shrink-0 min-w-8 sm:min-w-10 md:min-w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}