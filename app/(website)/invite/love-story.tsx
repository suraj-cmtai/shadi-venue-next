'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';

export default function LoveStory() {
  const { sectionTitle, sectionSubtitle, stories } = useSelector(
    (state: RootState) => state.wedding.loveStory
  );

  return (
    <section className="relative w-full bg-white py-16 sm:py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.h3
            className="font-cormorant font-medium text-2xl sm:text-3xl lg:text-4xl text-black mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {sectionTitle}
          </motion.h3>
          <motion.h2
            className="font-cormorant font-bold text-4xl sm:text-5xl lg:text-6xl text-[#212d47]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {sectionSubtitle}
          </motion.h2>
        </div>

        {/* Grid of Love Story Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6">
          {stories.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 * index }}
            >
              {/* Text Above for first 3 */}
              {index < 3 && (
                <div className="mb-6">
                  <motion.div
                    className="font-cormorant font-medium text-xl sm:text-2xl lg:text-3xl text-[#212d47] mb-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    {milestone.date}
                  </motion.div>
                  <motion.h3
                    className="font-cormorant font-bold text-3xl sm:text-4xl lg:text-5xl text-[#212d47] mb-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    {milestone.title}
                  </motion.h3>
                  <motion.p
                    className="font-cormorant font-medium text-lg sm:text-xl lg:text-2xl text-black leading-relaxed"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    {milestone.description}
                  </motion.p>
                </div>
              )}

              {/* Image */}
              <motion.div
                className="relative h-64 sm:h-80 md:h-96 w-full bg-[#d9d9d9] border border-black overflow-hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <Image
                  src={milestone.image}
                  alt={milestone.title}
                  fill
                  className="object-cover"
                />
              </motion.div>

              {/* Text Below for last 3 */}
              {index >= 3 && (
                <div className="mt-6">
                  <motion.div
                    className="font-cormorant font-medium text-xl sm:text-2xl lg:text-3xl text-[#212d47] mb-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    {milestone.date}
                  </motion.div>
                  <motion.h3
                    className="font-cormorant font-bold text-3xl sm:text-4xl lg:text-5xl text-[#212d47] mb-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    {milestone.title}
                  </motion.h3>
                  <motion.p
                    className="font-cormorant font-medium text-lg sm:text-xl lg:text-2xl text-black leading-relaxed"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    {milestone.description}
                  </motion.p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
