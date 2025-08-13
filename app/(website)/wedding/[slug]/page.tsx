"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, MapPin } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/lib/redux/store"
import { fetchWeddingById, selectSelectedWedding, selectIsLoading } from "@/lib/redux/features/weddingSlice"

export default function WeddingPage() {
    const params = useParams();
    const dispatch = useDispatch<AppDispatch>();
    const wedding = useSelector(selectSelectedWedding);
    const isLoading = useSelector(selectIsLoading);
    const [activeTab, setActiveTab] = useState("top-photos");

    // Safe date formatting function
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return "Date not available";
            }
            return date.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (error) {
            return "Date not available";
        }
    };

    const formatDateShort = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return "Date not available";
            }
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (error) {
            return "Date not available";
        }
    };

    useEffect(() => {
        if (params.slug) {
            dispatch(fetchWeddingById(params.slug as string));
        }
    }, [dispatch, params.slug]);

    // Use wedding data or fallback to sample data
    const weddingData = wedding || {
        coupleNames: "Richa and Shreyas",
        location: "Delhi NCR",
        weddingDate: "2025-03-21",
        description: "A Fairytale Winter Wedding In Delhi With English Charm & A Dusty Rose Lehenga...",
        images: {
            main: "/images/wedding/wed4.jpg",
            gallery: [
                "/images/wedding/wed3.jpg",
                "/images/wedding/wed3.jpg",
                "/images/wedding/wed3.jpg",
                "/images/wedding/wed3.jpg",
                "/images/wedding/wed3.jpg",
                "/images/wedding/wed3.jpg",
                "/images/wedding/wed3.jpg",
                "/images/wedding/wed3.jpg",
            ]
        }
    };

    const topPhotos = weddingData.images?.gallery?.slice(0, 4).map((src: string, index: number) => ({
        src,
        alt: `Wedding photo ${index + 1}`
    })) || [
        { src: "/images/wedding/wed3.jpg", alt: "Wedding ceremony" },
        { src: "/images/wedding/wed3.jpg", alt: "Bride portrait" },
        { src: "/images/wedding/wed3.jpg", alt: "Wedding couple"},
        { src: "/images/wedding/wed3.jpg", alt: "Couple laughing" },
    ];

    const allFunctions = weddingData.images?.gallery?.map((src: string, index: number) => ({
        src,
        alt: `Wedding function ${index + 1}`
    })) || [
        { src: "/images/wedding/wed3.jpg", alt: "Mehendi ceremony" },
        { src: "/images/wedding/wed3.jpg", alt: "Sangam celebration" },
        { src: "/images/wedding/wed3.jpg", alt: "Haldi ceremony" },
        { src: "/images/wedding/wed3.jpg", alt: "Baraat procession" },
        { src: "/images/wedding/wed3.jpg", alt: "Wedding ceremony" },
        { src: "/images/wedding/wed3.jpg", alt: "Reception party" },
        { src: "/images/wedding/wed3.jpg", alt: "Ring ceremony" },
        { src: "/images/wedding/wed3.jpg", alt: "Family photos" },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading wedding details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative max-w-6xl mx-auto px-4 py-8">
                <div className="relative">
                    {/* Main Wedding Image */}
                    <div className="relative h-96 md:h-[580px] overflow-hidden">
                        <Image
                            src={weddingData.images?.main || "/images/wedding/wed4.jpg"}
                            fill
                            alt={`${weddingData.coupleNames} wedding photo`}
                            className="w-full h-full object-cover"
                        />

                        {/* Couple Names Overlay */}
                        <Card className="absolute left-6 top-1/2 p-6 bg-white/95 backdrop-blur-sm">
                            <div className="text-center">
                                {weddingData.coupleNames.split(' and ').map((name: string, index: number) => (
                                    <div key={index}>
                                        <h1 className="text-2xl font-serif text-gray-800">{name}</h1>
                                        {index === 0 && <Heart className="w-6 h-6 mx-auto my-2 text-pink-500 fill-current" />}
                                    </div>
                                ))}

                                {/* Grey line */}
                                <hr className="my-4 border-gray-300" />

                                {/* Location */}
                                <p className="text-gray-600 text-sm">{weddingData.location}</p>

                                {/* Wedding Date */}
                                <p className="text-gray-600 text-sm mt-1">
                                    {formatDate(weddingData.weddingDate)}
                                </p>
                            </div>
                        </Card>


                        {/* View Tagged Vendors Button */}
                        {/* <Button
                            variant="outline"
                            className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm border-pink-200 text-pink-600 hover:bg-pink-50"
                        >
                            View Tagged Vendors (7)
                        </Button> */}
                    </div>

                    {/* Wedding Details */}
                    <div className="mt-6 space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{weddingData.location}</span>
                        </div>
                        <div className="text-gray-600">
                            {formatDateShort(weddingData.weddingDate)}
                        </div>
                        <p className="text-gray-700 mt-4">
                            {weddingData.description}{" "}
                            <span className="text-pink-600 cursor-pointer hover:underline">Read Blog</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Photo Gallery Section */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                <h2 className="text-2xl font-serif text-gray-800 mb-6">Photo Gallery</h2>

                {/* Gallery Tabs */}
                <div className="flex gap-8 mb-8 border-b">
                    <button
                        onClick={() => setActiveTab("top-photos")}
                        className={`pb-3 px-1 font-medium ${activeTab === "top-photos"
                            ? "text-[#212D47] border-b-2 border-[#212D47]"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        TOP PHOTOS
                    </button>
                    <button
                        onClick={() => setActiveTab("all-functions")}
                        className={`pb-3 px-1 font-medium ${activeTab === "all-functions"
                            ? "text-[#212D47] border-b-2 border-[#212D47]"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        ALL FUNCTIONS
                    </button>
                </div>

                {/* Photo Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(activeTab === "top-photos" ? topPhotos : allFunctions).map((photo: { src: string; alt: string }, index: number) => (
                        <div key={index} className="aspect-square overflow-hidden">
                            <Image
                                src={photo.src || "/placeholder.svg"}
                                alt={photo.alt}
                                height={110}
                                width={110}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
