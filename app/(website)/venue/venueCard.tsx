import { Star, MapPin, Users, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface Venue {
    id: string;
    name: string;
    location: string;
    city: string;
    rating: number;
    reviewCount: number;
    images: string[];
    venueTypes: string[];
    capacity: string;
    priceRange: string;
    isHandpicked?: boolean;
}

interface VenueCardProps {
    venue: Venue;
    onVenueClick: (venueId: string) => void;
}

export const VenueCard = ({ venue, onVenueClick }: VenueCardProps) => {
    return (
        <Card
            className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
            onClick={() => onVenueClick(venue.id)}
        >
            <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                    src={venue.images[0] || "/placeholder.svg"}
                    width={64}
                    height={64}
                    alt={venue.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {venue.isHandpicked && (
                    <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
                        <Star className="w-3 h-3 mr-1" />
                        Handpicked
                    </Badge>
                )}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                    <Badge variant="secondary" className="bg-black/70 text-white">
                        <Camera className="w-3 h-3 mr-1" />
                        {venue.images.length}
                    </Badge>
                </div>
            </div>

            <CardContent className="p-4">
                <div className="space-y-3">
                    <div>
                        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                            {venue.name}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="line-clamp-1">{venue.location}, {venue.city}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                <Star className="w-4 h-4 text-accent fill-current" />
                                <span className="font-semibold ml-1">{venue.rating}</span>
                                <span className="text-sm text-muted-foreground ml-1">
                                    ({venue.reviewCount} reviews)
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {venue.venueTypes.slice(0, 2).map((type, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                                {type}
                            </Badge>
                        ))}
                        {venue.venueTypes.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                                +{venue.venueTypes.length - 2} more
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="w-4 h-4 mr-1" />
                            <span>{venue.capacity}</span>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-muted-foreground">Starting from</div>
                            <div className="font-semibold text-primary">{venue.priceRange}</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};