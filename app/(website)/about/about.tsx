'use client';

import { motion } from "framer-motion";
import Image from "next/image";

const WEDDING_IMAGES = [
    "/images/about-new/A gorgeous mandap decor and a beautiful….jpg",
    "/images/about-new/Bride & Groom_- @kashtag90 & @jhalakshah_ Wedding….jpg",
    "/images/about-new/0b9fae5d-37fd-45af-bb64-1d4f2c5cb42e.jpg",
    "/images/about-new/7f868e0a-82b4-4dd3-be86-697a81425751.jpg",
    "/images/about-new/af0255f9-1b5a-48b3-8ef9-98ba9d15afe5.jpg",
    "/images/about-new/bd7db971-6e5a-444e-8cc6-b8a744299113.jpg",
];

export default function WeddingSection() {
    return (
        <section className="relative w-full overflow-hidden bg-white">
            <div className="absolute inset-0 bg-white"></div>

            <div className="relative overflow-hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-16">

                {/* Image Gallery Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
                    {WEDDING_IMAGES.map((image, index) => (
                        <motion.div
                            key={index}
                            className="relative h-64 rounded-lg overflow-hidden shadow-lg"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Image
                                src={image}
                                alt={`Wedding moment ${index + 1}`}
                                fill
                                className="object-cover hover:scale-110 transition-transform duration-500"
                                priority={index < 4}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Section Header */}
                <motion.div
                    className="text-center mb-10 z-10 relative "
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.h3
                        className="font-cormorant text-xl text-[#666] mb-2"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Milady Wedding
                    </motion.h3>
                    <motion.h2
                        className="font-dancing-script text-4xl md:text-5xl text-[#212d47] mb-2"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        Helping Couples Make Their Wedding Dreams a Reality
                    </motion.h2>
                    <p className="text-[#000]">We help couples transform their wedding dreams into reality, ensuring every detail is perfectly executed.</p>

                    <motion.div
                        className="w-20 h-[2px] bg-[#212d47] mx-auto"
                        initial={{ opacity: 0, scaleX: 0 }}
                        whileInView={{ opacity: 1, scaleX: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    ></motion.div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-0 items-stretch z-10 relative ">
                    {/* Left Column - Text Content */}
                    <motion.div
                        className="w-full lg:w-1/2 flex flex-col justify-center space-y-8 z-10 relative pr-0 lg:pr-12"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        <div className="space-y-6">
                            <p className="font-cinzel text-sm md:text-xl text-[#000] mt-9">
                                ABOUT US
                            </p>
                            <h2 className="font-cormorant text-4xl text-[#000] font-bold leading-relaxed">
                                Creating Beautiful Memories Together Since 1998.
                            </h2>
                            <p className="font-cormorant text-lg text-[#666] leading-relaxed">
                                Since 1998, we’ve been dedicated to creating beautiful memories together. Our commitment to excellence and personalized service ensures every detail of your special day is thoughtfully crafted, making each moment unforgettable and leaving a lasting impression on you and your loved ones.
                            </p>

                            {/* Get in Touch Button */}
                            <motion.button
                                className="bg-[#212d47] text-white px-6 py-3 mt-6 rounded-lg font-cinzel text-base font-semibold hover:bg-[#212d47]/90 transition-all duration-300 shadow-md hover:shadow-lg"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Get in Touch
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Right Column - Framed Image */}
                    <motion.div
                        className="w-full lg:w-1/2 flex items-center justify-end relative z-10 mt-12 lg:mt-10"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                    >
                        {/* Outer Frame with full width gray background */}
                        <div className="relative w-full h-full pt-[6vw] pr-[9vw] pb-[6vw] pl-[6vw] bg-gray-200 shadow-xl flex items-center justify-center">

                            {/* Decorative PNG bottom-left corner inside the gray frame */}
                            <div className="absolute left-0 bottom-0 w-[180px] h-[180px] md:w-[280px] md:h-[280px] z-20">
                                {/* Rotated container */}
                                <div className="relative w-full h-full rotate-[-10deg]">
                                    {/* Background PNG */}
                                    <Image
                                        src="/images/wedding/shadi-venue.png"
                                        alt="venue-card"
                                        fill
                                        className="object-contain"
                                    />

                                    {/* Rotated text inside same container, centered */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <p className="text-white font-cinzel text-sm font-bold text-center pointer-events-none rotate-[42deg]">
                                            SHADI VENUE
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* White inner frame */}
                            <div className="bg-white p-[0.5vw] rounded-md relative z-10 w-full">
                                <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden rounded-md">
                                    <Image
                                        src={WEDDING_IMAGES[0]}
                                        alt="Wedding main image"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>

                            {/* Decorative leaf image below frame, extending right */}
                            <div className="absolute right-0 w-full h-32 z-0 -mr-55 -mb-44">
                                <div className="relative w-full h-full">
                                    <Image
                                        src="/images/wedding/pink-leaves1.png"
                                        alt="Decorative leaf"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
