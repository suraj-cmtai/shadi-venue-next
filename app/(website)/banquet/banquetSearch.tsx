"use client";

import { Search, List, Grid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const THEME_COLOR = "#212D47";

interface VenueSearchProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    viewMode: "list" | "grid";
    onViewModeChange: (mode: "list" | "grid") => void;
    resultCount: number;
    selectedFilters: any;
}

export const VenueSearch = ({
    searchQuery,
    onSearchChange,
    viewMode,
    onViewModeChange,
    resultCount,
    selectedFilters,
}: VenueSearchProps) => {
    const activeFilterCount = Object.keys(selectedFilters).length;

    return (
        <div className="bg-card border-b p-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search Input */}
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                            <Input
                                placeholder="Search Wedding Venues..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Filters & View Toggle */}
                    <div className="flex items-center gap-4">
                        {activeFilterCount > 0 && (
                            <Badge
                                variant="secondary"
                                className="text-white"
                                style={{ backgroundColor: THEME_COLOR }}
                            >
                                {activeFilterCount} filter
                                {activeFilterCount > 1 ? "s" : ""} applied
                            </Badge>
                        )}

                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                onClick={() => onViewModeChange("list")}
                                className="px-3"
                                style={{
                                    backgroundColor:
                                        viewMode === "list" ? THEME_COLOR : "transparent",
                                    borderColor: THEME_COLOR,
                                    color: viewMode === "list" ? "#fff" : THEME_COLOR,
                                }}
                                variant={viewMode === "list" ? "default" : "outline"}
                            >
                                <List className="w-4 h-4 mr-1" />
                                List
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => onViewModeChange("grid")}
                                className="px-3"
                                style={{
                                    backgroundColor:
                                        viewMode === "grid" ? THEME_COLOR : "transparent",
                                    borderColor: THEME_COLOR,
                                    color: viewMode === "grid" ? "#fff" : THEME_COLOR,
                                }}
                                variant={viewMode === "grid" ? "default" : "outline"}
                            >
                                <Grid className="w-4 h-4 mr-1" />
                                Grid
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Results Info */}
                <div className="mt-4">
                    <p className="text-sm text-gray-500">
                        Showing <span className="font-semibold">{resultCount}</span> results
                        as per your search criteria
                    </p>
                </div>
            </div>
        </div>
    );
};
