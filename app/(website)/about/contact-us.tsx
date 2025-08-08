'use client';

import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function ContactSection() {
    return (
        <>
            {/* Contact Section */}
            <section className="relative w-full min-h-[600px] flex overflow-hidden">
                {/* Left Grey Half */}
                <div className="w-1/2 bg-[#ddd]" />

                {/* Right White Half */}
                <div className="w-1/2 bg-white" />

                {/* Form Container overlapping into left gray */}
                <div className="absolute top-1/2 left-[40%] transform -translate-y-1/2 z-10">
                    <div className="relative bg-gray-50 w-[90vw] max-w-[700px] p-8 md:p-12 shadow-md rounded-sm">
                        {/* Background Leaf Decorative Image */}
                        <div className="absolute right-0 bottom-0 w-[50%] pointer-events-none z-0 -mr-20">
                            <Image
                                src="/images/wedding/get-in-touch.png"
                                alt="decorative"
                                width={200}
                                height={200}
                                className="object-contain"
                            />
                        </div>

                        {/* Form Content */}
                        <div className="relative z-10 space-y-6">
                            <p className="italic text-gray-600 font-semibold text-sm">Contact Us</p>
                            <h2 className="text-3xl md:text-4xl font-serif text-black">Get In Touch</h2>

                            <form className="space-y-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        className="w-full border-b border-gray-300 bg-transparent placeholder-gray-500 py-2 focus:outline-none text-black"
                                    />
                                    <input
                                        type="email"
                                        placeholder="E-mail"
                                        className="w-full border-b border-gray-300 bg-transparent placeholder-gray-500 py-2 focus:outline-none text-black"
                                    />
                                </div>

                                <input
                                    type="text"
                                    placeholder="Wedding Date"
                                    className="w-full border-b border-gray-300 bg-transparent placeholder-gray-500 py-2 focus:outline-none text-black"
                                />

                                <textarea
                                    placeholder="Your Messages"
                                    rows={3}
                                    className="w-full border-b border-gray-300 bg-transparent placeholder-gray-500 py-2 resize-none focus:outline-none text-black"
                                />

                                <button
                                    type="submit"
                                    className="bg-[#1a2238] text-white px-6 py-2 text-sm tracking-wide flex items-center gap-2"
                                >
                                    SUBMIT <span className="text-xs">▶</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Help Section */}
            <section className="w-full py-20 px-6 md:px-20 flex flex-col md:flex-row justify-between items-center gap-10 bg-white">
                {/* Left Text */}
                <div className="border-l-4 border-[#1a2238] pl-6 max-w-xl ml-36">
                    <h2 className="text-3xl text-[#212D47] md:text-4xl font-dancing-script font-bold mb-4">
                        Need Guidance? Get Help!
                    </h2>
                    <p className="text-gray-500 leading-relaxed">
                        Feeling unsure of where to start? Don’t worry! Our team is here
                        to provide the guidance and support you need to make the right
                        decisions and achieve your goals
                    </p>
                </div>

                {/* Right CTA Box */}
                <div className="bg-[#1a2238] text-white px-10 py-8 relative w-full max-w-md mr-24">
                    <p className="text-sm text-gray-300 mb-1">Allow it to unfold</p>
                    <h3 className="text-lg font-semibold tracking-wide">EXCLUSIVE PRICE OFFER</h3>
                    <div className="absolute top-1/2 right-5 transform -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <ArrowRight className="text-white w-4 h-4" />
                    </div>
                </div>
            </section>
        </>
    );
}
