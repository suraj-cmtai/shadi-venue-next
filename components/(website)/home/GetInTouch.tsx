"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const IMAGES_IMG = "/images/getintouch-image-1.png";
const VECTOR_IMG = "/images/getintouch-flower-left-side-vector-1.svg";

export default function GetInTouch() {
  return (
    <section className="w-full flex justify-center items-center py-16 md:py-24 bg-white relative">
      {/* Decorative Vector (right side, desktop only) */}
      <motion.img
        src={VECTOR_IMG}
        alt=""
        className="hidden lg:block pointer-events-none select-none absolute right-0 top-0 h-full max-h-[600px] z-10"
        style={{ opacity: 0.12 }}
        aria-hidden="true"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 0.12, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />

      <div className="container mx-auto flex flex-col lg:flex-row items-stretch justify-center gap-8 lg:gap-16 relative z-10 px-4">
        {/* Left: Image */}
        <motion.div
          className="w-full lg:w-[480px] xl:w-[520px] flex-shrink-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="aspect-[16/13] w-full rounded-xs overflow-hidden shadow-sm border border-neutral-100 bg-neutral-100">
            <motion.img
              src={IMAGES_IMG}
              alt="Wedding couple"
              className="object-cover w-full h-full"
              draggable={false}
              initial={false}
              animate={false}
            />
          </div>
        </motion.div>

        {/* Right: Form Card */}
        <motion.div
          className="w-full max-w-xl bg-neutral-50 relative rounded-xs lg:rounded-xs shadow-none px-6 py-8 lg:py-10 flex flex-col justify-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* White border */}
          <motion.div
            className="pointer-events-none absolute inset-0 border-4 border-white z-10"
            style={{ borderRadius: 0 }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            aria-hidden="true"
          />

          {/* Form Content */}
          <div className="relative z-20">
            {/* Header */}
            <motion.p
              className="font-dancing-script text-[18px] md:text-[20px] text-black mb-1"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Contact Us
            </motion.p>
            <motion.h2
              className="font-cormorant text-[26px] md:text-[32px] lg:text-[36px] text-[#212d47] mb-8 font-normal"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              Get In Touch
            </motion.h2>

            {/* Form */}
            <motion.form
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              {/* Name & Email Row */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block font-cormorant text-[17px] text-[#7d7d7d] mb-1">
                    Name
                  </label>
                  <Input
                    className="border-0 border-b border-[#d9d9d9] rounded-xs px-0 py-2 text-[16px] font-cormorant bg-transparent focus:border-[#212d47] focus:ring-0"
                    placeholder=""
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-cormorant text-[17px] text-[#7d7d7d] mb-1">
                    E-mail
                  </label>
                  <Input
                    type="email"
                    className="border-0 border-b border-[#d9d9d9] rounded-xs px-0 py-2 text-[16px] font-cormorant bg-transparent focus:border-[#212d47] focus:ring-0"
                    placeholder=""
                  />
                </div>
              </div>

              {/* Wedding Date */}
              <div>
                <label className="block font-cormorant text-[17px] text-[#7d7d7d] mb-1">
                  Wedding Date
                </label>
                <Input
                  type="text"
                  className="border-0 border-b border-[#d9d9d9] rounded-xs px-0 py-2 text-[16px] font-cormorant bg-transparent focus:border-[#212d47] focus:ring-0"
                  placeholder=""
                />
              </div>

              {/* Your Messages */}
              <div>
                <label className="block font-cormorant text-[17px] text-[#7d7d7d] mb-1">
                  Your Messages
                </label>
                <Textarea
                  className="border-0 border-b border-[#d9d9d9] rounded-xs px-0 py-2 text-[16px] font-cormorant bg-transparent focus:border-[#212d47] focus:ring-0 min-h-[60px] resize-none"
                  placeholder=""
                />
              </div>

              {/* Submit Button */}
              <motion.div
                className="pt-2"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Button
                  type="submit"
                  className="bg-[#212d47] text-white px-7 py-2.5 font-cormorant font-bold text-[15px] uppercase tracking-wider rounded-xs shadow-none hover:bg-[#1a2338] transition-colors duration-200"
                >
                  Submit
                </Button>
              </motion.div>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
