'use client';

import { motion } from "framer-motion";
import Image from "next/image";

const TEAM_MEMBERS = [
    {
        name: "Sarah Johnson",
        position: "Wedding Coordinator",
        image: "/images/wedding/team.png",
    },
    {
        name: "Michael Chen",
        position: "Creative Director",
        image: "/images/team/team.jpg",
    },
];
const SUB_MEMBERS = [
    {
        image: "/images/wedding/team1.png",
        title: "HARRIET BOUQUET",
        desc: "WEDDING FLORIST",
    },
    {
        image: "/images/wedding/team2.png",
        title: "HARRIET BOUQUET",
        desc: "WEDDING FLORIST",
    },
    {
        image: "/images/wedding/team3.png",
        title: "HARRIET BOUQUET",
        desc: "WEDDING & EVENT FLORIST",
    },
    {
        image: "/images/wedding/team4.png",
        title: "HARRIET BOUQUET",
        desc: "WEDDING FLORAL DESIGN",
    },
];


export default function TeamSection() {
    return (
        <section className="relative w-full overflow-hidden bg-white">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#fafafa] to-white"></div>

            {/* Decorative Leaves Left */}
            <div className="absolute -left-12 top-1/4 transform -translate-y-1/2 rotate-12 hidden md:block">
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
            <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 hidden md:block">
                <div className="relative w-[500px] h-[420px]">
                    <Image
                        src="/images/wedding/Vector_4.png"
                        alt="Decorative leaf"
                        fill
                        className="object-contain"
                    />
                </div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                {/* Section Heading */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.h2
                        className="font-dancing-script text-5xl md:text-6xl text-[#212d47] mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        Meet Our Amazing Team
                    </motion.h2>
                    <motion.p
                        className="font-cormorant text-lg text-[#666] max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        Introducing our dedicated team committed to making your dreams reality.
                    </motion.p>
                </motion.div>

                {/* Team Members Grid */}
                <div className="flex flex-col gap-20">
                    {TEAM_MEMBERS.map((member, index) => (
                        <motion.div
                            key={index}
                            className={`group relative w-full md:w-1/2 overflow-visible ${index % 2 === 0 ? "self-start ml-4 md:ml-16" : "self-end mr-4 md:mr-16"
                                }`}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                        >
                            {/* Member Image */}
                            <div className="relative w-full h-72 bg-gray-200 overflow-hidden">
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>

                            {/* White Label Overlay (40% inside, 60% outside) */}
                            <div
                                className={`
                    absolute bottom-0 z-20 w-[80%] max-w-[280px]
                    px-6 py-4 shadow-md bg-white
                    ${index % 2 === 0 ? "right-0 translate-x-[40%] mb-7" : "left-0 -translate-x-[40%] mb-7"}
                `}
                            >
                                <h3 className="font-cinzel text-lg text-black font-semibold mb-1">
                                    {member.name}
                                </h3>
                                <p className="font-cormorant text-sm text-gray-500">
                                    {member.position}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>

            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center text-center">
                        {SUB_MEMBERS.map((item, index) => (
                            <div key={index} className="flex flex-col items-center space-y-4">
                                {/* Icon/Image */}
                                <div className="w-20 h-10 relative">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        sizes="80px"
                                        className="object-contain"
                                        onError={(e) => {
                                            console.error("Image failed to load:", item.image);
                                        }}
                                    />
                                </div>

                                {/* Title */}
                                <h4 className="text-black text-sm font-normal bg-red-100 border border-red-400">
                                    {item.title}
                                </h4>
                                {/* Description with lines */}
                                <p className="font-cormorant text-xs text-[#888] relative flex items-center justify-center">
                                    <span className="w-5 h-px bg-gray-400 mr-2"></span>
                                    {item.desc}
                                    <span className="w-5 h-px bg-gray-400 ml-2"></span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>




        </section>
    );
}
