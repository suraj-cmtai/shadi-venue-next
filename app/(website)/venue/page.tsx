'use client';

import Hero from './Hero';
import { useRouter } from "next/navigation";
import { VenueFilters } from "./venueFilter";
import { CitySelector } from "./citySelector";
import { VenueSearch } from "./venueSearch";
import { VenueCard } from "./venueCard";
import { useState } from "react";


// Mock venue data
const venues = [
    {
        id: "1",
        name: "Opulence by Bhullar Resorts",
        location: "Zirakpur, Zirakpur",
        city: "Delhi NCR",
        rating: 4.8,
        reviewCount: 19,
        images: ["/placeholder.svg", "/placeholder.svg"],
        venueTypes: ["Banquet Halls", "Marriage Garden / Lawns"],
        capacity: "50-300 guests",
        priceRange: "₹2,000 - ₹3,500",
        isHandpicked: true
    },
    {
        id: "2",
        name: "GITAI Lawns / Banquet Halls",
        location: "Lohegaon, Pune",
        city: "Pune",
        rating: 4.9,
        reviewCount: 13,
        images: ["/placeholder.svg", "/placeholder.svg"],
        venueTypes: ["Banquet Halls", "Marriage Garden / Lawns"],
        capacity: "100-500 guests",
        priceRange: "₹1,500 - ₹2,800",
        isHandpicked: true
    },
    {
        id: "3",
        name: "Holiday Inn Jaipur City Centre",
        location: "Shivaji Nagar, Jaipur",
        city: "Jaipur",
        rating: 4.6,
        reviewCount: 15,
        images: ["/placeholder.svg", "/placeholder.svg"],
        venueTypes: ["4 Star & Above Wedding Hotels"],
        capacity: "75-400 guests",
        priceRange: "₹2,500 - ₹4,000",
        isHandpicked: false
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
                <section className="bg-background">
                    <div className="max-w-7xl mx-auto px-4">
                        <CitySelector
                            selectedCity={selectedCity}
                            onCityChange={setSelectedCity}
                        />
                    </div>
                </section>

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


 


