"use client";

import { MapPin, Star, Users, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchBanquets,
    selectBanquets,
    selectBanquetLoading,
    selectBanquetError,
    type Banquet,
} from "@/lib/redux/features/banquetSlice";
import { AppDispatch } from "@/lib/redux/store";

interface VenueCardProps {
    venue: Banquet;
    onVenueClick: (venueId: string) => void;
}

export const VenueCard = ({ venue, onVenueClick }: VenueCardProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const banquets = useSelector(selectBanquets) || [];
    const loading = useSelector(selectBanquetLoading);
    const error = useSelector(selectBanquetError);

    useEffect(() => {
        if (!banquets.length) dispatch(fetchBanquets());
    }, [dispatch, banquets.length]);

    if (loading) {
        return <p className="text-center text-lg mt-6">Loading banquets...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500 mt-6">Error loading banquets: {error}</p>;
    }

    return (
        <Card
            className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
            onClick={() => onVenueClick(venue.id)}
        >
            <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                    src={venue.images?.[0] || "/placeholder.svg"}
                    width={64}
                    height={64}
                    alt={venue.venueName}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                    {venue.images && venue.images.length > 0 && (
                        <Badge variant="secondary" className="bg-black/70 text-white">
                            <Camera className="w-3 h-3 mr-1" />
                            {venue.images.length}
                        </Badge>
                    )}
                </div>
            </div>

            <CardContent className="p-4">
                <div className="space-y-3">
                    <div>
                        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                            {venue.venueName}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="line-clamp-1">
                                {venue.location.city}, {venue.location.state}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                <Star className="w-4 h-4 text-accent fill-current" />
                                <span className="font-semibold ml-1">{(venue.rating || 0).toFixed(1)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {venue.amenities?.slice(0, 2).map((type: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                                {type}
                            </Badge>
                        ))}
                        {venue.amenities && venue.amenities.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                                +{venue.amenities.length - 2} more
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="w-4 h-4 mr-1" />
                            <span>{venue.maxGuestCapacity || venue.capacity || "N/A"} guests</span>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-muted-foreground">Starting from</div>
                            <div className="font-semibold text-primary">
                                {venue.priceRange.startingPrice} {venue.priceRange.currency}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
