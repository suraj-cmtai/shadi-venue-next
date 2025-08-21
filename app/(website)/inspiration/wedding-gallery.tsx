'use client';

import { Heart, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/lib/redux/store"
import { fetchActiveWeddings, selectActiveWeddingsList, selectIsLoading, WeddingItem } from "@/lib/redux/features/weddingSlice"

interface WeddingGallery {
    id: string
    coupleNames: string
    location: string
    photoCount: number
    images: {
        main: string
        thumbnail1: string
        thumbnail2: string
    }
}

// Sample data for fallback
const sampleWeddingGalleries: WeddingGallery[] = [
    {
        id: "1",
        coupleNames: "Richa and Shreyas",
        location: "Delhi NCR",
        photoCount: 30,
        images: {
            main: "/images/wedding/wed3.jpg",
            thumbnail1: "/images/wedding/wed4.jpg",
            thumbnail2: "/images/wedding/wed5.jpg",
        },
    },
    {
        id: "2",
        coupleNames: "Pooja and Arjun",
        location: "Coorg",
        photoCount: 35,
        images: {
            main: "/images/wedding/wed3.jpg",
            thumbnail1: "/images/wedding/wed4.jpg",
            thumbnail2: "/images/wedding/wed5.jpg",
        },
    },
    {
        id: "3",
        coupleNames: "Shweta and Roshan",
        location: "Kollam",
        photoCount: 107,
        images: {
            main: "/images/wedding/wed3.jpg",
            thumbnail1: "/images/wedding/wed4.jpg",
            thumbnail2: "/images/wedding/wed5.jpg",
        },
    },
]

export default function WeddingGallery() {
    const dispatch = useDispatch<AppDispatch>();
    const activeWeddings = useSelector(selectActiveWeddingsList);
    const isLoading = useSelector(selectIsLoading);
    const [filteredWeddings, setFilteredWeddings] = useState<WeddingGallery[]>([]);
    const [selectedCity, setSelectedCity] = useState("all-cities");
    const [selectedTheme, setSelectedTheme] = useState("all-themes");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        dispatch(fetchActiveWeddings());
    }, [dispatch]);

    useEffect(() => {
        // Convert Redux data to local format or use sample data
        const weddings = activeWeddings.length > 0 
            ? activeWeddings.map((wedding: WeddingItem) => ({
                id: wedding.id,
                coupleNames: wedding.coupleNames,
                location: wedding.location,
                photoCount: wedding.photoCount,
                images: {
                    main: wedding.images?.main || "/images/wedding/wed3.jpg",
                    thumbnail1: wedding.images?.thumbnail1 || "/images/wedding/wed4.jpg",
                    thumbnail2: wedding.images?.thumbnail2 || "/images/wedding/wed5.jpg",
                }
            }))
            : sampleWeddingGalleries;

        setFilteredWeddings(weddings);
    }, [activeWeddings]);

    // Filter weddings based on search and filters
    const filteredResults = filteredWeddings.filter((wedding: WeddingGallery) => {
        const matchesCity = selectedCity === "all-cities" || wedding.location.toLowerCase().includes(selectedCity.toLowerCase());
        // For now, theme filtering is disabled since we don't have theme data in the interface
        const matchesTheme = selectedTheme === "all-themes";
        const matchesSearch = searchQuery === "" || 
            wedding.coupleNames.toLowerCase().includes(searchQuery.toLowerCase()) ||
            wedding.location.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesCity && matchesTheme && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-white">
            {/* Header Navigation */}
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-3">
                <div className="max-w-5xl mx-auto flex items-center gap-10">
                    {/* Dropdown Filters */}
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                        <SelectTrigger className="w-50 bg-white border-gray-300">
                            <SelectValue placeholder="All Cities" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all-cities">All Cities</SelectItem>
                            <SelectItem value="delhi">Delhi NCR</SelectItem>
                            <SelectItem value="mumbai">Mumbai</SelectItem>
                            <SelectItem value="agra">Agra</SelectItem>
                            <SelectItem value="amritsar">Amritsar</SelectItem>
                            <SelectItem value="bangalore">Bangalore</SelectItem>
                        </SelectContent>
                    </Select>

                   
                    <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                        <SelectTrigger className="w-60 bg-white border-gray-300">
                            <SelectValue placeholder="All Themes" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all-themes">All Themes</SelectItem>
                            <SelectItem value="traditional">Traditional</SelectItem>
                            <SelectItem value="modern">Modern</SelectItem>
                            <SelectItem value="international">International</SelectItem>
                            <SelectItem value="intimate&minimalist">Intimate & Minimalist</SelectItem>
                            <SelectItem value="destination">Destination</SelectItem>
                            <SelectItem value="grand&luxurious">Grand & Luxurious</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-md">
                        <Input
                            type="text"
                            placeholder="Search by vendors, bride/groom"
                            className="w-full bg-white border-gray-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
               
                {/* Results Counter */}
                <div className="mb-6">
                    <p className="text-gray-700 font-medium">
                        {isLoading ? "Loading..." : `Showing ${filteredResults.length} results in All Cities`}
                    </p>
                </div>

                {/* Wedding Gallery Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 h-64 mb-2 rounded-lg"></div>
                                <div className="grid grid-cols-2 gap-2 h-32 mb-4">
                                    <div className="bg-gray-200 rounded-lg"></div>
                                    <div className="bg-gray-200 rounded-lg"></div>
                                </div>
                                <div className="text-center">
                                    <div className="bg-gray-200 h-6 mb-2 rounded"></div>
                                    <div className="bg-gray-200 h-4 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredResults.map((wedding: WeddingGallery) => (
                        // Wrapped wedding card in Link component for navigation to detail page
                        <Link key={wedding.id} href={`/inspiration/${wedding.id}`}>
                            <div className="group cursor-pointer">
                                {/* Image Grid */}
                                <div className="relative mb-4">
                                    {/* Main Image */}
                                    <div className="relative h-64 mb-2">
                                        <Image
                                            src={wedding.images.main || "/placeholder.svg"}
                                            alt={`${wedding.coupleNames} wedding`}
                                            height={110}
                                            width={110}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                       
                                    </div>

                                    {/* Thumbnail Images */}
                                    <div className="grid grid-cols-2 gap-2 h-32">
                                        <div className="relative">
                                            <Image
                                                src={wedding.images.thumbnail1 || "/placeholder.svg"}
                                                alt={`${wedding.coupleNames} wedding photo`}
                                                height={110}
                                                width={110}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Image
                                                src={wedding.images.thumbnail2 || "/placeholder.svg"}
                                                alt={`${wedding.coupleNames} wedding photo`}
                                                className="w-full h-full object-cover rounded-lg"
                                                height={110}
                                                width={110}
                                            />
                                            {/* Photo Count Overlay */}
                                            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                                <span className="text-white font-medium">{wedding.photoCount} Photos</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Wedding Info */}
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{wedding.coupleNames}</h3>
                                    <div className="flex items-center justify-center gap-1 text-gray-600">
                                        <MapPin className="w-4 h-4" />
                                        <span className="text-sm">{wedding.location}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                    </div>
                )}
            </div>
        </div>
    )
}
