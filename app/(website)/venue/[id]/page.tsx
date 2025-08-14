"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import { Star, MapPin, Phone, Mail, Globe, Clock, Users, Wifi, Car, Coffee, Dumbbell, Waves, Utensils,} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { fetchHotelById, selectSelectedHotel, selectHotelLoading, selectHotelError,} from "@/lib/redux/features/hotelSlice"

// Mock hotel fallback
const mockHotel = {
    id: "1",
    name: "Grand Oceanview Resort",
    category: "Luxury Resort",
    location: {
        address: "123 Ocean Drive",
        city: "Miami Beach",
        state: "Florida",
        country: "USA",
        zipCode: "33139",
    },
    priceRange: {
        startingPrice: 2999,
        currency: "INR" as const,
    },
    rating: 4.8,
    status: "active" as const,
    description:
        "Experience luxury at its finest with breathtaking ocean views, world-class amenities, and exceptional service. Our resort offers the perfect blend of relaxation and adventure, making it an ideal destination for both leisure and business travelers.",
    amenities: [
        "Free WiFi",
        "Swimming Pool",
        "Fitness Center",
        "Spa",
        "Restaurant",
        "Bar",
        "Parking",
        "Room Service",
        "Concierge",
        "Beach Access",
    ],
    rooms: [
        {
            type: "Ocean View Suite",
            capacity: 4,
            pricePerNight: 2999,
            available: 5,
        },
        {
            type: "Deluxe Room",
            capacity: 2,
            pricePerNight: 1999,
            available: 12,
        },
    ],
    images: [
        "/placeholder.svg?height=600&width=800",
        "/placeholder.svg?height=600&width=800",
    ],
    contactInfo: {
        phone: "+1 (305) 555-0123",
        email: "info@grandoceanview.com",
        website: "www.grandoceanview.com",
    },
    policies: {
        checkIn: "3:00 PM",
        checkOut: "11:00 AM",
        cancellation: "Free cancellation up to 24 hours before check-in",
    },
}

const amenityIcons: Record<string, any> = {
    "Free WiFi": Wifi,
    "Swimming Pool": Waves,
    "Fitness Center": Dumbbell,
    Restaurant: Utensils,
    Parking: Car,
    "Room Service": Coffee,
}

interface HotelDetailPageProps {
    params: {
        hotelId: string
    }
}

