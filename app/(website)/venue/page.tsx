'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  fetchActiveHotels,
  selectActiveHotels,
  selectHotelLoading,
  selectHotelError,
  selectSearchQuery,
  selectFilters,
  setSearchQuery,
  setFilters,
  clearFilters,
  clearError,
  selectHotelHasFetched,
} from "@/lib/redux/features/hotelSlice";

import Hero from './Hero';
import { VenueFilters } from "./venueFilter";
import { VenueSearch } from "./venueSearch";
import { VenueCard } from "./venueCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";

/**
 * VenuePage displays a list of active wedding venues with filters and search.
 * On first load, it fetches the data using fetchActiveHotels.
 * Only active hotels are shown, and categories/cities are dynamically derived using selectors.
 */
const VenuePage = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();

    // Redux state
    const activeHotels = useAppSelector(selectActiveHotels);
    const loading = useAppSelector(selectHotelLoading);
    const error = useAppSelector(selectHotelError);
    const searchQuery = useAppSelector(selectSearchQuery);
    const filters = useAppSelector(selectFilters);
    const hasFetched = useAppSelector(selectHotelHasFetched);

    // Local state
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

    // Fetch active hotels on first load
    useEffect(() => {
        dispatch(fetchActiveHotels());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    // Dynamically derive categories and cities from active hotels (no useMemo, just plain logic)
    const categories = [];
    const categorySet = new Set();
    for (const hotel of activeHotels) {
        if (hotel.category && !categorySet.has(hotel.category)) {
            categories.push(hotel.category);
            categorySet.add(hotel.category);
        }
    }

    const cities = [];
    const citySet = new Set();
    for (const hotel of activeHotels) {
        if (hotel.location?.city && !citySet.has(hotel.location.city)) {
            cities.push(hotel.location.city);
            citySet.add(hotel.location.city);
        }
    }

    // Filter and search logic for active hotels (no useMemo)
    const filteredVenues = activeHotels.filter(hotel => {
        // Text search
        const matchesSearch = !searchQuery ||
            hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hotel.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hotel.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hotel.category.toLowerCase().includes(searchQuery.toLowerCase());

        // Category filter
        const matchesCategory = !filters.category || hotel.category === filters.category;

        // City filter
        const matchesCity = !filters.city || hotel.location.city === filters.city;

        // Price range filter
        const matchesPrice = hotel.priceRange.startingPrice >= (filters.priceRange?.[0] ?? 0) &&
            hotel.priceRange.startingPrice <= (filters.priceRange?.[1] ?? 10000);

        // Rating filter
        const matchesRating = !filters.rating || hotel.rating >= filters.rating;

        return matchesSearch && matchesCategory && matchesCity && matchesPrice && matchesRating;
    });

    // Handle search changes
    const handleSearchChange = (query: string) => {
        dispatch(setSearchQuery(query));
    };

    // Handle filter changes
    const handleFiltersChange = (newFilters: any) => {
        dispatch(setFilters(newFilters));
    };

    // Handle venue click
    const handleVenueClick = (venueId: string) => {
        router.push(`/venue/${venueId}`);
    };

    // Handle error retry
    const handleRetry = () => {
        dispatch(clearError());
        dispatch(fetchActiveHotels());
    };

    // Loading skeleton component
    const LoadingSkeleton = () => (
        <div className={`grid gap-6 ${viewMode === 'grid'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1'
        }`}>
            {[...Array(6)].map((_, index) => (
                <div key={index} className="space-y-3">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                </div>
            ))}
        </div>
    );

    // Error component
    const ErrorDisplay = () => (
        <div className="flex flex-col items-center justify-center py-12">
            <Alert className="max-w-md mb-4">
                <AlertDescription>
                    {error || "Failed to load venues. Please try again."}
                </AlertDescription>
            </Alert>
            <Button onClick={handleRetry} variant="outline">
                Try Again
            </Button>
        </div>
    );

    // No results component
    const NoResults = () => (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">No venues found</h3>
                <p className="text-muted-foreground mb-4">
                    Try adjusting your search criteria or filters
                </p>
                <Button
                    onClick={() => {
                        dispatch(clearFilters());
                    }}
                    variant="outline"
                >
                    Clear Filters
                </Button>
            </div>
        </div>
    );

    return (
        <section>
            <Hero />

            <div className="min-h-screen bg-background">
                {/* Filters */}
                <section className="border-b bg-card/50">
                    <div className="max-w-7xl mx-auto px-4 py-6">
                        <VenueFilters
                            onFiltersChange={handleFiltersChange}
                            // If VenueFilters expects categories/cities, pass as props here
                            // categories={categories}
                            // cities={cities}
                        />
                    </div>
                </section>

                {/* Search and Controls */}
                <VenueSearch
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    resultCount={filteredVenues.length}
                    selectedFilters={filters}
                    // categories={categories}
                    // cities={cities}
                />

                {/* Results */}
                <main className="max-w-7xl mx-auto px-4 py-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2">Wedding Venues</h2>
                        {!loading && !error && (
                            <p className="text-muted-foreground">
                                Showing {filteredVenues.length} results
                                {(searchQuery || Object.values(filters).some(v => v && v !== '' && !Array.isArray(v) || (Array.isArray(v) && v.length > 0)))
                                    ? " as per your search criteria"
                                    : ""
                                }
                            </p>
                        )}
                    </div>

                    {/* Loading State */}
                    {loading && <LoadingSkeleton />}

                    {/* Error State */}
                    {error && !loading && <ErrorDisplay />}

                    {/* No Results State */}
                    {!loading && !error && filteredVenues.length === 0 && hasFetched && (
                        <NoResults />
                    )}

                    {/* Venues Grid */}
                    {!loading && !error && filteredVenues.length > 0 && (
                        <div className={`grid gap-6 ${viewMode === 'grid'
                            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                            : 'grid-cols-1'
                        }`}>
                            {filteredVenues.map((venue) => (
                                <VenueCard
                                    key={venue.id}
                                    venue={venue}
                                    onVenueClick={handleVenueClick}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </section>
    );
};

export default VenuePage;