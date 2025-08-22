/* eslint-disable react/no-unescaped-entities */
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const NotFound = () => {
    const pathname = usePathname();
    const mainRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        console.log("404 Error: User attempted to access non-existent route:", pathname);
        // Instantly scroll to main section (no smooth/scroll effect)
        if (mainRef.current) {
            mainRef.current.scrollIntoView({ behavior: "auto" });
        }
    }, [pathname]);

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Decorative Leaves Left */}
            <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 hidden md:block mt-40 opacity-45">
                <div className="relative w-[500px] h-[420px]">
                    <Image
                        src="/images/wedding/Vector_4.png"
                        alt="Decorative leaf"
                        fill
                        className="object-contain"
                    />
                </div>
            </div>

            {/* Decorative Leaves Right */}
            <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 hidden md:block mt-20 opacity-45">
                <div className="relative w-[500px] h-[420px]">
                    <Image
                        src="/images/wedding/Vector_4.png"
                        alt="Decorative leaf"
                        fill
                        className="object-contain"
                    />
                </div>
            </div>

            {/* Hero Section with ERROR and Breadcrumbs */}
            <section
                className="relative flex items-center justify-center overflow-hidden"
                style={{
                    background: "#595959",
                    height: "417px",
                    flexShrink: 0,
                }}
            >
                {/* Hero Background Image */}
                <div className="absolute inset-0">
                    <Image
                        src="/images/about-new/A gorgeous mandap decor and a beautiful….jpg"
                        alt="Beautiful Wedding Mandap"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
                {/* Background Overlays */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[#595959] opacity-60"></div>
                    <div className="absolute inset-0 opacity-80"></div>
                </div>

                {/* Content */}
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-wide uppercase mb-3">
                        ERROR
                    </h1>
                    <div className="mx-auto w-10 h-[2px] bg-black mb-2"></div>
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
                                href="/error"
                                className="text-white hover:text-gray-300 transition-colors duration-300"
                            >
                                <span className="font-medium">Error</span>
                            </Link>
                        </nav>
                    </div>
                </div>
            </section>

            {/* Main content */}
            <div
                ref={mainRef}
                className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8"
            >
                <div>
                    <Image
                        src="/images/wedding/404.png"
                        height={520}
                        width={510}
                        alt="Diamond Shape"
                        className="w-full h-full object-cover transform"
                    />
                </div>
                {/* Diamond shape with 404 */}
                {/* <div className="mb-20 relative">
                    <div className="w-40 h-40 bg-muted rounded-lg transform rotate-45 flex items-center justify-center relative">
                        <div className="transform -rotate-45 text-center">
                            <Image
                                src="/images/wedding/error.png"
                                height={520}
                                width={510}
                                alt="Diamond Shape"
                                className="w-full h-full object-cover transform -rotate-90"
                            />
                            <div className="text-8xl font-light text-muted-foreground tracking-wider -mt-52">404</div>
                        </div>
                    </div>
                </div> */}

                {/* Text content */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-light text-foreground mb-4">Oops! Page Not Found</h1>
                    <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                        Oops! It looks like the page you're trying to reach cannot be found. It may have been moved or deleted.
                        <br />
                        Please check the URL or return to the homepage.
                    </p>
                </div>

                {/* Back button */}
                <Button
                    onClick={() => window.location.href = '/'}
                    className="bg-[#212D47] hover:bg-[#1a2137] text-white px-8 py-3 rounded-sm cursor-pointer transition-colors duration-300 shadow-md hover:shadow-lg"
                >
                    ← Back To Home Page
                </Button>
            </div>

            {/* Bottom HARRIET BOUQUET section */}
            {/* <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm py-8 mb-8 mt-4">
                <div className="max-w-6xl mx-auto px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="space-y-2">
                                <div className="w-16 h-12 bg-muted/30 rounded mx-auto mb-3"></div>
                                <h3 className="text-lg font-medium text-foreground tracking-wide">HARRIET BOUQUET</h3>
                                <p className="text-sm text-muted-foreground">WEDDING FLORIST</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div> */}
        </div>
    );
};

export default NotFound;