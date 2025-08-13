
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
                <h1 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-wide uppercase mb-3"
                    style={{
                        fontSize: 'clamp(1.5rem, 6vw, 5rem)'
                    }}
                >
                   Hotels
                </h1>

                {/* Small Black Line */}
                <div className="mx-auto w-8 sm:w-10 h-[2px] bg-black mb-2"></div>

                {/* Breadcrumb */}
                <div className="mb-6 sm:mb-8">
                    <nav className="inline-flex flex-wrap items-center justify-center text-gray-300 text-xs xs:text-sm md:text-base">
                        <Link
                            href="/"
                            className="text-white hover:text-gray-300 transition-colors duration-300"
                        >
                            Home
                        </Link>
                        <span className="mx-1 sm:mx-2 text-gray-400">/</span>
                        <Link
                            href="/hotels"
                            className="text-white hover:text-gray-300 transition-colors duration-300"
                        >
                            <span className="font-medium">Hotels</span>
                        </Link>
                    </nav>
                </div>
            </div>
            <style jsx>{`
                @media (max-width: 640px) {
                    section {
                        height: 220px !important;
                    }
                }
            `}</style>
        </section>
    );
}
