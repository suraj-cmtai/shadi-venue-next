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
          Check Out These Fresh New Ideas
        </motion.h2>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center min-h-32">
              <span className="text-neutral-500 font-cormorant text-lg">Loading blogs...</span>
            </div>
          ) : error ? (
            <div className="col-span-full flex justify-center items-center min-h-32">
              <span className="text-red-500 font-cormorant text-lg">{error}</span>
            </div>
          ) : displayedBlogs.length === 0 ? (
            <div className="col-span-full flex justify-center items-center min-h-32">
              <span className="text-neutral-400 font-cormorant text-lg">No blog posts found.</span>
            </div>
          ) : (
            <div
              className="flex flex-nowrap gap-6 overflow-x-auto overflow-y-hidden scrollbar-hide pb-2 w-full"
              aria-label="Blog posts horizontal scroll"
              tabIndex={0}
              role="region"
            >
              {displayedBlogs.map((post, index) => (
                <motion.div
                  key={post.id}
                  className="relative group shrink-0 w-72 sm:w-80 md:w-96 h-80 md:h-[400px]"
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
                      <Link href={`/blogs/${post.slug}`} tabIndex={-1} aria-label={`Read blog: ${post.title}`} className="flex w-full justify-center items-center">
                        <GradientButton>
                          Get Inspired
                        </GradientButton>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
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
          )}
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
