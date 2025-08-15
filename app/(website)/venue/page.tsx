'use client';

import Hero from './Hero';
import { useRouter } from "next/navigation";
import { VenueFilters } from "./venueFilter";
// import { CitySelector } from "./citySelector";
import { VenueSearch } from "./venueSearch";
import { VenueCard } from "./venueCard";
import { useState } from "react";
import type { Hotel } from "@/lib/redux/features/hotelSlice";


const venues: Hotel[] = [
    {
        id: "1",
        name: "Opulence by Bhullar Resorts",
        category: "Banquet Hall",
        location: {
            address: "Zirakpur, Zirakpur",
            city: "Delhi NCR",
            state: "Delhi",
            country: "India",
            zipCode: "110001",
        },
        priceRange: {
            startingPrice: 2000,
            currency: "INR",
        },
        rating: 4.8,
        status: "active",
        description: "A premium wedding venue with spacious lawns and banquet hall.",
        amenities: ["WiFi", "Parking", "Air Conditioning"],
        rooms: [
            { type: "Deluxe", capacity: 2, pricePerNight: 5000, available: 10 },
            { type: "Suite", capacity: 4, pricePerNight: 12000, available: 3 },
        ],
        images: ["/placeholder.svg", "/placeholder.svg"],
        contactInfo: {
            phone: "+91 99999 99999",
            email: "info@opulence.com",
            website: "https://opulence.com",
        },
        policies: {
            checkIn: "12:00 PM",
            checkOut: "11:00 AM",
            cancellation: "Free cancellation up to 48 hours before check-in.",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

        // New form fields
        firstName: "John",
        lastName: "Doe",
        companyName: "Opulence Resorts Pvt. Ltd.",
        venueType: "Banquet Hall",
        position: "Manager",
        websiteLink: "https://opulence.com",
        offerWeddingPackages: "Yes",
        resortCategory: "Luxury",
        weddingPackagePrice: "₹5,00,000",
        servicesOffered: ["Catering", "Decoration", "Music", "Photography"],
        maxGuestCapacity: "300",
        numberOfRooms: "25",
        venueAvailability: "Available Year Round",
        allInclusivePackages: ["Yes"],
        staffAccommodation: ["Limited"],
        diningOptions: ["Buffet", "A la Carte"],
        otherAmenities: ["Swimming Pool", "Spa"],
        bookingLeadTime: "3 months",
        preferredContactMethod: ["Email", "Phone"],
        weddingDepositRequired: "₹50,000",
        refundPolicy: "Refundable up to 1 month before event",
        referralSource: "Social Media",
        partnershipInterest: "Yes",
        uploadResortPhotos: ["/photos/resort1.jpg", "/photos/resort2.jpg"],
        uploadMarriagePhotos: ["/photos/marriage1.jpg"],
        uploadWeddingBrochure: ["/docs/brochure.pdf"],
        uploadCancelledCheque: ["/docs/cheque.jpg"],
        agreeToTerms: true,
        agreeToPrivacy: true,
        signature: "John Doe",
    },
    {
        id: "2",
        name: "GITAI Lawns / Banquet Halls",
        category: "Banquet Hall",
        location: {
            address: "Pune, Maharashtra",
            city: "Pune",
            state: "Maharashtra",
            country: "India",
            zipCode: "411001",
        },
        priceRange: {
            startingPrice: 1800,
            currency: "INR",
        },
        rating: 4.9,
        status: "active",
        description: "A spacious venue perfect for weddings and receptions.",
        amenities: ["WiFi", "Parking", "Air Conditioning"],
        rooms: [{ type: "Luxury Suite", capacity: 2, pricePerNight: 6000, available: 5 }],
        images: ["/placeholder.svg", "/placeholder.svg"],
        contactInfo: {
            phone: "+91 88888 88888",
            email: "info@gitai.com",
            website: "https://gitai.com",
        },
        policies: {
            checkIn: "1:00 PM",
            checkOut: "12:00 PM",
            cancellation: "Free cancellation up to 72 hours before check-in.",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];



const VenuePage = () => {
    const router = useRouter();
    const [selectedCity, setSelectedCity] = useState("delhi");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [filters, setFilters] = useState({});

    const handleVenueClick = (venueId: string) => {
        router.push(`/venue/${venueId}`);
    };
    return (
        <section >
            <Hero />

            <div className="min-h-screen bg-background">
                {/* Filters */}
                <section className="border-b bg-card/50">
                    <div className="max-w-7xl mx-auto px-4 py-6">
                        <VenueFilters onFiltersChange={setFilters} />
                    </div>
                </section>

                {/* City Selector */}
                {/* <section className="bg-background">
                    <div className="max-w-7xl mx-auto px-4">
                        <CitySelector
                            selectedCity={selectedCity}
                            onCityChange={setSelectedCity}
                        />
                    </div>
                </section> */}

                {/* Search and Controls */}
                <VenueSearch
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    resultCount={venues.length}
                    selectedFilters={filters}
                />

                {/* Results */}
                <main className="max-w-7xl mx-auto px-4 py-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2">Wedding Venues</h2>
                        <p className="text-muted-foreground">
                            Showing {venues.length} results as per your search criteria
                        </p>
                    </div>

                    <div className={`grid gap-6 ${viewMode === 'grid'
                        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                        : 'grid-cols-1'
                        }`}>
                        {venues.map((venue) => (
                            <VenueCard
                                key={venue.id}
                                venue={venue}
                                onVenueClick={handleVenueClick}
                            />
                        ))}
                    </div>
                </main>
            </div>

        </section>
    );
};

export default VenuePage;





