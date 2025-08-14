"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { MenuIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

// Image assets
const LOGO_IMG = "/images/logo-blue.png";
const FLOWER_IMG = "/images/flower-vector.svg";
const DROPDOWN_ARROW_IMG = "/images/drop-down-arrow.svg";
const SEARCH_ICON_IMG = "/images/search-icon.svg";

// Add nav routes
const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Venue", href: "/venue" },
  { label: "Hotels", href: "/hotels" },
  { label: "Wedding", href: "/wedding" },
  { label: "Blog", href: "/blogs" },
  { label: "Gallery", href: "/gallery" },
];

const LOCATIONS = ["Delhi", "Mumbai", "Bangalore", "Jaipur", "Goa"];
const FILTERS = ["All", "Popular", "Budget", "Luxury"];

export default function Header() {
  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);

  return (
    <header className="w-full bg-neutral-50/80 backdrop-blur-md sticky top-0 z-50 border-b border-neutral-200">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between py-2 min-h-12 md:min-h-16 gap-2 md:gap-4">
        {/* Logo and Flower */}
        <div className="flex items-center gap-2 md:gap-4 min-w-fit">
          <motion.img
            src={LOGO_IMG}
            alt="Logo"
            className="h-8 sm:h-10 w-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          />
          <motion.img
            src={FLOWER_IMG}
            alt="Decorative Flower"
            className="h-6 sm:h-8 w-auto md:h-12"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        </div>
        {/* Desktop Navbar - only show on xl and up */}
        <nav className="hidden xl:flex flex-1 items-center justify-center">
          <ul className="flex flex-row gap-6 lg:gap-10 text-[#212d47] text-sm font-medium font-cormorant uppercase tracking-wide">
            {NAV_ITEMS.map((item) => (
              <li key={item.label} className="whitespace-nowrap">
                <Link href={item.href} className="hover:text-primary transition-colors">{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        {/* Desktop Location & Filters - only show on xl and up */}
        <div className="hidden xl:flex items-center gap-2 min-w-fit">
          {/* Location (Command + Popover) */}
          <Popover open={locationOpen} onOpenChange={setLocationOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 border border-[#212d47] rounded-xs bg-white/80 uppercase text-[#212d47] text-sm font-medium font-cormorant min-w-[8rem]"
                aria-label="Select location"
              >
                <img src={SEARCH_ICON_IMG} alt="Search" className="h-4 w-4" />
                <span>{selectedLocation}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 p-0">
              <Command>
                <CommandInput placeholder="Search location..." />
                <CommandList>
                  {LOCATIONS.map((loc) => (
                    <CommandItem
                      key={loc}
                      value={loc}
                      onSelect={() => {
                        setSelectedLocation(loc);
                        setLocationOpen(false);
                      }}
                    >
                      {loc}
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {/* Filters (Select/Combobox) */}
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="flex items-center gap-2 border border-[#212d47] rounded-xs bg-white/80 uppercase text-[#212d47] text-sm font-medium font-cormorant min-w-[7rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTERS.map((filter) => (
                <SelectItem key={filter} value={filter}>
                  {filter}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Hamburger: show on all screens except xl and up */}
        <div className="flex xl:hidden flex-1 justify-end">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-[#212d47]">
                <MenuIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-full max-w-xs">
                <SheetTitle hidden aria-hidden="true">Shadi Venue</SheetTitle>
              <div className="flex flex-col gap-6 p-4 sm:p-6">
                {/* Logo and Flower in Sheet */}
                <div className="flex items-center gap-2 mb-4">
                  <img src={LOGO_IMG} alt="Logo" className="h-8 w-auto" />
                  <img src={FLOWER_IMG} alt="Decorative Flower" className="h-6 w-auto" />
                </div>
                {/* Nav */}
                <nav>
                  <ul className="flex flex-col gap-4 text-[#212d47] text-base font-medium font-cormorant uppercase">
                    {NAV_ITEMS.map((item) => (
                      <li key={item.label}>
                        <a href={item.href} className="hover:text-primary transition-colors">{item.label}</a>
                      </li>
                    ))}
                  </ul>
                </nav>
                {/* Location */}
                <div className="mt-4">
                  <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 border border-[#212d47] rounded-xs bg-white/80 uppercase text-[#212d47] text-base font-medium font-cormorant w-full"
                        aria-label="Select location"
                      >
                        <img src={SEARCH_ICON_IMG} alt="Search" className="h-4 w-4" />
                        <span>{selectedLocation}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search location..." />
                        <CommandList>
                          {LOCATIONS.map((loc) => (
                            <CommandItem
                              key={loc}
                              value={loc}
                              onSelect={() => {
                                setSelectedLocation(loc);
                                setLocationOpen(false);
                              }}
                            >
                              {loc}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                {/* Filters */}
                <div className="mt-2">
                  <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                    <SelectTrigger className="flex items-center gap-2 border border-[#212d47] rounded-xs bg-white/80 uppercase text-[#212d47] text-base font-medium font-cormorant w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FILTERS.map((filter) => (
                        <SelectItem key={filter} value={filter}>
                          {filter}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
