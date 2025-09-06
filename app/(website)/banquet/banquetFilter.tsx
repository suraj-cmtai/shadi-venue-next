"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

type Filters = {
    category?: string;
    location?: string;
    priceRange?: [number, number];
    maxGuestCapacity?: number;
    venueType?: string;
    rating?: number;
};

type VenueFiltersProps = {
    onFiltersChange: (filters: Filters) => void;
};

const FALLBACK_FILTERS = {
    categories: ["Banquet Hall", "Resort", "Hotel", "Marriage Garden"],
    locations: ["Delhi", "Mumbai", "Pune", "Jaipur"],
    venueTypes: ["Indoor", "Outdoor", "Poolside", "Terrace"],
    capacities: ["50", "100", "200", "300", "500"],
    priceRanges: ["< ₹ 1,000", "₹ 1,000 - ₹ 2,000", "₹ 2,000 - ₹ 5,000", "> ₹ 5,000"],
    ratings: ["All Ratings", "4+", "4.5+", "4.8+"],
};

export const VenueFilters = ({ onFiltersChange }: VenueFiltersProps) => {
    // These will be fetched from backend, fallback to static if not available
    const [dynamicFilters, setDynamicFilters] = useState<{
        categories: string[];
        locations: string[];
        venueTypes: string[];
        capacities: string[];
        priceRanges: string[];
        ratings: string[];
    } | null>(null);

    const [loading, setLoading] = useState(true);
    const [openSections, setOpenSections] = useState<string[]>([]);
    const [filters, setFilters] = useState<Filters>({});

    // Simulate fetching filter options from backend
    useEffect(() => {
        let cancelled = false;
        async function fetchFilters() {
            setLoading(true);
            try {
                await new Promise((r) => setTimeout(r, 500));
                if (!cancelled) setDynamicFilters(null);
            } catch (e) {
                if (!cancelled) setDynamicFilters(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        fetchFilters();
        return () => { cancelled = true; };
    }, []);

    // Use dynamic filters if available, else fallback
    const filterCategories = useMemo(() => {
        const categories = dynamicFilters?.categories ?? FALLBACK_FILTERS.categories;
        const locations = dynamicFilters?.locations ?? FALLBACK_FILTERS.locations;
        const venueTypes = dynamicFilters?.venueTypes ?? FALLBACK_FILTERS.venueTypes;
        const capacities = dynamicFilters?.capacities ?? FALLBACK_FILTERS.capacities;
        const priceRanges = dynamicFilters?.priceRanges ?? FALLBACK_FILTERS.priceRanges;
        const ratings = dynamicFilters?.ratings ?? FALLBACK_FILTERS.ratings;

        return {
            category: { title: "Category", options: categories },
            location: { title: "Location", options: locations },
            priceRange: { title: "Price Range", options: priceRanges },
            maxGuestCapacity: { title: "Max Guest Capacity", options: capacities },
            venueType: { title: "Venue Type", options: venueTypes },
            rating: { title: "Rating", options: ratings },
        };
    }, [dynamicFilters]);

    const handleFilterChange = (category: string, value: string, checked: boolean) => {
        const updated = { ...filters };

        if (category === "priceRange") {
            if (value.startsWith("<")) updated.priceRange = [0, 1000];
            else if (value.includes("1,000 - ₹ 2,000")) updated.priceRange = [1000, 2000];
            else if (value.includes("2,000 - ₹ 5,000")) updated.priceRange = [2000, 5000];
            else updated.priceRange = [5000, 1000000];
        } else if (category === "rating") {
            // Ratings are like "4+", "4.5+", etc.
            if (value === "All Ratings") {
                updated.rating = 0;
            } else {
                const num = parseFloat(value);
                updated.rating = isNaN(num) ? undefined : num;
            }
        } else if (category === "maxGuestCapacity") {
            // Capacity is string, convert to number
            const num = parseInt(value, 10);
            updated.maxGuestCapacity = isNaN(num) ? undefined : num;
        } else {
            // All other filters are string
            (updated[category as keyof Filters] as unknown as string) = value;
        }

        setFilters(updated);
        onFiltersChange(updated);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#212D47]/20">
            {loading ? (
                <div className="text-center text-muted-foreground py-8">Loading filters...</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {Object.entries(filterCategories).map(([key, category]) => (
                        <Collapsible key={key} open={openSections.includes(key)}>
                            <CollapsibleTrigger
                                onClick={() =>
                                    setOpenSections((prev) =>
                                        prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
                                    )
                                }
                                className="flex items-center justify-between w-full text-left"
                            >
                                <span className="font-medium text-sm text-[#212D47]">{category.title}</span>
                                <ChevronDown
                                    className={`h-4 w-4 text-[#212D47] transition-transform ${openSections.includes(key) ? "rotate-180" : ""
                                        }`}
                                />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-3 space-y-2">
                                {category.options.map((option) => (
                                    <div key={option} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`${key}-${option}`}
                                            checked={
                                                key === "rating"
                                                    ? filters.rating === parseFloat(option) ||
                                                      (option === "All Ratings" && filters.rating === 0)
                                                    : key === "maxGuestCapacity"
                                                        ? filters.maxGuestCapacity === parseInt(option, 10)
                                                        : filters[key as keyof Filters] === option
                                            }
                                            onCheckedChange={(checked) =>
                                                handleFilterChange(key, option, checked as boolean)
                                            }
                                        />
                                        <Label
                                            htmlFor={`${key}-${option}`}
                                            className="text-xs text-gray-600 cursor-pointer"
                                        >
                                            {option}
                                        </Label>
                                    </div>
                                ))}
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </div>
            )}

            <div className="flex gap-4 mt-6 pt-4 border-t border-[#212D47]/20">
                <Button
                    variant="outline"
                    onClick={() => {
                        setFilters({});
                        onFiltersChange({});
                    }}
                >
                    Reset
                </Button>
                <Button className="px-8 bg-[#212D47] hover:bg-[#1A2335] text-white">
                    View Results
                </Button>
            </div>
        </div>
    );
};
