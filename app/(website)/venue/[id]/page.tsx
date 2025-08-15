"use client"

import { ReactNode, useState } from "react"
import { motion } from "framer-motion"
import { Star, MapPin, Phone, Mail, Globe, Clock, Users, Wifi, Car, Coffee, Dumbbell, Waves, Utensils,} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

// Define Hotel type
interface Hotel {
    id: string
    name: string
    category: string
    location: {
        address: string
        city: string
        state: string
        country: string
        zipCode: string
    }
    rating: number
    contact: {
        phone: string
        email: string
        website: string
    }
    priceRange: {
        currency: "INR" | "USD" | "EUR" | "GBP" | "AUD" | "CAD"
        startingPrice: number
    }
    amenities: string[]
    description: string
    checkInTime: string
    checkOutTime: string
    images: string[]
    capacity: number
    status: "active" | "draft" | "archived"
    signature?: string
}

// Example data
const hotelData: Hotel = {
    id: "h1",
    name: "Grand Palace Hotel",
    category: "luxury",
    location: {
        address: "123 Main St",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        zipCode: "400001",
    },
    rating: 4.5,
    contact: {
        phone: "+91 9876543210",
        email: "info@grandpalace.com",
        website: "https://grandpalace.com",
    },
    priceRange: {
        currency: "INR",
        startingPrice: 5000,
    },
    amenities: [
        "wifi",
        "parking",
        "restaurant",
        "gym",
        "pool",
        "breakfast",
    ],
    description:
        "Grand Palace Hotel offers luxury stays with world-class amenities and breathtaking city views.",
    checkInTime: "14:00",
    checkOutTime: "12:00",
    images: [
        "/images/hotel1.jpg",
        "/images/hotel2.jpg",
        "/images/hotel3.jpg",
    ],
    capacity: 200,
    status: "active",
}

// Icon mapping for amenities
const amenityIcons: Record<string, ReactNode> = {
    wifi: <Wifi className="w-5 h-5" />,
    parking: <Car className="w-5 h-5" />,
    restaurant: <Utensils className="w-5 h-5" />,
    gym: <Dumbbell className="w-5 h-5" />,
    pool: <Waves className="w-5 h-5" />,
    breakfast: <Coffee className="w-5 h-5" />,
}
export default function HotelDetailsPage() {
    const [hotel, setHotel] = useState<Hotel>(hotelData)

    return (
        <div className="container mx-auto p-6">
            {/* Hotel Header */}
            <div className="flex flex-col md:flex-row gap-6">
                {/* Hotel Images */}
                <div className="w-full md:w-1/2">
                    <motion.img
                        key={hotel.images[0]}
                        src={hotel.images[0]}
                        alt={hotel.name}
                        className="w-full h-80 object-cover rounded-xl shadow-lg"
                        initial={{ opacity: 0.5, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                {/* Hotel Info */}
                <div className="w-full md:w-1/2 flex flex-col justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{hotel.name}</h1>
                        <div className="flex items-center mt-2 space-x-2">
                            <Star className="text-yellow-500 w-5 h-5" />
                            <span>{hotel.rating} / 5</span>
                            <Badge variant="secondary" className="ml-2 capitalize">
                                {hotel.category}
                            </Badge>
                            <Badge variant="outline" className="ml-2 capitalize">
                                {hotel.status}
                            </Badge>
                        </div>
                        <p className="mt-4 text-gray-600">{hotel.description}</p>

                        <div className="flex items-center mt-4 space-x-3 text-gray-700">
                            <MapPin className="w-5 h-5" />
                            <span>
                                {hotel.location.address}, {hotel.location.city},{" "}
                                {hotel.location.state}, {hotel.location.country}{" "}
                                {hotel.location.zipCode}
                            </span>
                        </div>

                        <div className="flex items-center mt-2 space-x-3 text-gray-700">
                            <Phone className="w-5 h-5" /> <span>{hotel.contact.phone}</span>
                        </div>
                        <div className="flex items-center mt-2 space-x-3 text-gray-700">
                            <Mail className="w-5 h-5" /> <span>{hotel.contact.email}</span>
                        </div>
                        <div className="flex items-center mt-2 space-x-3 text-gray-700">
                            <Globe className="w-5 h-5" />{" "}
                            <a
                                href={hotel.contact.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                {hotel.contact.website}
                            </a>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            Book Now from {hotel.priceRange.currency}{" "}
                            {hotel.priceRange.startingPrice}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Amenities */}
            <div className="mt-10">
                <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {hotel.amenities.map((amenity) => (
                        <Card key={amenity}>
                            <CardContent className="flex items-center gap-3 py-4">
                                {amenityIcons[amenity]}
                                <span className="capitalize">{amenity}</span>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Check-in / Check-out */}
            <div className="mt-10">
                <h2 className="text-2xl font-semibold mb-4">Check-in & Check-out</h2>
                <div className="flex gap-6 text-gray-700">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5" /> Check-in: {hotel.checkInTime}
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5" /> Check-out: {hotel.checkOutTime}
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5" /> Capacity: {hotel.capacity} guests
                    </div>
                </div>
            </div>
        </div>
    )
}
