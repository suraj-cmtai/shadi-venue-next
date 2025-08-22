'use client';

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import {
  fetchBlogBySlug,
  selectCurrentBlog,
  selectBlogLoading,
  selectBlogError,
} from "@/lib/redux/features/blogSlice";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { RelevantBlogs } from "./details";
import { motion } from "framer-motion";
import Hero from "./hero";
import Blog from "@/components/(website)/home/Blog";

/**
 * Blog details dynamic page for [slug] using Next.js 15 params promise pattern.
 * Fetches blog details using Redux slice and displays the blog content.
 * Hero and RelevantBlogs are present as per requirements.
 * 
 * @param params - Next.js dynamic route params as a Promise<{ slug: string }>
 */
export default function BlogDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const blog = useSelector(selectCurrentBlog);
  const loading = useSelector(selectBlogLoading);
  const error = useSelector(selectBlogError);

  // Fetch blog by slug on mount or slug change
  useEffect(() => {
    let ignore = false;
    (async () => {
      const { slug } = await params;
      if (!ignore && slug) {
        dispatch(fetchBlogBySlug(slug));
      }
    })();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, dispatch]);

  // Decorative tags/icons (could be dynamic if available in blog.tags)
  const tags = blog?.tags?.length
    ? blog.tags.map((t) => ({ label: t, icon: "/images/wedding/photographer.png" }))
    : [
        { label: "Photographer", icon: "/images/wedding/photographer.png" },
        { label: "Bridal gloves", icon: "/images/wedding/photographer.png" },
        { label: "Makeup Artist", icon: "/images/wedding/photographer.png" },
        { label: "Adventure", icon: "/images/wedding/photographer.png" },
      ];

  return (
    <section className="bg-black text-white w-full">
      {/* Hero Section */}
      {/* <Hero /> */}
      {/* Blog Details Hero Section - Responsive */}
      <section className="relative w-full flex items-center justify-center overflow-hidden bg-[#595959] min-h-[30vh] sm:min-h-[35vh] md:min-h-[417px]">
        {/* Background Overlays */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#595959] opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#595959]/80 to-black/90 opacity-80" />
        </div>
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative z-10 w-full"
        >
          <div className="max-w-7xl mx-auto px-2 sm:px-4 flex flex-col items-center text-center gap-2 md:gap-4">
            {loading ? (
              <div className="flex flex-col items-center gap-3 w-full">
                <Skeleton className="h-8 w-2/3 sm:w-1/2 rounded bg-gray-700" />
                <Skeleton className="h-12 w-4/5 sm:w-2/3 rounded bg-gray-700" />
                <Skeleton className="h-4 w-1/2 sm:w-1/3 rounded bg-gray-700" />
              </div>
            ) : blog ? (
              <>
                {/* Category */}
                <span className="uppercase tracking-[0.15em] text-xs sm:text-sm text-white/80 mb-1">
                  {blog.category || "Expert Tip"}
                </span>
                {/* Title */}
                <h1 className="font-cormorant text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-wide uppercase mb-2 leading-tight break-words">
                  {blog.title}
                </h1>
                {/* Decorative Black Line */}
                <div className="mx-auto w-10 h-[2px] bg-black mb-2" />
                {/* Date */}
                <span className="text-xs sm:text-sm text-white/70 mt-1">
                  {blog.createdOn
                    ? new Date(blog.createdOn).toLocaleString(undefined, {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
                {/* Breadcrumb */}
                <div className="mt-4">
                  <nav className="inline-flex flex-wrap items-center text-white/80 text-xs sm:text-sm md:text-base gap-2">
                    <Link
                      href="/"
                      className="text-white hover:text-gray-300 transition-colors duration-300"
                      aria-label="Home"
                    >
                      Home
                    </Link>
                    <span className="mx-1 text-gray-300">/</span>
                    <Link
                      href="/blogs"
                      className="text-white hover:text-gray-300 transition-colors duration-300"
                      aria-label="Blogs"
                    >
                      Blogs
                    </Link>
                    <span className="mx-1 text-gray-300">/</span>
                    <span className="font-medium text-white/90 truncate max-w-[120px] xs:max-w-[180px] md:max-w-xs">
                      {blog.title}
                    </span>
                  </nav>
                </div>
              </>
            ) : error ? (
              <div className="text-red-400 text-center">{error}</div>
            ) : null}
          </div>
        </motion.div>
      </section>

      {/* Blog Details Section */}
      <div className="w-full bg-white text-gray-800 px-2 sm:px-4 md:px-6 py-8 sm:py-10 md:py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 md:gap-10 relative">
           {/* Decorative Leaves Left */}
          <div className="absolute left-0 top-24 md:top-32 z-0 hidden md:block max-w-[30vw] xl:max-w-[20vw]">
            <div className="relative w-full h-auto aspect-[4/3]">
              <Image
                src="/images/wedding/Vector_1.png"
                alt="Decorative leaf"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 30vw, 20vw"
                priority
              />
            </div>
          </div>
          {/* Decorative Leaves Right */}
          <div className="absolute right-0 top-32 md:top-40 z-0 hidden md:block max-w-[28vw] xl:max-w-[18vw]">
            <div className="relative w-full h-auto aspect-[5/4]">
              <Image
                src="/images/wedding/Vector_4.png"
                alt="Decorative leaf"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 28vw, 18vw"
                priority
              />
            </div>
          </div>
          {/* Main Blog Content */}
          <article className="md:col-span-8 space-y-5 sm:space-y-6 md:space-y-8 z-10">
            {loading ? (
              <div className="space-y-4 sm:space-y-6">
                <Skeleton className="h-8 w-2/3 rounded bg-gray-200" />
                <Skeleton className="h-40 sm:h-64 w-full rounded bg-gray-200" />
                <Skeleton className="h-4 w-full rounded bg-gray-200" />
                <Skeleton className="h-4 w-5/6 rounded bg-gray-200" />
                <Skeleton className="h-4 w-2/3 rounded bg-gray-200" />
              </div>
            ) : blog ? (
              <>
                <div>
                  <p className="text-xs uppercase text-gray-500 mb-2">{blog.category || "Expert Tip"}</p>
                  <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-semibold text-[#1a2238] leading-snug break-words">
                    {blog.title}
                  </h1>
                  <p className="text-xs sm:text-sm mt-2 text-gray-400">
                    {blog.createdOn
                      ? new Date(blog.createdOn).toLocaleString(undefined, {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </p>
                  <div className="w-12 sm:w-16 md:w-20 h-[2px] bg-[#1a2238] mt-2"></div>
                </div>
                <div className="w-full h-40 xs:h-48 sm:h-64 md:h-[400px] bg-gray-200 relative rounded">
                  {blog.image ? (
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      className="object-cover rounded"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 66vw"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="space-y-3 sm:space-y-4 md:space-y-6 text-[15px] leading-relaxed">
                  {/* Render excerpt if available */}
                  {blog.excerpt && (
                    <p className="text-gray-700">{blog.excerpt}</p>
                  )}
                  {/* Render main content (could be HTML, here as plain text) */}
                  <div className="prose prose-gray max-w-none text-gray-800 break-words">
                    {blog.content}
                  </div>
                </div>
                {/* Tags */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center flex-wrap gap-y-3 sm:gap-y-4 mt-4 sm:mt-6 text-sm text-gray-600">
                  {/* Tags with icons */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
                    {tags.map((tag, i) => (
                      <div key={i} className="flex items-center gap-1 sm:gap-2">
                        <Image src={tag.icon} alt={tag.label} width={14} height={14} />
                        <span>{tag.label}</span>
                      </div>
                    ))}
                  </div>
                  {/* Social icons */}
                  <div className="flex gap-2 sm:gap-3 mt-2 sm:mt-0">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                      <Image src="/images/wedding/fb.png" alt="Facebook" width={16} height={16} />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                      <Image src="/images/wedding/twitter.png" alt="Twitter" width={16} height={16} />
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                      <Image src="/images/wedding/linkedin.png" alt="LinkedIn" width={16} height={16} />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                      <Image src="/images/wedding/nw.png" alt="Instagram" width={16} height={16} />
                    </a>
                  </div>
                </div>
                {/* White Divider Line */}
                <div className="w-full h-[1px] bg-gray-200 my-6 sm:my-8 md:my-12" />
                {/* Post Comment Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12 max-w-7xl mx-auto">
                  <div className="md:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">Post Comments</h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Your email won’t be published. Required fields are indicated and must be completed.<sup>*</sup>
                    </p>
                    <form
                      className="space-y-2 sm:space-y-3 md:space-y-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        toast.info("Comment submitted (not implemented)");
                      }}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                        <Input
                          type="text"
                          placeholder="Name"
                          className="w-full"
                          required
                        />
                        <Input
                          type="email"
                          placeholder="Email"
                          className="w-full"
                          required
                        />
                      </div>
                      <Textarea
                        rows={4}
                        placeholder="What Would You Like To Discuss?"
                        className="w-full"
                        required
                      />
                      <Button
                        type="submit"
                        className="bg-[#1a2238] text-white px-4 sm:px-6 py-2 text-sm uppercase tracking-widest w-full sm:w-auto"
                      >
                        Submit Now →
                      </Button>
                    </form>
                  </div>
                </div>
              </>
            ) : error ? (
              <div className="text-red-500 text-lg">{error}</div>
            ) : null}
          </article>
          {/* Sidebar */}
          
          
        </div>
      </div>
      {/* Relevant Blogs Section */}
      <div className="px-2 sm:px-4 md:px-6">
        <Blog />
      </div>
    </section>
  );
}