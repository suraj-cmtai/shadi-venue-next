'use client';

import Image from 'next/image';
import Link from 'next/link';

const recentBlogs = [
    {
        title: 'Top Online Gift Registry',
        category: 'Expert Tip',
        image: '/images/blog1.jpg',
        slug: 'top-online-gift-registry',
    },
    {
        title: 'Best Glamping Spots',
        category: 'Expert Tip',
        image: '/images/blog2.jpg',
        slug: 'best-glamping-spots',
    },
    {
        title: 'Plan for the Evening',
        category: 'Expert Tip',
        image: '/images/blog3.jpg',
        slug: 'plan-for-the-evening',
    },
];

export default function BlogDetailPage() {
    return (
        <div className="min-h-screen bg-white text-gray-800 px-4 md:px-6 py-12">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">

                {/* Decorative Leaves Left */}
                <div className="absolute -left-36 mt-28 transform rotate-0 hidden md:block">
                    <div className="relative w-[560px] h-[420px]">
                        <Image
                            src="/images/wedding/Vector_1.png"
                            alt="Decorative leaf"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>

                {/* Decorative Leaves Right */}
                <div className="absolute -right-12 mt-50 -mr-14 transform -translate-y-1/2 hidden md:block">
                    <div className="relative w-[500px] h-[420px]">
                        <Image
                            src="/images/wedding/Vector_4.png"
                            alt="Decorative leaf"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
                {/* Main Blog Content */}
                <article className="md:col-span-8 space-y-6 sm:space-y-8">
                    <div>
                        <p className="text-xs uppercase text-gray-500 mb-2">Expert Tip</p>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#1a2238] leading-snug">
                            Top Online Gift Registry
                        </h1>
                        <p className="text-xs sm:text-sm mt-2 text-gray-400">15 August 2024 8:30 Am</p>
                        <div className="w-16 sm:w-20 h-[2px] bg-[#1a2238] mt-2"></div>
                    </div>

                    <div className="w-full h-48 sm:h-64 md:h-[400px] bg-gray-200 relative">
                        <Image
                            src="/images/blog1.jpg"
                            alt="Blog Detail"
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="space-y-4 sm:space-y-6 text-[15px] leading-relaxed">
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus fermentum
                            mi sit amet risus fermentum, vitae ultrices sapien varius...
                        </p>

                        <blockquote className="border-l-4 border-gray-400 pl-4 italic text-[#1a2238] text-base sm:text-lg font-serif">
                            “Lorem ipsum dolor sit amet, consectetur adipiscing elit...”
                        </blockquote>

                        <p>
                            Vivamus lobortis orci ut augue interdum, nec dictum purus posuere. Nulla id tortor et
                            ipsum maximus congue sit amet vel risus...
                        </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center flex-wrap gap-y-4 mt-6 text-sm text-gray-600">
                        {/* Tags with icons */}
                        <div className="flex flex-wrap gap-3 sm:gap-4">
                            {[
                                { label: "Photographer", icon: "/images/wedding/photographer.png" },
                                { label: "Bridal gloves", icon: "/images/wedding/photographer.png" },
                                { label: "Makeup Artist", icon: "/images/wedding/photographer.png" },
                                { label: "Adventure", icon: "/images/wedding/photographer.png" },
                            ].map((tag, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <Image src={tag.icon} alt={tag.label} width={14} height={14} />
                                    <span>{tag.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Social icons */}
                        <div className="flex gap-3 mt-3 sm:mt-0">
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
                    <div className="w-full h-[1px] bg-gray-200 my-8 sm:my-12" />

                    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 max-w-7xl mx-auto">
                        {/* Post Comment Section */}
                        <div className="md:col-span-2 space-y-4 sm:space-y-6">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Post Comments</h3>
                            <p className="text-xs sm:text-sm text-gray-500">
                                Your email won’t be published. Required fields are indicated and must be completed.<sup>*</sup>
                            </p>

                            <form className="space-y-3 sm:space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        className="w-full border border-gray-300 px-3 sm:px-4 py-2 text-sm focus:outline-none"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        className="w-full border border-gray-300 px-3 sm:px-4 py-2 text-sm focus:outline-none"
                                    />
                                </div>

                                <textarea
                                    rows={4}
                                    placeholder="What Would You Like To Discuss?"
                                    className="w-full border border-gray-300 px-3 sm:px-4 py-2 text-sm focus:outline-none"
                                ></textarea>

                                <button className="bg-[#1a2238] text-white px-4 sm:px-6 py-2 text-sm uppercase tracking-widest w-full sm:w-auto">
                                    Submit Now →
                                </button>
                            </form>
                        </div>

                    </div>
                </article>

                {/* Sidebar */}
                <aside className="md:col-span-3 space-y-8 sm:space-y-10 mt-10 md:mt-0">
                    {/* Search */}
                    <div>
                        <input
                            type="text"
                            placeholder="Searching For..."
                            className="w-full border border-gray-400 px-3 sm:px-4 py-2 text-sm focus:outline-none"
                        />
                    </div>

                    {/* Subscribe Box */}
                    <div className="border p-4 sm:p-6 space-y-3 sm:space-y-4 text-center">
                        <div className="w-10 h-10 mx-auto">
                            <Image
                                src="/images/wedding/mail.png"
                                alt="Mail Icon"
                                width={40}
                                height={40}
                                className="mx-auto"
                            />
                        </div>
                        <p className="text-xs sm:text-sm text-gray-700">
                            Subscribe to our newsletter for the latest news and updates!
                        </p>
                        <input
                            type="email"
                            placeholder="EMAIL ADDRESS"
                            className="w-full border px-2 sm:px-3 py-2 text-sm text-gray-700"
                        />
                        <button className="w-full bg-[#1a2238] text-white text-sm py-2 mt-2">
                            SUBSCRIBE NOW
                        </button>
                    </div>

                    {/* Recent Posts */}
                    <div>
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mb-3 sm:mb-4 uppercase">Recent Posts</h3>
                        <ul className="space-y-5 sm:space-y-8 text-xs sm:text-sm">
                            {[
                                "Mastering the Biggest New Trend in Industry...",
                                "Unique Wedding Favor Ideas for Your Guests...",
                                "Discover the Ideal Type of Wedding for You...",
                                "Small Wedding Ideas for a Perfect Celebration...",
                                "Small Wedding Ideas for a Perfect Celebration...",
                            ].map((title, i) => (
                                <li key={i} className="flex gap-3 sm:gap-4 items-start">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200" />
                                    <div>
                                        <p className="text-[10px] sm:text-xs text-gray-400 mb-1">15 May 2024 8:30 Am</p>
                                        <p className="text-gray-700 leading-tight">{title}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* Instagram Posts */}
                    <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-800 uppercase mb-3 sm:mb-4">Instagram Posts</h4>
                        <div className="grid grid-cols-3 gap-1 sm:gap-2">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="w-full aspect-square bg-gray-200" />
                            ))}
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-800 uppercase mb-3 sm:mb-4">Categories</h4>
                        <div className="flex flex-wrap gap-x-2 sm:gap-x-4 gap-y-3 sm:gap-y-4 text-xs sm:text-sm text-gray-700">
                            {[
                                "Bridal gloves", "Wedding cake", "Movie", "Top", "Jewelry", "Makeup Artist", "Adventure", "Art",
                                "Photographer", "Lifestyle", "Music", "Travel", "Transportation", "Food", "Ceremony"
                            ].map((cat, i) => (
                                <a key={i} href="#" className="hover:underline">
                                    {cat}
                                </a>
                            ))}
                        </div>
                    </div>
                </aside>
                
            </div>
        </div>
    );
}



export function RelevantBlogs() {
    return (
        <section className="py-10 sm:py-16 md:py-20 px-1 sm:px-2 md:px-8 bg-white relative">
            {/* Decorative Leaves Left */}
            <div className="absolute -left-36 mt-28 transform rotate-0 hidden md:block z-0">
                <div className="relative w-[300px] h-[180px] sm:w-[400px] sm:h-[300px] md:w-[560px] md:h-[420px]">
                    <Image
                        src="/images/wedding/Vector_1.png"
                        alt="Decorative leaf"
                        fill
                        className="object-contain"
                    />
                </div>
            </div>

            {/* Decorative Leaves Right */}
            <div className="absolute -right-12 mt-32 sm:mt-40 -mr-6 sm:-mr-10 transform -translate-y-1/2 hidden md:block z-0">
                <div className="relative w-[250px] h-[180px] sm:w-[350px] sm:h-[300px] md:w-[500px] md:h-[420px]">
                    <Image
                        src="/images/wedding/Vector_4.png"
                        alt="Decorative leaf"
                        fill
                        className="object-contain"
                    />
                </div>
            </div>
            <h2 className="text-center font-dancing-script text-2xl sm:text-3xl md:text-4xl font-bold text-[#212D47] mb-8 sm:mb-14">
                Relevant Blog Posts
            </h2>

            <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8 md:gap-10">
                {recentBlogs.map((blog, index) => (
                    <div
                        key={index}
                        className="relative w-full h-60 sm:h-80 md:h-96 rounded-sm overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                        {/* Image background */}
                        <Image
                            src={blog.image}
                            alt={blog.title}
                            fill
                            className="object-cover"
                        />

                        {/* Dark gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />

                        {/* Top white line */}
                        <div className="absolute top-[5%] left-0 right-0 h-[1px] bg-white z-20" />

                        {/* Overlay content at the bottom */}
                        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-6 text-center text-white space-y-2 sm:space-y-3">
                            <p className="text-xs tracking-widest uppercase">{blog.category}</p>
                            <h3 className="text-base sm:text-lg font-semibold font-serif leading-snug">
                                {blog.title}
                            </h3>
                            <Link href={`/blog/${blog.slug}`}>
                                <button className="text-xs sm:text-sm border border-white px-4 sm:px-5 py-2 mt-2 hover:bg-[#212D47] hover:text-[#fff] transition-colors duration-200">
                                    Get Inspired →
                                </button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
