'use client';

import { motion } from "framer-motion";
import Image from "next/image";

const TEAM_MEMBERS = [
    {
        name: "Ananya Joshi",
        position: "Event Specialist",
        image: "/images/ananya-joshi.jpeg",
        bio: "Ananya is a dedicated event specialist with a keen eye for detail. With years of experience in the wedding and event industry, she ensures that every client’s vision is beautifully brought to life, providing seamless and personalized venue solutions.",
    },
    {
        name: "Riya Mehta",
        position: "Hotel & Resort Negotiation Expert",
        image: "/images/riya-mehta.jpeg",
        bio: "Riya is our expert in hotel and resort negotiations. Her strong relationships with property owners across North India help us secure the best rates for our clients. Riya’s knowledgeable approach guarantees affordability without compromising on quality.",
    },
    {
        name: "Simran Kaur",
        position: "Client Relations & Venue Advisor",
        image: "/images/simran-kaur.jpeg",
        bio: "Simran is passionate about creating memorable event experiences. She handles client queries and assists in selecting the perfect venue, ensuring a smooth and stress-free booking process from start to finish.",
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
                    <img
                        src="/images/wedding/Vector_1.png"
                        alt="Decorative leaf"
                        className="w-full h-full object-contain"
                    />
                </div>
            </div>

            {/* Decorative Leaves Right */}
            <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 hidden md:block">
                <div className="relative w-[500px] h-[420px]">
                    <img
                        src="/images/wedding/Vector_4.png"
                        alt="Decorative leaf"
                        className="w-full h-full object-contain"
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
                        className="font-dancing-script text-3xl md:text-6xl text-[#212d47] mb-6"
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

                {/* Small Screen Grid Layout */}
                <div className="grid grid-cols-2 gap-4 md:hidden">
                    {TEAM_MEMBERS.map((member, index) => (
                        <motion.div
                            key={`md-${index}`}
                            className="group relative w-full overflow-visible"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                        >
                            {/* Member Image */}
                            <div className="relative w-full h-96 bg-gray-200 overflow-hidden rounded-lg">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            
                            {/* Card Content Below Image */}
                            <div className="mt-4 px-4 py-4 shadow-md bg-white rounded-lg">
                                <h3 className="font-cinzel text-lg text-black font-semibold mb-1">
                                    {member.name}
                                </h3>
                                <p className="font-cormorant text-sm text-gray-500">
                                    {member.position}
                                </p>
                                <p className="font-cormorant text-xs text-gray-400 mt-2">
                                    {member.bio}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Original Layout - Hidden on small screens */}
                <div className="hidden md:flex flex-col gap-8 md:gap-20">
                    {TEAM_MEMBERS.map((member, index) => (
                        <motion.div
                            key={index}
                            className={`group relative w-full md:w-1/2 overflow-visible ${index % 2 === 0 ? "self-start ml-0 md:ml-16" : "self-end mr-0 md:mr-16"
                                }`}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                        >
                            {/* Mobile Layout - Card content below image */}
                            <div className="block md:hidden">
                                {/* Member Image */}
                                <div className="relative w-full h-96 bg-gray-200 overflow-hidden rounded-lg">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                
                                {/* Card Content Below Image */}
                                <div className="mt-4 px-4 py-4 shadow-md bg-white rounded-lg">
                                    <h3 className="font-cinzel text-lg text-black font-semibold mb-1">
                                        {member.name}
                                    </h3>
                                    <p className="font-cormorant text-sm text-gray-500">
                                        {member.position}
                                    </p>
                                    <p className="font-cormorant text-xs text-gray-400 mt-2">
                                        {member.bio}
                                    </p>
                                </div>
                            </div>

                            {/* Desktop Layout - Original design */}
                            <div className="hidden md:block">
                                {/* Member Image */}
                                <div className="relative w-full h-[36rem] lg:h-[44rem] bg-gray-200 overflow-hidden">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                                    <p className="font-cormorant text-xs text-gray-400 mt-2">
                                        {member.bio}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
