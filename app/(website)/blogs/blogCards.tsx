"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import GradientButton from "@/components/GradientButton";
import Link from "next/link";
import {
  fetchPublishedBlogs,
  selectPublishedBlogs,
  selectBlogLoading,
  selectBlogError,
} from "@/lib/redux/features/blogSlice";

/**
 * Blog MCP asset URLs (from Figma MCP)
 */
const VECTOR3_IMG = "/images/blog-decorative-vector-left.svg";
const VECTOR4_IMG = "/images/blog-decorative-vector-right.svg";
const VECTOR07_IMG = "/images/blog-flower-shadow-vector-top-left.svg";

/**
 * BlogCard displays a single blog card with background image, title, and CTA button.
 * Uses Framer Motion for entrance animation.
 */
function BlogCard({
  image,
  title,
  index,
  slug,
}: {
  image: string | null;
  title: string;
  index: number;
  slug: string;
}) {
  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
      aria-label={`Blog card: ${title}`}
      tabIndex={0}
    >
      <div className="relative h-80 md:h-[400px] rounded-xs overflow-hidden shadow-lg">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat transition-transform duration-300 group-hover:scale-105"
          style={{
            backgroundImage: image
              ? `url('${image}')`
              : "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/5 bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300" />
        {/* Border */}
        <div className="absolute inset-4 border-2 border-white rounded-xs pointer-events-none" />
        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
          <h3 className="font-cormorant font-bold text-center text-xl md:text-xl text-white uppercase mb-4 drop-shadow">
            {title}
          </h3>
          <Link href={`/blogs/${slug}`} tabIndex={-1} aria-label={`Read blog: ${title}`} className=" flex w-full justify-center items-center ">
            <GradientButton className="w-full">Read More</GradientButton>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * BlogSection displays a grid of blog cards with decorative vectors and a heading.
 * Responsive and accessible, matching Figma design fidelity.
 */
export default function BlogSection() {
  const dispatch = useDispatch();
  const blogs = useSelector(selectPublishedBlogs);
  const loading = useSelector(selectBlogLoading);
  const error = useSelector(selectBlogError);

  useEffect(() => {
    dispatch(fetchPublishedBlogs() as any);
  }, [dispatch]);

  return (
    <section className="relative w-full bg-white">
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
          {loading && (
            <div className="col-span-full flex justify-center items-center min-h-40">
              <span className="text-lg text-gray-500 font-cormorant">Loading blogs...</span>
            </div>
          )}
          {!loading && error && (
            <div className="col-span-full flex justify-center items-center min-h-40">
              <span className="text-lg text-gray-500 font-cormorant">No blog posts found.</span>
            </div>
          )}
          {!loading && !error && blogs && blogs.length === 0 && (
            <div className="col-span-full flex justify-center items-center min-h-40">
              <span className="text-lg text-gray-500 font-cormorant">No blog posts found.</span>
            </div>
          )}
          {!loading &&
            !error &&
            blogs &&
            blogs.length > 0 &&
            blogs.slice(0, 6).map((post, index) => (
              <BlogCard
                key={post.id}
                image={post.image}
                title={post.title}
                index={index}
                slug={post.slug}
              />
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
          <Link href="/blogs" aria-label="View all blog posts">
            <GradientButton>
              View All Blog Posts
            </GradientButton>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
