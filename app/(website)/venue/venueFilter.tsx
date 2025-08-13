"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

const filterCategories = {
    guestCount: {
        title: "No. of Guests",
        options: ["< 100", "100-250", "250-500", "500-1000", "> 1000"]
    },
    roomCount: {
        title: "Room Count",
        options: ["<30", "30-60", "61-100", "100-200", "200-1000"]
    },
    pricePerPlate: {
        title: "Price per plate (Rs)",
        options: [
            "< ₹ 1,000",
            "₹ 1,000 - ₹ 1,500",
            "₹ 1,500 - ₹ 2,000",
            "₹ 2,000 - ₹ 3,000",
            "> ₹ 3,000"
        ]
    },
    rentalCost: {
        title: "Rental Cost",
        options: [
            "< ₹ 1 Lakh",
            "₹ 1 Lakh- ₹ 2 Lakhs",
            "₹ 2 Lakhs - ₹ 4 Lakhs",
            "₹ 4 Lakhs - ₹ 6 Lakhs",
            "> ₹ 6 Lakhs"
        ]
    },
    venueType: {
        title: "Venue Type",
        options: [
            "Banquet Halls",
            "Marriage Garden / Lawns",
            "4 Star & Above Wedding Hotels",
            "5 Star Hotels",
            "3 Star Hotels with Banquets"
        ]
    },
    space: {
        title: "Space",
        options: ["Indoor", "Outdoor", "Poolside", "Terrace / Rooftop"]
    },
    rating: {
        title: "Rating",
        options: ["All Ratings", "Rated <4", "Rated 4+", "Rated 4.5+", "Rated 4.8+"]
    }
};

interface VenueFiltersProps {
    onFiltersChange: (filters: any) => void;
}

export const VenueFilters = ({ onFiltersChange }: VenueFiltersProps) => {
    const [selectedFilters, setSelectedFilters] = useState<any>({});
    const [openSections, setOpenSections] = useState<string[]>([]);

    // Helper to get all filter category keys
    const allCategoryKeys = Object.keys(filterCategories);

    // On click of any filter category, open all filter categories
    const handleOpenAllSections = () => {
        setOpenSections(allCategoryKeys);
    };

    // On next click, close all filter categories
    const handleCloseAllSections = () => {
        setOpenSections([]);
    };

    const handleFilterChange = (
        category: string,
        value: string,
        checked: boolean
    ) => {
        setSelectedFilters((prev: any) => {
            const updated = { ...prev };
            if (!updated[category]) updated[category] = [];

            if (checked) {
                updated[category] = [...updated[category], value];
            } else {
                updated[category] = updated[category].filter((v: string) => v !== value);
            }

            if (updated[category].length === 0) {
                delete updated[category];
            }

            onFiltersChange(updated);
            return updated;
        });
    };

    const resetFilters = () => {
        setSelectedFilters({});
        onFiltersChange({});
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#212D47]/20">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
                {Object.entries(filterCategories).map(([key, category]) => (
                    <Collapsible key={key} open={openSections.includes(key)}>
                        <CollapsibleTrigger
                            // On click, open all filter categories if closed, else close all
                            onClick={() => {
                                if (openSections.length === 0) {
                                    handleOpenAllSections();
                                } else {
                                    handleCloseAllSections();
                                }
                            }}
                            className="flex items-center justify-between w-full text-left"
                        >
                            <span className="font-medium text-sm text-[#212D47]">
                                {category.title}
                            </span>
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
                                        checked={selectedFilters[key]?.includes(option) || false}
                                        onCheckedChange={(checked) =>
                                            handleFilterChange(key, option, checked as boolean)
                                        }
                                        className="data-[state=checked]:bg-[#212D47] data-[state=checked]:border-[#212D47]"
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

            <div className="flex gap-4 mt-6 pt-4 border-t border-[#212D47]/20">
                <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="px-8 border-[#212D47] text-[#212D47] hover:bg-[#212D47] hover:text-white"
                >
                    Reset
                </Button>
                <Button
                    className="px-8 bg-[#212D47] hover:bg-[#1A2335] text-white"
                >
                    View Results
                </Button>
            </div>
        </div>
    );
};
