"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Star, MapPin, Phone, Mail, Globe, Clock, Users, Camera, ArrowLeft, Send, Award, Calendar, Heart, CheckCircle, CreditCard, DollarSign, Utensils, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAppDispatch, useAppSelector } from "@/lib/redux/store"
import { 
  fetchVendorById, 
  selectSelectedVendor, 
  selectVendorLoading, 
  selectVendorError,
  clearSelectedVendor,
  clearError
} from "@/lib/redux/features/vendorSlice"
import {
  createVendorEnquiry,
  selectVendorEnquiryLoading,
  selectVendorEnquiryError,
  clearError as clearEnquiryError,
  VendorEnquiryStatus
} from "@/lib/redux/features/vendorEnquirySlice"

// Default vendor images
const DEFAULT_VENDOR_IMAGES = [
    "/images/vendor/1.jpg",
    "/images/vendor/2.jpg",
    "/images/vendor/3.jpg",
    "/images/vendor/4.jpg",
    "/images/vendor/5.jpg",
];

// Category icon mapping
const categoryIconMap: Record<string, any> = {
  "Venue": MapPin,
  "Planner": Calendar,
  "Photographer": Camera,
  "Decorator": Heart,
  "Caterer": Users,
  "Makeup": Star,
  "Entertainment": Users,
  "Others": Users
}

// Payment mode icon mapping
const paymentIconMap: Record<string, any> = {
  "UPI": CreditCard,
  "Cash": DollarSign,
  "Bank Transfer": CreditCard,
  "Card": CreditCard,
  "Other": CreditCard
}

const getCategoryIcon = (category: string) => {
  return categoryIconMap[category] || Users;
}

const getPaymentIcon = (mode: string) => {
  return paymentIconMap[mode] || CreditCard;
}

interface EnquiryFormData {
  name: string
  phone: string
  email: string
}

