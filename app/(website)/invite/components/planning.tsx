"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

interface PlanningEvent {
  id: number;
  type: string;
  date: string;
  venue: string;
  time: string;
  phone: string;
  icon: string;
}

interface PlanningProps {
  title: string;
  subtitle: string;
  events: PlanningEvent[];
  mapIframeUrl: string;
  theme: {
    titleColor: string;
    nameColor: string;
    buttonColor: string;
    buttonHoverColor: string;
  };
}

const colorShadow = "#212d47";

export default function Planning({ title, subtitle, events, mapIframeUrl, theme }: PlanningProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section className="relative w-full bg-white py-16 sm:py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Left: Dynamic Map */}
          <motion.div
            className="w-full lg:w-1/2"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] w-full rounded-[20px] overflow-hidden">
              <iframe
                src={mapIframeUrl}
                width="100%"
                height="100%"
                className="border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </motion.div>

          {/* Right: Header + Events */}
          <div className="w-full lg:w-1/2 flex flex-col space-y-8 items-center lg:items-start text-center lg:text-left">
            <div>
              <motion.h3
                className="font-cormorant text-2xl sm:text-3xl lg:text-4xl text-black mb-2 uppercase"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {title}
              </motion.h3>
              <motion.h2
                className="font-cormorant font-bold text-4xl sm:text-5xl lg:text-6xl text-[#212d47]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                {subtitle}
              </motion.h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full justify-items-center lg:justify-items-start">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  className="flex flex-col gap-2.5 items-center lg:items-start text-center lg:text-left"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 + index * 0.2 }}
                >
                  <div
                    className="h-14 w-14 relative rounded-full overflow-hidden transition-shadow duration-300"
                    onMouseEnter={() => setHoveredId(event.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      backgroundColor: colorShadow,
                      boxShadow:
                        hoveredId === event.id ? `0 4px 10px ${colorShadow}` : "none",
                    }}
                  >
                    {event.icon ? (
                      <Image
                        src={event.icon}
                        alt={event.type}
                        fill
                        className="object-contain bg-white"
                      />
                    ) : (
                      <div className="w-full h-full bg-white flex items-center justify-center">
                        <span className="text-[#212d47] text-sm font-cormorant">
                          {event.type.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-cormorant font-bold text-lg sm:text-xl text-[#212d47]">
                    {event.type}
                  </h3>
                  <p className="font-cormorant font-medium text-sm text-black">{event.date}</p>
                  <p className="font-cormorant font-semibold text-sm text-[#212d47] leading-relaxed">
                    {event.venue}
                  </p>
                  <p className="font-cormorant font-semibold text-sm text-[#212d47]">
                    {event.time}
                  </p>
                  <p className="font-cormorant font-medium text-sm text-black">{event.phone}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
