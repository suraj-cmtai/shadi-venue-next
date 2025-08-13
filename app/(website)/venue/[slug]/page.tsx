// app/venues/[id]/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
    ArrowLeft, Star, MapPin, Users, Phone, Mail, Heart, Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock venue data (replace with API fetch later)
const venueDetail = {
    id: "1",
    name: "Opulence by Bhullar Resorts",
    location: "Zirakpur, Zirakpur",
    city: "Delhi NCR",
    rating: 4.8,
    reviewCount: 19,
    images: [
        "/placeholder.svg",
        "/placeholder.svg",
        "/placeholder.svg",
        "/placeholder.svg",
    ],
    
    venueTypes: ["Banquet Halls", "Marriage Garden / Lawns"],
    capacity: "50-300 guests",
    priceRange: "₹2,000 - ₹3,500 per plate",
    description:
        "Opulence by Bhullar Resorts offers a perfect blend of luxury and tradition for your special day.",
    amenities: [
        "Complimentary WiFi",
        "Valet Parking",
        "Bridal Room",
        "Air Conditioning",
        "Power Backup",
        "Sound System",
        "Photography Allowed",
        "Outside Catering Allowed",
    ],
    contact: {
        phone: "+91 98765 43210",
        email: "info@bhullarresorts.com",
    },
    packages: [
        {
            name: "Basic Package",
            price: "₹2,000 per plate",
            includes: ["Welcome Drink", "4-Course Meal", "Basic Decoration"],
        },
        {
            name: "Premium Package",
            price: "₹2,800 per plate",
            includes: [
                "Welcome Drink",
                "6-Course Meal",
                "Premium Decoration",
                "DJ Service",
            ],
        },
        {
            name: "Luxury Package",
            price: "₹3,500 per plate",
            includes: [
                "Welcome Drink",
                "8-Course Meal",
                "Luxury Decoration",
                "Live Music",
                "Photography",
            ],
        },
    ],
};

export default function VenueDetailPage() {
    const { id } = useParams();
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-card border-b px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link
                        href="/venues"
                        className="flex items-center text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Venues
                    </Link>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsFavorite(!isFavorite)}
                            className={isFavorite ? "text-red-500 border-red-200" : ""}
                        >
                            <Heart
                                className={`w-4 h-4 mr-1 ${isFavorite ? "fill-current" : ""
                                    }`}
                            />
                            {isFavorite ? "Saved" : "Save"}
                        </Button>
                        <Button variant="outline" size="sm">
                            <Share2 className="w-4 h-4 mr-1" />
                            Share
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Image Gallery */}
                        <div className="space-y-4">
                            <div className="aspect-[16/10] rounded-lg overflow-hidden">
                                <Image
                                    src={venueDetail.images[selectedImageIndex]}
                                    alt={venueDetail.name}
                                    width={1000}
                                    height={600}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {venueDetail.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === index
                                                ? "border-primary"
                                                : "border-transparent"
                                            }`}
                                    >
                                        <Image
                                            src={image}
                                            alt={`View ${index + 1}`}
                                            width={200}
                                            height={200}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Venue Info */}
                        <div className="space-y-4">
                            <div>
                                <h1 className="text-3xl font-bold">{venueDetail.name}</h1>
                                <div className="flex items-center text-muted-foreground mt-2">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    <span>
                                        {venueDetail.location}, {venueDetail.city}
                                    </span>
                                </div>
                                <div className="flex items-center mt-2">
                                    <Star className="w-5 h-5 text-accent fill-current" />
                                    <span className="font-semibold ml-1">
                                        {venueDetail.rating}
                                    </span>
                                    <span className="text-muted-foreground ml-1">
                                        ({venueDetail.reviewCount} reviews)
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {venueDetail.venueTypes.map((type, index) => (
                                    <Badge key={index} variant="secondary">
                                        {type}
                                    </Badge>
                                ))}
                            </div>

                            <p className="text-muted-foreground leading-relaxed">
                                {venueDetail.description}
                            </p>
                        </div>

                        {/* Tabs */}
                        <Tabs defaultValue="amenities" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                                <TabsTrigger value="packages">Packages</TabsTrigger>
                                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                            </TabsList>

                            <TabsContent value="amenities" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Amenities & Services</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-3">
                                            {venueDetail.amenities.map((amenity, index) => (
                                                <div key={index} className="flex items-center">
                                                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                                                    <span>{amenity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="packages" className="mt-6">
                                <div className="grid gap-4">
                                    {venueDetail.packages.map((pkg, index) => (
                                        <Card key={index}>
                                            <CardHeader>
                                                <div className="flex justify-between items-center">
                                                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                                                    <span className="text-xl font-bold text-primary">
                                                        {pkg.price}
                                                    </span>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2">
                                                    {pkg.includes.map((item, i) => (
                                                        <div key={i} className="flex items-center">
                                                            <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                                                            <span>{item}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="reviews" className="mt-6">
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-center text-muted-foreground">
                                            Reviews coming soon...
                                        </p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center">
                                    <Users className="w-5 h-5 mr-3 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Capacity</p>
                                        <p className="text-sm text-muted-foreground">
                                            {venueDetail.capacity}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-5 h-5 mr-3 flex items-center justify-center">
                                        <span className="text-lg">₹</span>
                                    </div>
                                    <div>
                                        <p className="font-medium">Price Range</p>
                                        <p className="text-sm text-muted-foreground">
                                            {venueDetail.priceRange}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Venue</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button className="w-full bg-primary hover:bg-primary-dark">
                                    <Phone className="w-4 h-4 mr-2" />
                                    Call Now
                                </Button>
                                <Button variant="outline" className="w-full">
                                    <Mail className="w-4 h-4 mr-2" />
                                    Send Inquiry
                                </Button>
                                <div className="pt-4 border-t space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        <Phone className="w-4 h-4 inline mr-2" />
                                        {venueDetail.contact.phone}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        <Mail className="w-4 h-4 inline mr-2" />
                                        {venueDetail.contact.email}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
