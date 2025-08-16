"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Star, MapPin, Phone, Mail, Globe, Clock, Users, Wifi, Car, Coffee, Dumbbell, Waves, Utensils, ArrowLeft, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAppDispatch, useAppSelector } from "@/lib/redux/store"
import { 
  fetchHotelById, 
  selectSelectedHotel, 
  selectHotelLoading, 
  selectHotelError,
  clearSelectedHotel,
  clearError
} from "@/lib/redux/features/hotelSlice"

// Default venue images
const DEFAULT_VENUE_IMAGES = [
    "/images/venue/1.jpg",
    "/images/venue/2.jpg",
    "/images/venue/3.jpg",
    "/images/venue/4.jpg",
    "/images/venue/5.jpg",
];

const amenityIcons: Record<string, any> = {
    "Free WiFi": Wifi,
    "WiFi": Wifi,
    "Swimming Pool": Waves,
    "Fitness Center": Dumbbell,
    "Restaurant": Utensils,
    "Parking": Car,
    "Room Service": Coffee,
    "Air Conditioning": Coffee,
}

interface ContactFormData {
  name: string
  email: string
  phone: string
  checkIn: string
  checkOut: string
  guests: string
  roomType: string
  message: string
}

export default function HotelDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const dispatch = useAppDispatch()
    
    // Redux state
    const hotel = useAppSelector(selectSelectedHotel)
    const loading = useAppSelector(selectHotelLoading)
    const error = useAppSelector(selectHotelError)
    
    // Define room type interface
    interface Room {
        type: string;
        capacity: number;
        pricePerNight: number;
        available: number;
    }

    // Local state
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
    const [formData, setFormData] = useState<ContactFormData>({
      name: '',
      email: '',
      phone: '',
      checkIn: '',
      checkOut: '',
      guests: '2',
      roomType: '',
      message: ''
    })
    const [formLoading, setFormLoading] = useState(false)
    const [formSubmitted, setFormSubmitted] = useState(false)

    // Fetch hotel data on mount
    useEffect(() => {
        const hotelId = params.id as string
        if (hotelId) {
            dispatch(fetchHotelById(hotelId))
        }
        
        // Cleanup on unmount
        return () => {
            dispatch(clearSelectedHotel())
        }
    }, [params.id, dispatch])

    // Set selected room when hotel data loads
    useEffect(() => {
        if (hotel?.rooms && hotel.rooms.length > 0) {
            const firstRoom: Room = {
                type: hotel.rooms[0].type,
                capacity: hotel.rooms[0].capacity,
                pricePerNight: hotel.rooms[0].pricePerNight,
                available: hotel.rooms[0].available
            };
            setSelectedRoom(firstRoom);
            setFormData(prev => ({ ...prev, roomType: firstRoom.type }));
        }
    }, [hotel])

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Handle form submission
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormLoading(true)
        
        try {
            // Simulate API call - replace with actual API endpoint
            await new Promise(resolve => setTimeout(resolve, 2000))
            console.log('Form submitted:', { ...formData, hotelId: hotel?.id })
            setFormSubmitted(true)
        } catch (err) {
            console.error('Form submission error:', err)
        } finally {
            setFormLoading(false)
        }
    }

    // Handle retry on error
    const handleRetry = () => {
        dispatch(clearError())
        const hotelId = params.id as string
        if (hotelId) {
            dispatch(fetchHotelById(hotelId))
        }
    }

    // Loading skeleton
    if (loading) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: "color-mix(in oklab, #fafafa 80%, transparent)" }}>
                {/* Hero Skeleton */}
                <Skeleton className="h-[70vh] w-full" />
                
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="space-y-4">
                                <Skeleton className="h-8 w-64" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        </div>
                        <div>
                            <Skeleton className="h-64 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "color-mix(in oklab, #fafafa 80%, transparent)" }}>
                <div className="text-center space-y-4">
                    <Alert className="max-w-md">
                        <AlertDescription>
                            {error}
                        </AlertDescription>
                    </Alert>
                    <div className="space-x-4">
                        <Button onClick={() => router.back()} variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </Button>
                        <Button onClick={handleRetry}>
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // Hotel not found
    if (!hotel && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "color-mix(in oklab, #fafafa 80%, transparent)" }}>
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-gray-900">Hotel Not Found</h1>
                    <p className="text-gray-600">The hotel you're looking for doesn't exist or has been removed.</p>
                    <Button onClick={() => router.back()} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: "color-mix(in oklab, #fafafa 80%, transparent)" }}>
            {/* Back Button */}
            <div className="absolute top-6 left-6 z-10">
                <Button 
                    onClick={() => router.back()} 
                    variant="outline" 
                    size="sm"
                    className="bg-white/90 hover:bg-white"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
            </div>

            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative h-[70vh] overflow-hidden"
            >
                <motion.img
                    key={selectedImageIndex}
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    src={hotel?.images?.[selectedImageIndex] || DEFAULT_VENUE_IMAGES[selectedImageIndex] || "/placeholder.svg?height=600&width=800"}
                    alt={hotel?.name || "Hotel"}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#212D47]/80 via-[#212D47]/20 to-transparent" />

                {/* Image Navigation */}
                {hotel?.images && hotel.images.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {hotel.images.map((_, index) => (
                            <motion.button
                                key={index}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setSelectedImageIndex(index)}
                                className={`w-3 h-3 rounded-full transition-all ${index === selectedImageIndex ? "bg-pink-400 shadow-lg" : "bg-white/50 hover:bg-white/70"
                                    }`}
                            />
                        ))}
                    </div>
                )}

                {/* Hotel Info Overlay */}
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="absolute bottom-8 left-8 text-white"
                >
                    <Badge className="mb-3 bg-pink-500/90 text-white border-0">{hotel?.category}</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">{hotel?.name}</h1>
                    <div className="flex items-center gap-4 text-lg">
                        <div className="flex items-center gap-1">
                            <MapPin className="w-5 h-5 text-pink-400" />
                            <span>
                                {hotel?.location.city}, {hotel?.location.state}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            <span className="font-semibold">{hotel?.rating}</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        >
                            <h2 className="text-2xl font-bold text-[#212D47] mb-4">About This Hotel</h2>
                            <p className="text-gray-700 leading-relaxed text-lg">{hotel?.description}</p>
                        </motion.div>

                        {/* Amenities */}
                        {hotel?.amenities && hotel.amenities.length > 0 && (
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                            >
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
                        )}

                        {/* Room Types */}
                        {hotel?.rooms && hotel.rooms.length > 0 && (
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.7, duration: 0.6 }}
                            >
                                <h2 className="text-2xl font-bold text-[#212D47] mb-6">Room Types</h2>
                                <div className="space-y-4">
                                    {hotel.rooms.map((room, index) => (
                                        <motion.div
                                            key={room.type}
                                            initial={{ x: -30, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => {
                                                setSelectedRoom(room)
                                                setFormData(prev => ({ ...prev, roomType: room.type }))
                                            }}
                                            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${selectedRoom?.type === room.type
                                                    ? "border-pink-200 bg-pink-50"
                                                    : "border-gray-200 bg-white hover:border-[#212D47]/30"
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="text-xl font-semibold text-[#212D47]">{room.type}</h3>
                                                <Badge variant={room.available > 0 ? "default" : "destructive"}>
                                                    {room.available} available
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-6 text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4" />
                                                    <span>Up to {room.capacity} guests</span>
                                                </div>
                                                <div className="text-2xl font-bold text-[#212D47]">
                                                    ₹ {room.pricePerNight.toLocaleString()}
                                                    <span className="text-sm font-normal text-gray-500">/night</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Pricing Card */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                        >
                            <Card className="sticky top-6 border-2 border-[#212D47]/10">
                                <CardContent className="p-6">
                                    <div className="text-center mb-6">
                                        <div className="text-4xl font-bold text-[#212D47] mb-1">
                                            ₹ {hotel?.priceRange.startingPrice.toLocaleString()}
                                        </div>
                                        <div className="text-gray-500 font-medium">starting from per night</div>
                                    </div>
                                    <Button 
                                        className="w-full bg-[#212D47] hover:bg-[#212D47]/90 text-white"
                                        onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                                    >
                                        Book Now
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Contact Info */}
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7, duration: 0.6 }}
                        >
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-xl font-bold text-[#212D47] mb-4">Contact Information</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-5 h-5 text-pink-500" />
                                            <span className="text-gray-700">{hotel?.contactInfo.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-pink-500" />
                                            <span className="text-gray-700">{hotel?.contactInfo.email}</span>
                                        </div>
                                        {hotel?.contactInfo.website && (
                                            <div className="flex items-center gap-3">
                                                <Globe className="w-5 h-5 text-pink-500" />
                                                <span className="text-gray-700">{hotel?.contactInfo.website}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Policies */}
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                        >
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-xl font-bold text-[#212D47] mb-4">Hotel Policies</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <Clock className="w-5 h-5 text-pink-500 mt-0.5" />
                                            <div>
                                                <div className="font-medium text-gray-900">Check-in: {hotel?.policies.checkIn}</div>
                                                <div className="font-medium text-gray-900">Check-out: {hotel?.policies.checkOut}</div>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600 mt-3">{hotel?.policies.cancellation}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>

                {/* Contact Form */}
                <motion.div
                    id="contact-form"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                    className="mt-16"
                >
                    <Card className="max-w-4xl mx-auto">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-[#212D47] text-center">
                                Request a Booking
                            </CardTitle>
                            <p className="text-center text-gray-600">
                                Fill out the form below and we'll get back to you within 24 hours
                            </p>
                        </CardHeader>
                        <CardContent className="p-6">
                            {formSubmitted ? (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-center py-12"
                                >
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Send className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h3>
                                    <p className="text-gray-600 mb-6">Your inquiry has been submitted successfully. We'll contact you soon!</p>
                                    <Button 
                                        onClick={() => setFormSubmitted(false)}
                                        variant="outline"
                                    >
                                        Submit Another Inquiry
                                    </Button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleFormSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name *</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email *</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Enter your email address"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="Enter your phone number"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="guests">Number of Guests</Label>
                                            <Input
                                                id="guests"
                                                name="guests"
                                                type="number"
                                                min="1"
                                                value={formData.guests}
                                                onChange={handleInputChange}
                                                placeholder="2"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="checkIn">Check-in Date</Label>
                                            <Input
                                                id="checkIn"
                                                name="checkIn"
                                                type="date"
                                                value={formData.checkIn}
                                                onChange={handleInputChange}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="checkOut">Check-out Date</Label>
                                            <Input
                                                id="checkOut"
                                                name="checkOut"
                                                type="date"
                                                value={formData.checkOut}
                                                onChange={handleInputChange}
                                                min={formData.checkIn || new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="roomType">Preferred Room Type</Label>
                                            <select
                                                id="roomType"
                                                name="roomType"
                                                value={formData.roomType}
                                                onChange={handleInputChange}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="">Select room type</option>
                                                {hotel?.rooms.map((room) => (
                                                    <option key={room.type} value={room.type}>
                                                        {room.type} - ₹{room.pricePerNight.toLocaleString()}/night
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">Special Requests or Questions</Label>
                                        <Textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            rows={4}
                                            placeholder="Let us know if you have any special requests or questions..."
                                        />
                                    </div>

                                    <Button 
                                        type="submit" 
                                        className="w-full bg-[#212D47] hover:bg-[#212D47]/90 text-white"
                                        disabled={formLoading}
                                    >
                                        {formLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4 mr-2" />
                                                Submit Inquiry
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}