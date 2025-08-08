import { Fullscreen } from 'lucide-react';
import Link from 'next/link';

export default function AboutHero() {
    return (
        <section
            className="relative flex items-center justify-center overflow-hidden"
            style={{
                background: '#595959',
                height: '417px',
                flexShrink: 0,
            }}
        >
            {/* Background Overlays */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[#595959] opacity-60"></div>
                <div className="absolute inset-0 opacity-80"></div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 relative z-10 text-center">
                {/* Heading */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-wide uppercase mb-3">
                    BLOGS
                </h1>

                {/* Small Black Line */}
                <div className="mx-auto w-10 h-[2px] bg-black mb-2"></div>

                {/* Breadcrumb */}
                <div className="mb-8">
                    <nav className="inline-flex items-center text-gray-300 text-sm md:text-base">
                        <Link
                            href="/"
                            className="text-white hover:text-gray-300 transition-colors duration-300"
                        >
                            Home
                        </Link>
                        <span className="mx-2 text-gray-400">/</span>
                        <Link
                            href="/blogs"
                            className="text-white hover:text-gray-300 transition-colors duration-300"
                        >
                            <span className="font-medium">Blog</span>
                        </Link>
                    </nav>
                </div>
            </div>
        </section>
    );
}
