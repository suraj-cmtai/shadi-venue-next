"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import Link from "next/link";
import GradientButton from "@/components/GradientButton";
import {
  fetchPublishedBlogs,
  selectPublishedBlogs,
  selectBlogLoading,
  selectBlogError,
} from "@/lib/redux/features/blogSlice";
import type { AppDispatch } from "@/lib/redux/store";

// Figma MCP asset URLs
const VECTOR3_IMG = "/images/blog-decorative-vector-left.svg";
const VECTOR4_IMG = "/images/blog-decorative-vector-right.svg";
const VECTOR07_IMG = "/images/blog-flower-shadow-vector-top-left.svg";

/**
 * Blog section with horizontally scrollable cards.
 * Uses Framer Motion for animation and shadcn GradientButton for CTAs.
 * Fully responsive and accessible.
 */
export default function Blog() {
  const dispatch = useDispatch<AppDispatch>();
  const blogs = useSelector(selectPublishedBlogs);
  const isLoading = useSelector(selectBlogLoading);
  const error = useSelector(selectBlogError);

  useEffect(() => {
    dispatch(fetchPublishedBlogs());
  }, [dispatch]);

  // Only show first 4 published blogs
  const displayedBlogs = blogs?.slice(0, 4) || [];

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
              Blogs
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
          Start Planning with Inspiration & Insights
        </motion.h2>

        {/* Blog Posts Horizontal Scroll */}
        <div className="w-full">
          <div
            className="flex gap-6 md:gap-8 overflow-x-auto scrollbar-hide pb-4"
            tabIndex={0}
            aria-label="Blog posts horizontal scroll"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {isLoading ? (
              <div className="flex justify-center items-center min-h-32 w-full">
                <span className="text-neutral-500 font-cormorant text-lg">Loading blogs...</span>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center min-h-32 w-full">
                <span className="text-red-500 font-cormorant text-lg">{error}</span>
              </div>
            ) : displayedBlogs.length === 0 ? (
              <div className="flex justify-center items-center min-h-32 w-full">
                <span className="text-neutral-400 font-cormorant text-lg">No blog posts found.</span>
              </div>
            ) : (
              displayedBlogs.map((post, index) => (
                <motion.div
                  key={post.id}
                  className="relative group flex-shrink-0 w-72 sm:w-80 md:w-96 h-80 md:h-[400px]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                >
                  {/* Card */}
                  <div className="relative w-full h-full rounded-xs overflow-hidden shadow-lg">
                    {/* Background Image */}
                    <div
                      className="absolute inset-0 bg-center bg-cover bg-no-repeat transition-transform duration-300 group-hover:scale-105"
                      style={{
                        backgroundImage: post.image
                          ? `url('${post.image}')`
                          : "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                      }}
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
                      {/* CTA Button */}
                      <Link href={`/blogs/${post.slug}`} tabIndex={-1} aria-label={`Read blog: ${post.title}`}>
                        <GradientButton>
                          Get Inspired
                        </GradientButton>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
          {/* Hide scrollbar for horizontal scroll */}
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

        {/* View All Button */}
        <motion.div
          className="text-center mt-12 flex justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Link href="/blogs" aria-label="View all blog posts">
            <GradientButton>
              View All Blog Posts
            </GradientButton>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
