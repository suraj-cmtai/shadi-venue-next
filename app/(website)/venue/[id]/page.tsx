"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Users,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Waves, 
  Utensils,
  ArrowLeft,
  Send,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import {
  fetchHotelById,
  selectSelectedHotel,
  selectHotelLoading,
  selectHotelError,
  clearSelectedHotel,
  clearError,
  fetchActiveHotels,
  selectActiveHotels,
} from "@/lib/redux/features/hotelSlice";
import {
  createHotelEnquiry,
  selectHotelEnquiryLoading,
  selectHotelEnquiryError,
  selectHotelEnquiries,
} from "@/lib/redux/features/hotelEnquirySlice";

// Default venue images
const DEFAULT_VENUE_IMAGES = [
  "/images/venue/1.jpg",
  "/images/venue/2.jpg",
  "/images/venue/3.jpg",
  "/images/venue/4.jpg",
  "/images/venue/5.jpg",
];

// Amenity helpers (case-insensitive mapping + graceful fallback)
const amenityIconMap: Record<string, any> = {
  wifi: Wifi,
  "free wifi": Wifi,
  pool: Waves,
  "swimming pool": Waves,
  spa: Waves,
  "fitness center": Dumbbell,
  gym: Dumbbell,
  restaurant: Utensils,
  dining: Utensils,
  parking: Car,
  "room service": Coffee,
  "air conditioning": Info,
  "airport shuttle": Car,
  concierge: Users,
  laundry: Info,
  conference: Info,
  "business center": Info,
};

const getAmenityIcon = (amenity: string) => {
  const key = amenity?.toLowerCase() || "";
  if (amenityIconMap[key]) return amenityIconMap[key];
  for (const k of Object.keys(amenityIconMap)) {
    if (key.includes(k)) return amenityIconMap[k];
  }
  return Info;
};

const toTitleCase = (value: string) =>
  value.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());

interface EnquiryFormData {
  name: string;
  phoneNumber: string;
  email: string;
}

