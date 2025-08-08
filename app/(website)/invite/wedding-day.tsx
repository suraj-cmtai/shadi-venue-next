'use client';

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";

const VECTOR_LEFT = "/images/wedding-flower-top-left-vector.svg";

export default function WeddingDay() {
  const { backgroundColor, headingTop, headingMain, date, images } = useSelector(
    (state: RootState) => state.wedding.weddingDay
  );

  const [timeLeft, setTimeLeft] = useState({  days: 0,  hours: 0,  minutes: 0,  seconds: 0, });

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const targetDate = new Date(date);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [date]);

  return (
    <section className="relative w-full overflow-hidden bg-white">
      {/* Dynamic Background Top Color */}
      <div className="absolute top-0 left-0 w-full h-[40%] z-0" style={{ backgroundColor }} />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        {/* Vectors */}
        <motion.div
          className="absolute left-[3.33%] top-0 w-[18%] h-auto opacity-60 hidden md:block"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Image src={VECTOR_LEFT} alt="" width={200} height={200} />
        </motion.div>

        {/* Countdown and Image */}
        <div className="hidden md:flex flex-col md:flex-row gap-10 items-stretch relative">
          <div className="flex-1 flex flex-col justify-center">
            <motion.h3
              className="font-cormorant text-xl text-white mb-4 text-center md:text-left ml-52 -mt-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {headingTop}
            </motion.h3>
            <motion.h2
              className="font-dancing-script text-5xl md:text-5xl text-[#fff] mb-20 text-center md:text-left ml-24"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {headingMain}
            </motion.h2>

            <motion.div
              className="flex justify-center md:justify-start items-center gap-4 sm:gap-6 -mt-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {[
                ["Days", timeLeft.days],
                ["Minutes", timeLeft.minutes],
                ["Seconds", timeLeft.seconds],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="bg-white rounded-[10px] shadow-md p-4 sm:p-6 text-center w-[120px] sm:w-[140px] md:w-[160px] h-28 sm:h-32 md:h-36 flex flex-col justify-center -translate-y-10"
                >
                  <div className="font-outfit font-semibold text-3xl sm:text-4xl text-[#212d47] mb-2">
                    {value.toString().padStart(2, "0")}
                  </div>
                  <div className="font-cinzel font-black text-sm sm:text-base text-[#3f3f3f] uppercase">
                    {label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Image Section */}
          <motion.div
            className="flex-1 h-[260px] flex justify-end gap-6 relative z-10 overflow-visible mt-28 -mr-28"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div className="relative w-full h-full overflow-hidden border-4 border-white shadow-lg -translate-y-10">
              <Image
                src={images[selectedIndex]}
                alt={`Wedding ${selectedIndex + 1}`}
                fill
                className="object-cover"
              />
            </div>
            {images[selectedIndex + 1] && (
              <div className="relative w-[20%] h-full overflow-hidden border-4 border-white shadow-md -translate-y-10">
                <Image
                  src={images[selectedIndex + 1]}
                  alt={`Next Wedding ${selectedIndex + 2}`}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </motion.div>
        </div>

        {/* Dots Navigation */}
        <motion.div
          className="flex justify-end items-end gap-2 mt-4 mr-2 md:mr-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === selectedIndex ? "bg-[#212d47]" : "bg-gray-300"
                }`}
            ></button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
