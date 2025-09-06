"use client"; // if you're using Next.js 13+ with the App Router

import { useState } from "react";
import Image from "next/image";

const THEME_COLOR = "#212D47";

interface City {
    id: string;
    name: string;
    image: string;
    count?: number;
}

const cities: City[] = [
    { id: "delhi", name: "Delhi NCR", image: "/lovable-uploads/6ee5ab1d-1141-425e-b462-09e908fbc787.png" },
    { id: "mumbai", name: "Mumbai", image: "/lovable-uploads/6ee5ab1d-1141-425e-b462-09e908fbc787.png" },
    { id: "bangalore", name: "Bangalore", image: "/lovable-uploads/6ee5ab1d-1141-425e-b462-09e908fbc787.png" },
    { id: "hyderabad", name: "Hyderabad", image: "/lovable-uploads/6ee5ab1d-1141-425e-b462-09e908fbc787.png" },
    { id: "chennai", name: "Chennai", image: "/lovable-uploads/6ee5ab1d-1141-425e-b462-09e908fbc787.png" },
    { id: "goa", name: "Goa", image: "/lovable-uploads/6ee5ab1d-1141-425e-b462-09e908fbc787.png" },
    { id: "jaipur", name: "Jaipur", image: "/lovable-uploads/6ee5ab1d-1141-425e-b462-09e908fbc787.png" },
    { id: "pune", name: "Pune", image: "/lovable-uploads/6ee5ab1d-1141-425e-b462-09e908fbc787.png" },
    { id: "kolkata", name: "Kolkata", image: "/lovable-uploads/6ee5ab1d-1141-425e-b462-09e908fbc787.png" },
    { id: "lucknow", name: "Lucknow", image: "/lovable-uploads/6ee5ab1d-1141-425e-b462-09e908fbc787.png" },
];

interface CitySelectorProps {
    selectedCity: string;
    onCityChange: (cityId: string) => void;
}

export const CitySelector = ({ selectedCity, onCityChange }: CitySelectorProps) => {
    return (
        <div className="py-6">
            <div className="flex flex-wrap items-center justify-center gap-4 max-w-6xl mx-auto">
                {cities.map((city) => (
                    <button
                        key={city.id}
                        onClick={() => onCityChange(city.id)}
                        className={`group relative flex flex-col items-center transition-all duration-300 ${selectedCity === city.id ? "scale-110" : "hover:scale-105"
                            }`}
                    >
                        <div
                            className={`w-16 h-16 rounded-full overflow-hidden border-4 transition-all duration-300 ${selectedCity === city.id
                                    ? "shadow-lg"
                                    : `group-hover:border-[${THEME_COLOR}]/50`
                                }`}
                            style={{
                                borderColor: selectedCity === city.id ? THEME_COLOR : "var(--border)",
                                boxShadow: selectedCity === city.id ? `0 4px 10px ${THEME_COLOR}4D` : "none",
                            }}
                        >
                            {/* Using Image instead of background for optimization */}
                            <Image
                                src={city.image}
                                alt={city.name}
                                width={64}
                                height={64}
                                className="object-cover w-full h-full"
                                style={{
                                    background: `linear-gradient(135deg, #2A3759, ${THEME_COLOR})`,
                                }}
                            />
                        </div>
                        <span
                            className={`mt-2 text-sm font-medium transition-colors ${selectedCity === city.id
                                    ? `text-[${THEME_COLOR}]`
                                    : "text-muted-foreground group-hover:text-foreground"
                                }`}
                        >
                            {city.name}
                        </span>
                    </button>
                ))}

                {/* More Button */}
                <button className="group relative flex flex-col items-center">
                    <div
                        className="w-16 h-16 rounded-full bg-muted border-4 border-border group-hover:scale-105 flex items-center justify-center transition-all duration-300"
                        style={{
                            borderColor: "var(--border)",
                        }}
                    >
                        <span className="text-muted-foreground font-semibold text-sm">+40</span>
                    </div>
                    <span className="mt-2 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        More
                    </span>
                </button>
            </div>
        </div>
    );
};
