"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

export default function Component() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)

    const images = [
        { src: "/images/hotels/hotel.jpeg?1", alt: "Modern bathroom with white fixtures" },
        { src: "/images/hotels/hotel1.jpeg?2", alt: "Modern bathroom with white fixtures" },
        { src: "/images/hotels/hotel.jpeg?3", alt: "Modern bathroom with white fixtures" },
        { src: "/images/hotels/hotel1.jpeg?4", alt: "Modern living room with sectional sofa and floating stairs" },
        { src: "/images/hotels/hotel.jpeg", alt: "Built-in white shelving and storage" }
    ]

    const handlePrevious = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    const handleNext = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }

    const getImageIndex = (offset: number) => {
        return (currentImageIndex + offset + images.length) % images.length
    }

    return (
        <>
            {/* GALLERY SECTION */}
            <div className="min-h-screen bg-[#eae5e1] px-4 py-16">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-12 text-center">
                        <p className="mb-2 text-sm font-light tracking-[0.2em] text-stone-500 uppercase">
                            Luxury B&B Experience
                        </p>
                        <h1 className="text-5xl font-light text-stone-800">Interior Gallery</h1>
                    </div>

                    {/* Gallery */}
                    <div className="relative mb-12">
                        <div className="flex items-center justify-center gap-4">
                            {/* Left Navigation Arrow */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-2 sm:left-4 z-10 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                                onClick={handlePrevious}
                            >
                                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-stone-600" />
                            </Button>

                            {/* Images Container */}
                            <div className="flex items-center gap-4 transition-transform duration-700 ease-in-out delay-100">
                                {/* Left Image - hidden on small */}
                                <div className="hidden md:block">
                                    <div className="h-80 w-64 overflow-hidden rounded-lg">
                                        <Image
                                            src={images[getImageIndex(-1)].src}
                                            alt={images[getImageIndex(-1)].alt}
                                            width={256}
                                            height={320}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </div>

                                {/* Center Image */}
                                <div
                                    className="relative cursor-pointer"
                                    onClick={() => setIsFullscreen(true)}
                                >
                                    <div className="h-64 w-full max-w-[500px] sm:h-80 sm:w-[500px] md:h-96 md:w-[600px] overflow-hidden rounded-lg">
                                        <Image
                                            src={images[getImageIndex(0)].src}
                                            alt={images[getImageIndex(0)].alt}
                                            width={600}
                                            height={384}
                                            className="h-full w-full object-cover transition-transform duration-700 ease-in-out delay-100"
                                        />
                                    </div>
                                </div>

                                {/* Right Image - hidden on small */}
                                <div className="hidden md:block">
                                    <div className="h-80 w-64 overflow-hidden rounded-lg">
                                        <Image
                                            src={images[getImageIndex(1)].src}
                                            alt={images[getImageIndex(1)].alt}
                                            width={256}
                                            height={320}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Navigation Arrow */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 sm:right-4 z-10 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                                onClick={handleNext}
                            >
                                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-stone-600" />
                            </Button>
                        </div>
                    </div>

                    {/* FullScreen Gallery Button - visible only on desktop */}
                    <div className="text-center">
                        <Button
                            variant="outline"
                            className="hidden sm:inline-flex rounded-full border-stone-400 px-6 py-2 sm:px-8 sm:py-3 text-stone-700 hover:bg-stone-200"
                            onClick={() => setIsFullscreen(true)}
                        >
                            FullScreen Gallery
                        </Button>
                    </div>
                </div>
            </div>

            {/* Fullscreen Overlay */}
            {isFullscreen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-2 sm:p-4">
                    {/* Close Button */}
                    <button
                        className="absolute top-3 right-3 sm:top-6 sm:right-6 text-white hover:text-gray-300 z-50"
                        onClick={() => setIsFullscreen(false)}
                    >
                        <X size={24} className="sm:size-8" />
                    </button>

                    <div className="relative w-full max-w-6xl flex items-center justify-center">
                        {/* Previous Button - hidden on mobile */}
                        <button
                            className="hidden sm:block absolute left-2 sm:left-4 text-white"
                            onClick={handlePrevious}
                        >
                            <ChevronLeft className="size-8 sm:size-10" />
                        </button>

                        {/* Image */}
                        <Image
                            src={images[currentImageIndex].src}
                            alt={images[currentImageIndex].alt}
                            width={1200}
                            height={800}
                            className="object-contain w-full h-auto max-h-[70vh] sm:max-h-[90vh]"
                        />

                        {/* Next Button - hidden on mobile */}
                        <button
                            className="hidden sm:block absolute right-2 sm:right-4 text-white"
                            onClick={handleNext}
                        >
                            <ChevronRight className="size-8 sm:size-10" />
                        </button>
                    </div>
                </div>
            )}

            {/* Activities Section */}
            <section className="py-16 px-4 bg-slate-100">
                <div className="max-w-6xl mx-auto">
                    {/* Typical Food */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                        <div className="space-y-8">
                            <div className="relative rounded-2xl overflow-hidden">
                                <Image
                                    src="/images/hotels/food.jpg"
                                    width={500}
                                    height={300}
                                    alt="Chef preparing gourmet local cuisine"
                                    className="w-full h-[300px] sm:h-[400px] object-cover"
                                />
                            </div>
                        </div>
                        <div className="space-y-6">
                            <p className="text-sm uppercase tracking-[0.2em] text-stone-500 mb-3 font-medium">
                                LOCAL ACTIVITIES
                            </p>
                            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-light text-luxury-text-overlay mb-6">
                                Typical Food
                            </h3>
                            <p className="text-luxury-text-overlay/80 leading-relaxed text-base sm:text-lg">
                                Experience the authentic flavors of our region, where every dish is a celebration of tradition and taste.
                                From freshly baked breads and rich aromatic curries to delicate sweets crafted from age-old recipes,
                                each bite tells a story of heritage and passion. Our chefs use locally sourced ingredients,
                                ensuring that every meal is as fresh as it is flavorful — a true journey for the senses.
                            </p>
                        </div>
                    </div>

                    {/* Horse Ride */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mt-16 lg:mt-24">
                        <div className="space-y-6 lg:order-1">
                            <p className="text-sm uppercase tracking-[0.2em] text-stone-500 mb-3 font-medium">
                                LOCAL ACTIVITIES
                            </p>
                            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-light text-luxury-text-overlay mb-6">
                                Horse Ride
                            </h3>
                            <p className="text-luxury-text-overlay/80 leading-relaxed text-base sm:text-lg">
                                Embark on a serene journey through breathtaking landscapes atop a gentle and well-trained horse.
                                Whether you’re a beginner or an experienced rider, our guided horse rides offer a unique way to
                                connect with nature, explore hidden trails, and enjoy the peaceful rhythm of the countryside.
                                It’s the perfect blend of adventure and tranquility for all ages.
                            </p>
                        </div>
                        <div className="space-y-8 lg:order-2">
                            <div className="relative rounded-2xl overflow-hidden">
                                <Image
                                    src="/images/hotels/riding.jpg"
                                    width={500}
                                    height={300}
                                    alt="Horse riding through scenic countryside"
                                    className="w-full h-[300px] sm:h-[400px] object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