export default function HotelDetailPage({ params }: HotelDetailPageProps) {
    const { hotelId } = params
    const dispatch = useDispatch<any>()
    const selectedHotel = useSelector(selectSelectedHotel)
    const loading = useSelector(selectHotelLoading)
    const error = useSelector(selectHotelError)

    const [hotel, setHotel] = useState(mockHotel)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [selectedRoom, setSelectedRoom] = useState(mockHotel.rooms[0])

    // Fetch hotel from slice
    useEffect(() => {
        if (hotelId) {
            dispatch(fetchHotelById(hotelId))
        }
    }, [hotelId, dispatch])

    // Update local state when selectedHotel changes
    useEffect(() => {
        if (selectedHotel) {
            const updatedHotel = {
                ...selectedHotel,
                priceRange: {
                    ...selectedHotel.priceRange,
                    currency: "INR" as const, // force literal type
                },
                status: selectedHotel.status as "active" | "draft" | "archived",
            } as typeof mockHotel // cast the whole object to match your state
            setHotel(updatedHotel)
            setSelectedRoom(updatedHotel.rooms[0])
        }
    }, [selectedHotel])


    if (loading) return <div className="text-center py-20">Loading...</div>
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>

    return (
        <div className="min-h-screen" style={{ backgroundColor: "color-mix(in oklab, #fafafa 80%, transparent)" }}>
            {/* Hero Section */}
            <motion.div
                className="relative h-[70vh] overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <motion.img
                    key={selectedImageIndex}
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    src={hotel.images[selectedImageIndex]}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#212D47]/80 via-[#212D47]/20 to-transparent" />

                {/* Image navigation */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {hotel.images.map((_, index) => (
                        <motion.button
                            key={index}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all ${index === selectedImageIndex ? "bg-pink-400 shadow-lg" : "bg-white/50 hover:bg-white/70"}`}
                        />
                    ))}
                </div>

                {/* Hotel Info */}
                <motion.div
                    className="absolute bottom-8 left-8 text-white"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <Badge className="mb-3 bg-pink-500/90 text-white border-0">{hotel.category}</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">{hotel.name}</h1>
                    <div className="flex items-center gap-4 text-lg">
                        <div className="flex items-center gap-1">
                            <MapPin className="w-5 h-5 text-pink-400" />
                            <span>{hotel.location.city}, {hotel.location.state}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            <span className="font-semibold">{hotel.rating}</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}>
                            <h2 className="text-2xl font-bold text-[#212D47] mb-4">About This Hotel</h2>
                            <p className="text-gray-700 leading-relaxed text-lg">{hotel.description}</p>
                        </motion.div>

                        {/* Amenities */}
                        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}>
                            <h2 className="text-2xl font-bold text-[#212D47] mb-6">Amenities</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {hotel.amenities.map((amenity, index) => {
                                    const IconComponent = amenityIcons[amenity] || Coffee
                                    return (
                                        <motion.div
                                            key={amenity}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                                            whileHover={{ scale: 1.05 }}
                                            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                                        >
                                            <IconComponent className="w-5 h-5 text-[#212D47]" />
                                            <span className="text-gray-700 font-medium">{amenity}</span>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </motion.div>

                        {/* Rooms */}
                        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7, duration: 0.6 }}>
                            <h2 className="text-2xl font-bold text-[#212D47] mb-6">Room Types</h2>
                            <div className="space-y-4">
                                {hotel.rooms.map((room, index) => (
                                    <motion.div
                                        key={room.type}
                                        initial={{ x: -30, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => setSelectedRoom(room)}
                                        className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${selectedRoom.type === room.type ? "border-pink-200 bg-pink-50" : "border-gray-200 bg-white hover:border-[#212D47]/30"}`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-xl font-semibold text-[#212D47]">{room.type}</h3>
                                            <Badge variant={room.available > 0 ? "default" : "destructive"}>{room.available} available</Badge>
                                        </div>
                                        <div className="flex items-center gap-6 text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                <span>Up to {room.capacity} guests</span>
                                            </div>
                                            <div className="text-2xl font-bold text-[#212D47]">
                                                ₹ {room.pricePerNight}
                                                <span className="text-sm font-normal text-gray-500">/night</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Booking Card */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }}>
                            <Card className="sticky top-6 border-2 border-[#212D47]/10">
                                <CardContent className="p-4">
                                    <div className="text-center mb-6">
                                        <div className="text-4xl font-bold text-[#212D47] mb-1">₹ {hotel.priceRange.startingPrice}</div>
                                        <div className="text-gray-500 font-semibold">per night</div>
                                    </div>
                                    <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white">Book Now</Button>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Contact Info */}
                        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7, duration: 0.6 }}>
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-xl font-bold text-[#212D47] mb-4">Contact Information</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-5 h-5 text-pink-500" />
                                            <span className="text-gray-700">{hotel.contactInfo.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-pink-500" />
                                            <span className="text-gray-700">{hotel.contactInfo.email}</span>
                                        </div>
                                        {hotel.contactInfo.website && (
                                            <div className="flex items-center gap-3">
                                                <Globe className="w-5 h-5 text-pink-500" />
                                                <span className="text-gray-700">{hotel.contactInfo.website}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Policies */}
                        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, duration: 0.6 }}>
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-xl font-bold text-[#212D47] mb-4">Hotel Policies</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <Clock className="w-5 h-5 text-pink-500 mt-0.5" />
                                            <div>
                                                <div className="font-medium text-gray-900">Check-in: {hotel.policies.checkIn}</div>
                                                <div className="font-medium text-gray-900">Check-out: {hotel.policies.checkOut}</div>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600 mt-3">{hotel.policies.cancellation}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
