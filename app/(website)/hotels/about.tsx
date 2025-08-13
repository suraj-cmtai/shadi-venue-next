"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const features = [
    {
        image: "/images/hotels/icons/parking.png",
        title: "Private Parking",
        desc: "A secure and designated parking space reserved for authorized individuals, offering peace of mind, safety, and convenient.",
    },
    {
        image: "/images/hotels/icons/accessible.png",
        title: "Accessible",
        desc: "Inclusive and easy to access for all, with features like ramps, wide entryways, and clear signage for safety and convenience.",
    },
    {
        image: "/images/hotels/icons/pet.png",
        title: "Pet Friendly",
        desc: "Welcoming to pets of all kinds, with designated areas, amenities, and policies that ensure comfort, safety, and convenience for you and your companion.",
    },
    {
        image: "/images/hotels/icons/garden.png",
        title: "Patio Garden",
        desc: "A peaceful outdoor space designed for relaxation, featuring greenery, seating, and natural light perfect for enjoying fresh air in a private setting.",
    },
];

export default function AboutPage() {
    return (
        <section className="px-4 sm:px-6 md:px-12 py-8 sm:py-16 md:py-20 bg-white relative">
            {/* Main Content Grid */}
            <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-0 items-stretch z-10 relative">
                {/* Left Column - Text Content */}
                <motion.div
                    className="w-full lg:w-1/2 flex flex-col justify-center space-y-6 sm:space-y-8 z-10 relative pr-0 lg:pr-12"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    <div className="space-y-4 sm:space-y-6">
                        <p className="font-cinzel text-xs sm:text-sm md:text-xl text-[#000] mt-2 sm:mt-4">
                            ABOUT US
                        </p>
                        <h2 className="font-cormorant text-xl sm:text-3xl md:text-4xl text-[#000] font-bold leading-relaxed">
                            Creating Beautiful Memories Together Since 1998.
                        </h2>
                        <p className="font-cormorant text-sm sm:text-lg text-[#666] leading-relaxed">
                            Since 1998, we’ve been dedicated to creating beautiful memories
                            together. Our commitment to excellence and personalized service
                            ensures every detail of your special day is thoughtfully crafted,
                            making each moment unforgettable and leaving a lasting impression
                            on you and your loved ones.
                        </p>

                        {/* Get in Touch Button */}
                        <motion.button
                            className="bg-[#212d47] text-white px-4 sm:px-6 py-2 sm:py-3 mt-4 sm:mt-6 rounded-lg font-cinzel text-sm sm:text-base font-semibold hover:bg-[#212d47]/90 transition-all duration-300 shadow-md hover:shadow-lg w-full sm:w-auto"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Get in Touch
                        </motion.button>
                    </div>
                </motion.div>

                {/* Right Column - Images */}
                <motion.div
                    className="w-full lg:w-1/2 flex items-center justify-center lg:justify-end relative z-10 mt-6 sm:mt-10 lg:mt-10"
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                >
                    <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg h-[220px] sm:h-[320px] md:h-[380px] lg:h-[520px] overflow-hidden shadow-sm rounded-sm">
                        <Image
                            src="/images/hotels/hotel.jpeg"
                            alt="Engineering Team"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* Sub Image */}
                    <div
                        className="absolute bottom-2 sm:bottom-6 md:bottom-10 left-2 sm:left-4 
             sm:w-28 sm:h-20 lg:w-40 lg:h-28 xl:w-62 xl:h-75
             overflow-hidden shadow-sm border-[2px] border-white rounded-sm"
                    >
                        <Image
                            src="/images/hotels/hotel1.jpeg"
                            alt="Sub Image"
                            fill
                            className="object-cover w-full h-full"
                        />
                    </div>

                </motion.div>
            </div>

            {/* Divider */}
            <div className="flex justify-center mt-10 sm:mt-20">
                <div className="w-full sm:w-[90%] h-[0.5px] bg-gray-300"></div>
            </div>

            {/* Features */}
            <div className="bg-white py-8 sm:py-12">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
                        {features.map((item, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center space-y-3 sm:space-y-4"
                            >
                                {/* Icon/Image */}
                                <div className="w-16 h-12 sm:w-20 sm:h-16 relative">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        sizes="(max-width: 640px) 64px, 80px"
                                        className="object-contain"
                                    />
                                </div>

                                {/* Title */}
                                <h4 className="text-black text-sm sm:text-lg font-bold">
                                    {item.title}
                                </h4>
                                <p className="font-cormorant text-xs sm:text-sm md:text-base text-[#888]">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
