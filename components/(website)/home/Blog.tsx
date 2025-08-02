"use client";

import { motion } from "framer-motion";
import BookAnAppointmentButton from "@/components/ui/BookAnAppointmentButton";
import GradientButton from "@/components/GradientButton";

// Figma MCP asset URLs
const IMAGES_IMG = "/images/blog-image-1.png";
const IMAGES1_IMG = "/images/blog-image-2.png";
const IMAGES2_IMG = "/images/blog-image-3.png";

const VECTOR3_IMG = "/images/blog-decorative-vector-left.svg";
const VECTOR4_IMG = "/images/blog-decorative-vector-right.svg";
const VECTOR07_IMG = "/images/blog-flower-shadow-vector-top-left.svg";
const VECTOR_IMG = "/images/blog-arrow.svg"; // Ensure this is defined for arrow icons
const VECTOR1_IMG = "/images/blog-arrow-1.svg";
const VECTOR2_IMG = "/images/blog-arrow-2.svg";

const BLOG_POSTS = [
  {
    id: 1,
    image: IMAGES2_IMG,
    title: "Wedding Fashion & Style",
    buttonStyle: "outline"
  },
  {
    id: 2,
    image: IMAGES1_IMG,
    title: "2025 Wedding Trends",
    buttonStyle: "filled"
  },
  {
    id: 3,
    image: IMAGES_IMG,
    title: "Local Vendor & Venue Guides",
    buttonStyle: "outline"
  }
];

export default function Blog() {
  return (
    <div className="relative w-full bg-white">
      {/* Decorative Top Left Flower */}
      <div className="hidden lg:block absolute left-0 top-0 z-0 w-[220px] xl:w-[338px]">
        <img
          alt="Decorative element"
          className="block max-w-none w-full h-auto"
          src={VECTOR07_IMG}
        />
      </div>

      {/* Section Container */}
      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 z-10">
        {/* Blog Label and Decorative Vectors */}
        <div className="w-full flex flex-col items-center mb-6 relative">
          <div className="flex items-center gap-2 mb-2">
            {/* Decorative left vector */}
            <span className="hidden md:inline-block">
              <img src={VECTOR3_IMG} alt="Decorative" className="w-8 h-2" />
            </span>
            <span className="uppercase tracking-[0.15em] text-lg md:text-xl font-cormorant text-black font-medium">
              Find Inspiration
            </span>
            {/* Decorative right vector */}
            <span className="hidden md:inline-block">
              <img src={VECTOR4_IMG} alt="Decorative" className="w-8 h-2" />
            </span>
          </div>
        </div>

        {/* Main Heading */}
        <motion.h2
          className="font-dancing-script font-normal text-3xl md:text-5xl lg:text-6xl text-[#212d47] text-center mb-12 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Check Out These Fresh New Ideas
        </motion.h2>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post, index) => (
            <motion.div
              key={post.id}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            >
              {/* Card */}
              <div className="relative h-80 md:h-[400px] rounded-xs overflow-hidden shadow-lg">
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-center bg-cover bg-no-repeat transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundImage: `url('${post.image}')` }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/5 bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300" />
                {/* Border */}
                <div className="absolute inset-4 border-2 border-white rounded-xs pointer-events-none" />
                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
                  {/* Title */}
                  <h3 className="font-cormorant font-bold text-center text-xl md:text-xl text-white uppercase mb-4 drop-shadow">
                    {post.title}
                  </h3>
                  {/* CTA Button and Arrow */}
                 <GradientButton>Get Inspired</GradientButton> 
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          className="text-center mt-12 flex justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <GradientButton>
            View All Blog Posts
          </GradientButton>
        </motion.div>
      </div>
    </div>
  );
}