export default function VendorDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const dispatch = useAppDispatch()
    
    // Redux state
    const vendor = useAppSelector(selectSelectedVendor)
    const loading = useAppSelector(selectVendorLoading)
    const error = useAppSelector(selectVendorError)

    // Vendor enquiry redux state
    const enquiryLoading = useAppSelector(selectVendorEnquiryLoading)
    const enquiryError = useAppSelector(selectVendorEnquiryError)
    const [enquirySuccess, setEnquirySuccess] = useState(false)

    // Local state
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [formData, setFormData] = useState<EnquiryFormData>({
      name: '',
      phone: '',
      email: ''
    })

    // Fetch vendor data on mount
    useEffect(() => {
        const vendorId = params.id as string
        if (vendorId) {
            dispatch(fetchVendorById(vendorId))
        }
        // Cleanup on unmount
        return () => {
            dispatch(clearSelectedVendor())
            setEnquirySuccess(false)
        }
    }, [params.id, dispatch])

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Handle form submission
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!vendor?.id) {
            console.error('Vendor authId not found')
            return
        }

        const enquiryData = {
            name: formData.name,
            email: formData.email || '', // Optional field
            phoneNumber: formData.phone,
            status: VendorEnquiryStatus.NEW,
            authId: vendor.id // Vendor authId
        }

        try {
            await dispatch(createVendorEnquiry(enquiryData)).unwrap()
            setEnquirySuccess(true)
            // Reset form
            setFormData({
                name: '',
                phone: '',
                email: ''
            })
        } catch (error) {
            // Error is handled by Redux
            console.error('Failed to submit enquiry:', error)
        }
    }

    // Handle retry on error
    const handleRetry = () => {
        dispatch(clearError())
        const vendorId = params.id as string
        if (vendorId) {
            dispatch(fetchVendorById(vendorId))
        }
    }

    // Handle enquiry error clear
    const handleClearEnquiryError = () => {
        dispatch(clearEnquiryError())
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

    // Vendor not found
    if (!vendor && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "color-mix(in oklab, #fafafa 80%, transparent)" }}>
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-gray-900">Vendor Not Found</h1>
                    <p className="text-gray-600">The vendor you're looking for doesn't exist or has been removed.</p>
                    <Button onClick={() => router.back()} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        )
    }

    // Get all available images
    const allImages = [
        ...(vendor?.portfolioImages || []),
        vendor?.coverImageUrl,
        vendor?.logoUrl
    ].filter(Boolean);

    // Use default images if no vendor images
    const displayImages = allImages.length > 0 ? allImages : DEFAULT_VENDOR_IMAGES;

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
                    src={displayImages[selectedImageIndex] || "/placeholder.svg?height=600&width=800"}
                    alt={vendor?.businessName || "Vendor"}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#212D47]/80 via-[#212D47]/20 to-transparent" />

                {/* Image Navigation */}
                {displayImages.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {displayImages.map((_, index) => (
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

                {/* Vendor Info Overlay */}
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="absolute bottom-8 left-8 text-white"
                >
                    <Badge className="mb-3 bg-pink-500/90 text-white border-0">{vendor?.category}</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">{vendor?.businessName}</h1>
                    <div className="flex items-center gap-4 text-lg">
                        <div className="flex items-center gap-1">
                            <MapPin className="w-5 h-5 text-pink-400" />
                            <span>
                                {vendor?.city}, {vendor?.state}
                            </span>
                        </div>
                        {vendor?.yearOfEstablishment && (
                            <div className="flex items-center gap-1">
                                <Calendar className="w-5 h-5 text-pink-400" />
                                <span>Est. {vendor?.yearOfEstablishment}</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* About Section */}
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        >
                            <h2 className="text-2xl font-bold text-[#212D47] mb-4">About {vendor?.businessName}</h2>
                            <p className="text-gray-700 leading-relaxed text-lg">{vendor?.about}</p>
                            
                            {vendor?.specialities && (
                                <div className="mt-4">
                                    <h4 className="font-semibold text-[#212D47] mb-2">Specialities</h4>
                                    <p className="text-gray-600">{vendor?.specialities}</p>
                                </div>
                            )}
                        </motion.div>

                        {/* Services Offered */}
                        {vendor?.servicesOffered && vendor.servicesOffered.length > 0 && (
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                            >
                                <h2 className="text-2xl font-bold text-[#212D47] mb-6">Services Offered</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {vendor.servicesOffered.map((service, index) => {
                                        const CategoryIcon = getCategoryIcon(vendor?.category || 'Others')
                                        return (
                                            <motion.div
                                                key={service}
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                                                whileHover={{ scale: 1.05 }}
                                                className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                                            >
                                                <CategoryIcon className="w-5 h-5 text-[#212D47]" />
                                                <span className="text-gray-700 font-medium">{service}</span>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {/* Facilities Available (for Venue vendors) */}
                        {vendor?.facilitiesAvailable && vendor.facilitiesAvailable.length > 0 && (
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6, duration: 0.6 }}
                            >
                                <h2 className="text-2xl font-bold text-[#212D47] mb-6">Facilities Available</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {vendor.facilitiesAvailable.map((facility, index) => {
                                        const facilityIcons: Record<string, any> = {
                                            "Rooms": Users,
                                            "Parking": Car,
                                            "Catering": Utensils,
                                            "Decor": Heart,
                                            "DJ": Users,
                                            "Liquor License": Clock,
                                            "Pool": Star,
                                            "Other": Star
                                        };
                                        const IconComponent = facilityIcons[facility] || Star;
                                        return (
                                            <motion.div
                                                key={facility}
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                                                whileHover={{ scale: 1.05 }}
                                                className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                                            >
                                                <IconComponent className="w-5 h-5 text-[#212D47]" />
                                                <span className="text-gray-700 font-medium">{facility}</span>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {/* Service Areas */}
                        {vendor?.serviceAreas && vendor.serviceAreas.length > 0 && (
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.7, duration: 0.6 }}
                            >
                                <h2 className="text-2xl font-bold text-[#212D47] mb-6">Service Areas</h2>
                                <div className="flex flex-wrap gap-3">
                                    {vendor.serviceAreas.map((area, index) => (
                                        <motion.div
                                            key={area}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                                        >
                                            <Badge variant="outline" className="text-sm py-2 px-4">
                                                <MapPin className="w-4 h-4 mr-2" />
                                                {area}
                                            </Badge>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Awards & Recognition */}
                        {vendor?.awards && (
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.8, duration: 0.6 }}
                            >
                                <h2 className="text-2xl font-bold text-[#212D47] mb-4">Awards & Recognition</h2>
                                <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                                    <Award className="w-6 h-6 text-yellow-600" />
                                    <p className="text-gray-700">{vendor.awards}</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Notable Clients */}
                        {vendor?.notableClients && (
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.9, duration: 0.6 }}
                            >
                                <h2 className="text-2xl font-bold text-[#212D47] mb-4">Notable Clients</h2>
                                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                    <Users className="w-6 h-6 text-blue-600" />
                                    <p className="text-gray-700">{vendor.notableClients}</p>
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
                                            ₹ {vendor?.startingPrice?.toLocaleString()}
                                        </div>
                                        <div className="text-gray-500 font-medium">starting price</div>
                                        {vendor?.guestCapacityMin && vendor?.guestCapacityMax && (
                                            <div className="text-sm text-gray-600 mt-2">
                                                For {vendor.guestCapacityMin} - {vendor.guestCapacityMax} guests
                                            </div>
                                        )}
                                    </div>
                                    
                                    {vendor?.advancePaymentPercent && (
                                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                            <div className="text-sm text-gray-600">Advance Payment Required</div>
                                            <div className="font-semibold text-[#212D47]">{vendor.advancePaymentPercent}%</div>
                                        </div>
                                    )}
                                    
                                    <Button 
                                        className="w-full bg-[#212D47] hover:bg-[#212D47]/90 text-white"
                                        onClick={() => document.getElementById('enquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
                                    >
                                        Send Enquiry
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
                                            <Users className="w-5 h-5 text-pink-500" />
                                            <div>
                                                <div className="font-medium">{vendor?.contactPersonName}</div>
                                                <div className="text-sm text-gray-600">{vendor?.designation}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-5 h-5 text-pink-500" />
                                            <span className="text-gray-700">{vendor?.mobileNumber}</span>
                                            {vendor?.mobileVerified && (
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            )}
                                        </div>
                                        {vendor?.whatsappNumber && (
                                            <div className="flex items-center gap-3">
                                                <Phone className="w-5 h-5 text-green-500" />
                                                <span className="text-gray-700">{vendor?.whatsappNumber} (WhatsApp)</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-pink-500" />
                                            <span className="text-gray-700">{vendor?.email}</span>
                                        </div>
                                        {vendor?.websiteOrSocial && (
                                            <div className="flex items-center gap-3">
                                                <Globe className="w-5 h-5 text-pink-500" />
                                                <span className="text-gray-700">{vendor?.websiteOrSocial}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Payment Information */}
                        {vendor?.paymentModesAccepted && vendor.paymentModesAccepted.length > 0 && (
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.8, duration: 0.6 }}
                            >
                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="text-xl font-bold text-[#212D47] mb-4">Payment Options</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {vendor.paymentModesAccepted.map((mode, index) => {
                                                const PaymentIcon = getPaymentIcon(mode);
                                                return (
                                                    <div key={mode} className="flex items-center gap-2">
                                                        <PaymentIcon className="w-4 h-4 text-green-600" />
                                                        <span className="text-sm text-gray-700">{mode}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        
                                        {vendor?.refundPolicy && (
                                            <div className="mt-4 pt-4 border-t">
                                                <h4 className="font-semibold text-[#212D47] mb-2">Refund Policy</h4>
                                                <p className="text-sm text-gray-600">{vendor.refundPolicy}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Enquiry Form */}
                <motion.div
                    id="enquiry-form"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                    className="mt-16"
                >
                    <Card className="max-w-2xl mx-auto">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-[#212D47] text-center">
                                Send Enquiry
                            </CardTitle>
                            <p className="text-center text-gray-600">
                                Get in touch with {vendor?.businessName} directly
                            </p>
                        </CardHeader>
                        <CardContent className="p-6">
                            {enquirySuccess ? (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-center py-12"
                                >
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Send className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Enquiry Sent!</h3>
                                    <p className="text-gray-600 mb-6">Your enquiry has been sent to the vendor. They will contact you soon!</p>
                                    <Button 
                                        onClick={() => {
                                            setFormData({
                                                name: '',
                                                phone: '',
                                                email: ''
                                            })
                                            setEnquirySuccess(false)
                                        }}
                                        variant="outline"
                                    >
                                        Send Another Enquiry
                                    </Button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleFormSubmit} className="space-y-6">
                                    {enquiryError && (
                                        <Alert variant="destructive">
                                            <AlertDescription className="flex items-center justify-between">
                                                {enquiryError}
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={handleClearEnquiryError}
                                                    className="h-auto p-1 ml-2"
                                                >
                                                    ✕
                                                </Button>
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="name">Name *</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Your Full Name"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">Phone Number *</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Your Phone Number"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label htmlFor="email">Email (Optional)</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-[#212D47] hover:bg-[#212D47]/90 text-white"
                                        disabled={enquiryLoading}
                                    >
                                        {enquiryLoading ? "Sending..." : "Send Enquiry"}
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