export default function HotelDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Redux state
  const hotel = useAppSelector(selectSelectedHotel);
  const loading = useAppSelector(selectHotelLoading);
  const error = useAppSelector(selectHotelError);

  // Hotel enquiry redux state
  const enquiryLoading = useAppSelector(selectHotelEnquiryLoading);
  const enquiryError = useAppSelector(selectHotelEnquiryError);
  const hotelEnquiries = useAppSelector(selectHotelEnquiries);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const allHotels = useAppSelector(selectActiveHotels) || [];

  // Local state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [formData, setFormData] = useState<EnquiryFormData>({
    name: "",
    phoneNumber: "",
    email: "",
  });
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Fetch hotel data on mount
  useEffect(() => {
    const hotelId = params.id as string;
    if (hotelId) {
      dispatch(fetchHotelById(hotelId));
    }
    if (!allHotels || allHotels.length === 0) {
      dispatch(fetchActiveHotels());
    }
    return () => {
      dispatch(clearSelectedHotel());
      setEnquirySuccess(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // Watch hotelEnquiries for success (assume last enquiry is the latest submission)
  useEffect(() => {
    if (hotelEnquiries && Array.isArray(hotelEnquiries) && hotelEnquiries.length > 0) {
      setEnquirySuccess(true);
    }
  }, [hotelEnquiries]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission using createHotelEnquiry and sending formData
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hotel?.id) {
      // Hotel authId is required
      return;
    }

    // Only use the fields from the HotelEnquiry interface
    const enquiryData = {
      name: formData.name,
      email: formData.email || "",
      phoneNumber: formData.phoneNumber,
      status: "Pending" as const,
      authId: hotel.id,
      // id, createdAt, updatedAt will be set by backend
    };

    try {
      await dispatch(
        createHotelEnquiry(enquiryData as any)
      ).unwrap();
      setEnquirySuccess(true);
      setFormData({
        name: "",
        phoneNumber: "",
        email: "",
      });
    } catch (error) {
      // Error is handled by Redux
    }
  };

  // Handle retry on error
  const handleRetry = () => {
    dispatch(clearError());
    const hotelId = params.id as string;
    if (hotelId) {
      dispatch(fetchHotelById(hotelId));
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: "color-mix(in oklab, #fafafa 80%, transparent)" }}
      >
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
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "color-mix(in oklab, #fafafa 80%, transparent)" }}
      >
        <div className="text-center space-y-4">
          <Alert className="max-w-md">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="space-x-4">
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={handleRetry}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  // Hotel not found
  if (!hotel && !loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "color-mix(in oklab, #fafafa 80%, transparent)" }}
      >
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Hotel Not Found</h1>
          <p className="text-gray-600">
            The hotel you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "color-mix(in oklab, #fafafa 80%, transparent)" }}
    >
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
          src={
            hotel?.images?.[selectedImageIndex] ||
            DEFAULT_VENUE_IMAGES[selectedImageIndex] ||
            "/placeholder.svg?height=600&width=800"
          }
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
                className={`w-3 h-3 rounded-full transition-all ${
                  index === selectedImageIndex
                    ? "bg-pink-400 shadow-lg"
                    : "bg-white/50 hover:bg-white/70"
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
          <Badge className="mb-3 bg-pink-500/90 text-white border-0">
            {hotel?.category}
          </Badge>
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
          {/* Google Location Link */}
          {hotel?.googleLocation && (
            <div className="mt-2">
              <a
                href={hotel.googleLocation}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-pink-200 hover:text-white underline"
              >
                View on Google Maps
              </a>
            </div>
          )}
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
              <h2 className="text-2xl font-bold text-[#212D47] mb-4">
                About This Hotel
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {hotel?.description}
              </p>
            </motion.div>

            {/* Marriage Photos Gallery */}
            {hotel?.uploadMarriagePhotos && hotel.uploadMarriagePhotos.length > 0 && (
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <h2 className="text-2xl font-bold text-[#212D47] mb-6">
                  Wedding Ceremonies Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hotel.uploadMarriagePhotos.map((photo, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        delay: 0.6 + index * 0.1,
                        duration: 0.4,
                      }}
                      whileHover={{ scale: 1.05 }}
                      className="aspect-video relative overflow-hidden rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                    >
                      <img
                        src={photo}
                        alt={`Wedding ceremony at ${hotel.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Resort Photos Gallery */}
            {hotel?.uploadResortPhotos && hotel.uploadResortPhotos.length > 0 && (
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <h2 className="text-2xl font-bold text-[#212D47] mb-6">
                  Resort Photo Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hotel.uploadResortPhotos.map((photo, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        delay: 0.6 + index * 0.1,
                        duration: 0.4,
                      }}
                      whileHover={{ scale: 1.05 }}
                      className="aspect-video relative overflow-hidden rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                    >
                      <img
                        src={photo}
                        alt={`Resort view at ${hotel.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Amenities */}
            {hotel?.amenities && hotel.amenities.length > 0 && (
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <h2 className="text-2xl font-bold text-[#212D47] mb-6">
                  Amenities
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hotel.amenities.map((amenity, index) => {
                    const IconComponent = getAmenityIcon(amenity);
                    return (
                      <motion.div
                        key={amenity}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          delay: 0.6 + index * 0.1,
                          duration: 0.4,
                        }}
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                      >
                        <IconComponent className="w-5 h-5 text-[#212D47]" />
                        <span className="text-gray-700 font-medium">
                          {toTitleCase(amenity)}
                        </span>
                      </motion.div>
                    );
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
                <h2 className="text-2xl font-bold text-[#212D47] mb-6">
                  Room Types
                </h2>
                <div className="space-y-4">
                  {hotel.rooms.map((room, index) => (
                    <motion.div
                      key={room.type}
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{
                        delay: 0.8 + index * 0.1,
                        duration: 0.5,
                      }}
                      whileHover={{ scale: 1.02 }}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition-all border-gray-200 bg-white hover:border-[#212D47]/30`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold text-[#212D47]">
                          {room.type}
                        </h3>
                        <Badge
                          variant={room.available > 0 ? "default" : "destructive"}
                        >
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
                          <span className="text-sm font-normal text-gray-500">
                            /night
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
            {/* Location Map */}
            {hotel?.googleLocation && (
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.6 }}
              >
                <h2 className="text-2xl font-bold text-[#212D47] mb-6">
                  Location
                </h2>
                {(() => {
                  const isEmbedUrl = hotel.googleLocation.includes('embed') || 
                    hotel.googleLocation.includes('maps.google.com') ||
                    hotel.googleLocation.includes('google.com/maps');
                  
                  if (isEmbedUrl) {
                    return (
                      <div className="w-full h-64 rounded-xl overflow-hidden shadow-md border border-gray-200">
                        <iframe
                          src={hotel.googleLocation}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Hotel Location"
                        />
                      </div>
                    );
                  } else {
                    return (
                      <div className="w-full h-64 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center shadow-md">
                        <div className="text-center space-y-3">
                          <MapPin className="w-12 h-12 text-[#212D47] mx-auto" />
                          <div>
                            <p className="text-lg font-semibold text-[#212D47] mb-2">
                              View Location
                            </p>
                            <a
                              href={hotel.googleLocation}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium underline"
                            >
                              <Globe className="w-4 h-4" />
                              Open in Maps
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })()}
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
                    <div className="text-gray-500 font-medium">
                      starting from per night
                    </div>
                  </div>
                  <Button
                    className="w-full bg-[#212D47] hover:bg-[#212D47]/90 text-white"
                    onClick={() => setIsBookingOpen(true)}
                  >
                    Enquiry Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Info - only for premium */}
            {hotel?.isPremium && (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-[#212D47] mb-4">
                    Contact Information
                  </h3>
                  {
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-pink-500" />
                        <span className="text-gray-700">
                          {hotel?.contactInfo.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-pink-500" />
                        <span className="text-gray-700">
                          {hotel?.contactInfo.email}
                        </span>
                      </div>
                      {hotel?.contactInfo.website && (
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-pink-500" />
                          <span className="text-gray-700">
                            {hotel?.contactInfo.website}
                          </span>
                        </div>
                      )}
                      {/* Google Location in Contact Info */}
                      {hotel?.googleLocation && (
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-pink-500" />
                          <a
                            href={hotel.googleLocation}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-700 underline hover:text-pink-700"
                          >
                            View on Google Maps
                          </a>
                        </div>
                      )}
                    </div>
                  }
                </CardContent>
              </Card>
            </motion.div>
            )}

            {/* Policies */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-[#212D47] mb-4">
                    Hotel Policies
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-pink-500 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 break-words break-all">
                          Check-in: {hotel?.policies.checkIn}
                        </div>
                        <div className="font-medium text-gray-900 break-words break-all">
                          Check-out: {hotel?.policies.checkOut}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-3 break-words break-all">
                      {hotel?.policies.cancellation}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Booking Modal */}
        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Enquiry Now</DialogTitle>
            </DialogHeader>
            {enquirySuccess ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h3>
                <p className="text-gray-600 mb-6">Your enquiry has been submitted successfully. We'll contact you soon!</p>
                <Button onClick={() => { setFormData({ name: "", phoneNumber: "", email: "" }); setEnquirySuccess(false); setIsBookingOpen(false); }} variant="outline">Close</Button>
              </motion.div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {enquiryError && (
                  <Alert variant="destructive">
                    <AlertDescription>{enquiryError}</AlertDescription>
                  </Alert>
                )}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Enter your full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input id="phoneNumber" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleInputChange} required placeholder="Enter your phone number" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email address" />
                </div>
                <Button type="submit" className="w-full bg-[#212D47] hover:bg-[#212D47]/90 text-white" disabled={enquiryLoading}>
                  {enquiryLoading ? "Enquiry..." : "Enquiry Now"}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
        {/* Our Premium Venues */}
        {allHotels && allHotels.filter(h => h.isPremium && h.id !== hotel?.id).length > 0 && (
          <div className="max-w-7xl mx-auto px-6 py-12">
            <h2 className="text-2xl font-bold text-[#212D47] mb-6">Our Premium Venues</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allHotels.filter(h => h.isPremium && h.id !== hotel?.id).slice(0,6).map(h => (
                <Card key={h.id} className="group cursor-pointer hover:shadow-lg transition" onClick={() => router.push(`/venue/${h.id}`)}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={h.images?.[0] || "/api/placeholder/400/300"} alt={h.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <Badge className="absolute top-3 left-3 bg-[#212D47]/90 text-white">Premium</Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-1 group-hover:text-[#212D47]">{h.name}</h3>
                    <div className="text-sm text-gray-600 mt-1 flex items-center"><MapPin className="w-4 h-4 mr-1" />{h.location?.city}{h.location?.state ? `, ${h.location.state}` : ''}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}