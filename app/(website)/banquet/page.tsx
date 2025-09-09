"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, List, Grid, MapPin, Star, Users, Camera, ChevronDown, Wifi, Car, Coffee, Dumbbell, Waves, Utensils, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useRouter, useSearchParams } from 'next/navigation';

// Redux imports
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import {
  fetchActiveBanquets,
  selectActiveBanquets,
  selectBanquetLoading,
  selectBanquetError,
  selectSearchQuery,
  selectFilters,
  selectBanquetHasFetched,
  setSearchQuery,
  setFilters,
  clearFilters,
  clearError,
  type Banquet
} from '@/lib/redux/features/banquetSlice';


type ViewMode = 'list' | 'grid';

interface VenueCardProps {
  venue: Banquet;
  onVenueClick: (venueId: string) => void;
}


const DynamicVenuePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  // Redux state selectors
  const activeBanquets = useAppSelector(selectActiveBanquets);
  const loading = useAppSelector(selectBanquetLoading);
  const error = useAppSelector(selectBanquetError);
  const searchQuery = useAppSelector(selectSearchQuery);
  const filters = useAppSelector(selectFilters);
  const hasFetched = useAppSelector(selectBanquetHasFetched);

  // Local state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [localSearch, setLocalSearch] = useState<string>('');
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // On mount, fetch banquets and reset filters
  useEffect(() => {
    if (!hasFetched) {
      dispatch(fetchActiveBanquets());
    }
    // Clear filters and search by default
    dispatch(clearFilters());
    dispatch(setSearchQuery(''));
    setLocalSearch('');

    // If deep link contains ?search=city, initialize filters accordingly
    const qp = searchParams.get('search');
    if (qp && qp.trim() !== '') {
      dispatch(setFilters({ city: qp }));
      dispatch(setSearchQuery(qp));
      setLocalSearch(qp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, hasFetched]);

  // Avoid syncing redux search back into input to prevent focus jumps

  // Dynamic filter options derived from active banquets only
  const filterOptions = useMemo(() => {
    const categories = Array.from(
      new Set(activeBanquets.map(b => b.category).filter(cat => cat && cat.trim() !== ''))
    );
    
    const cities = Array.from(
      new Set(activeBanquets.map(b => b.location?.city).filter(city => city && city.trim() !== ''))
    );
    const venueTypes = Array.from(
      new Set(activeBanquets.map(b => b.venueType).filter(v => v && String(v).trim() !== ''))
    );
    
    const countries = Array.from(
      new Set(activeBanquets.map(b => b.location?.country).filter(country => country && country.trim() !== ''))
    );
    
    const states = Array.from(
      new Set(activeBanquets.map(b => b.location?.state).filter(state => state && state.trim() !== ''))
    );

    // Dynamic price ranges based on actual venue prices (exclude 0 prices)
    const prices = activeBanquets
      .map(b => b.priceRange?.startingPrice)
      .filter(price => price !== undefined && price !== null && price > 0)
      .sort((a, b) => a - b);
    
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 10000;
    const midPrice = prices.length > 0 ? Math.floor((minPrice + maxPrice) / 2) : 5000;
    
    const priceRanges = prices.length > 0 ? [
      `₹ ${minPrice} - ₹ ${midPrice}`,
      `₹ ${midPrice + 1} - ₹ ${maxPrice}`,
      `> ₹ ${maxPrice}`
    ] : [];

    // Dynamic ratings based on actual venue ratings (not used in filters now)
    const ratings: number[] = [];

    return {
      categories,
      cities,
      countries,
      states,
      priceRanges,
      ratings: ['All Ratings', ...ratings.map(rating => `${rating}+`)],
      venueTypes,
      minPrice,
      maxPrice,
      midPrice
    };
  }, [activeBanquets]);

  // Filter active banquets based on current filters and search
  const filteredVenues = useMemo(() => {
    return activeBanquets.filter(banquet => {
      // Text search across multiple fields
      const matchesSearch = !searchQuery ||
        banquet.venueName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        banquet.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        banquet.location?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        banquet.location?.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        banquet.location?.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        banquet.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        banquet.amenities?.some(amenity => 
          amenity.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // City filter - show all venues if no filter is applied
      const matchesCity = !filters.city || 
        (banquet.location?.city && banquet.location.city.trim() !== '' && banquet.location.city === filters.city);

      // Venue type filter
      const matchesVenueType = !filters.venueType || (banquet.venueType && banquet.venueType === filters.venueType);

      // Capacity filter
      const matchesCapacity =
        (typeof filters.minCapacity === 'number' ? banquet.capacity >= filters.minCapacity : true) &&
        (typeof filters.maxCapacity === 'number' ? banquet.capacity <= filters.maxCapacity : true);

      return matchesSearch && matchesCity && matchesVenueType && matchesCapacity;
    });
  }, [activeBanquets, searchQuery, filters]);

  // Apply-only search to avoid re-rendering while typing
  const applySearch = () => {
    const raw = searchInputRef.current ? searchInputRef.current.value : localSearch;
    const trimmed = (raw || '').trim();
    if (searchQuery !== trimmed) {
      dispatch(setSearchQuery(trimmed));
    }
    setLocalSearch(trimmed);
  };

  // Handle filter changes
  const handleFilterChange = (category: string, value: string, checked: boolean) => {
    if (!checked) {
      // Reset to default values that show all venues
      const resetFilter: any = {};
      if (category === 'city' || category === 'venueType') resetFilter[category] = '';
      dispatch(setFilters(resetFilter));
      return;
    }

    const updatedFilter: any = {};

    if (category === 'city' || category === 'venueType') updatedFilter[category] = value;

    dispatch(setFilters(updatedFilter));
  };

  // Clear all filters
  const handleClearFilters = () => {
    dispatch(clearFilters());
    // Also reset search
    dispatch(setSearchQuery(''));
    setLocalSearch('');
  };

  // Handle retry on error
  const handleRetry = () => {
    dispatch(clearError());
    dispatch(fetchActiveBanquets());
  };

  // Handle venue click
  const handleVenueClick = (venueId: string) => {
    router.push(`/banquet/${venueId}`);
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.city) count++;
    if (filters.venueType) count++;
    return count;
  }, [filters]);

  // Hero Component
  const Hero: React.FC = () => (
    <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#212D47] to-[#2A3759]">
      {/* Hero Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/about-new/A gorgeous mandap decor and a beautiful….jpg"
          alt="Beautiful Wedding Mandap"
          className="w-full h-full object-cover object-center"
          style={{ opacity: 0.35 }}
          draggable={false}
        />
        {/* Overlay for darkening */}
        <div className="absolute inset-0 bg-[#212D47] opacity-60" />
      </div>
      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center justify-center px-4 py-16 md:py-24 text-center">
        {/* Breadcrumb */}
        <nav
          className="flex items-center justify-center gap-2 mb-4 text-sm md:text-base"
          aria-label="Breadcrumb"
        >
          <a
            href="/"
            className="text-white hover:text-gray-200 transition-colors font-medium"
            aria-label="Home"
          >
            Home
          </a>
          <span className="text-gray-300">/</span>
          <a
            href="/banquet"
            className="text-white hover:text-gray-200 transition-colors font-medium"
            aria-label="Banquet"
          >
            Banquet
          </a>
        </nav>
        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-wide uppercase mb-3">
        Uncover Stunning Banquets for Your Big Day
        </h1>
        {/* Decorative Black Line */}
        <div className="mx-auto w-10 h-1 bg-black/80 rounded mb-4" />
        <p className="text-lg sm:text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
          Discover amazing banquets for your special day
        </p>
        {/* Search is available in the sticky toolbar below to avoid duplicate inputs */}
      </div>
    </section>
  );

  // Dynamic City Selector Component
  const CitySelector: React.FC = () => (
    <div className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Popular Cities</h2>
        <div className="flex flex-wrap items-center justify-center gap-6">
          {filterOptions.cities.slice(0, 8).map((city) => (
            <button
              key={city}
              onClick={() => dispatch(setFilters({ city }))}
              className={`group relative flex flex-col items-center transition-all duration-300 ${
                filters.city === city ? 'scale-110' : 'hover:scale-105'
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full overflow-hidden border-4 transition-all duration-300 flex items-center justify-center ${
                  filters.city === city 
                    ? 'shadow-lg border-[#212D47] bg-[#212D47]' 
                    : 'border-gray-300 hover:border-[#212D47]/50 bg-gray-100'
                }`}
              >
                <MapPin className={`w-8 h-8 ${
                  filters.city === city ? 'text-white' : 'text-gray-600'
                }`} />
              </div>
              <span className={`mt-2 text-sm font-medium transition-colors text-center ${
                filters.city === city 
                  ? 'text-[#212D47]' 
                  : 'text-gray-600 group-hover:text-gray-900'
              }`}>
                {city}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Venue Filters Component
  const VenueFilters: React.FC = () => {
    const filterCategories = {
      city: { title: 'City', options: filterOptions.cities },
      venueType: { title: 'Venue Type', options: filterOptions.venueTypes },
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Object.entries(filterCategories).map(([key, category]) => (
            category.options.length > 0 && (
              <Collapsible key={key} open={openSections.includes(key)}>
                <CollapsibleTrigger
                  onClick={() =>
                    setOpenSections(prev =>
                      prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
                    )
                  }
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="font-medium text-sm text-[#212D47]">{category.title}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#212D47] transition-transform ${
                      openSections.includes(key) ? 'rotate-180' : ''
                    }`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-2">
                  {category.options.map((option: string) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${key}-${option}`}
                        checked={(filters as any)[key] === option}
                        onCheckedChange={(checked) => handleFilterChange(key, option, checked as boolean)}
                      />
                      <Label htmlFor={`${key}-${option}`} className="text-xs text-gray-600 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )
          ))}
        </div>

        <div className="flex gap-4 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={handleClearFilters}>
            Reset
          </Button>
          <Button className="px-8 bg-[#212D47] hover:bg-[#1A2335] text-white">
            View Results ({filteredVenues.length})
          </Button>
        </div>
      </div>
    );
  };

  // Venue Search Component
  const VenueSearch: React.FC = () => (
    <div className="bg-card border-b p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                placeholder="Search Wedding Banquets..."
                defaultValue={localSearch}
                onChange={() => { /* uncontrolled typing - do not dispatch */ }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applySearch();
                  }
                }}
                onBlur={(e) => {
                  const next = e.relatedTarget as HTMLElement | null;
                  if (!next || !next.closest('.venue-search-controls')) {
                    setTimeout(() => {
                      searchInputRef.current?.focus();
                    }, 0);
                  }
                }}
                ref={searchInputRef}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 venue-search-controls">
            {activeFilterCount > 0 && (
              <Badge className="bg-[#212D47] text-white">
                {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied
              </Badge>
            )}

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={applySearch}>Apply</Button>
              <Button
                size="sm"
                onClick={() => setViewMode('list')}
                variant={viewMode === 'list' ? 'default' : 'outline'}
                className={viewMode === 'list' ? 'bg-[#212D47] text-white' : ''}
              >
                <List className="w-4 h-4 mr-1" />
                List
              </Button>
              <Button
                size="sm"
                onClick={() => setViewMode('grid')}
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                className={viewMode === 'grid' ? 'bg-[#212D47] text-white' : ''}
              >
                <Grid className="w-4 h-4 mr-1" />
                Grid
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold">{filteredVenues.length}</span> results
            {(searchQuery || activeFilterCount > 0) && ' matching your criteria'}
          </p>
        </div>
      </div>
    </div>
  );

  // Venue Card Component
  const VenueCard: React.FC<VenueCardProps> = ({ venue, onVenueClick }) => (
    <Card
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
      onClick={() => onVenueClick(venue.id)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={venue.images?.[0] || '/api/placeholder/400/300'}
          alt={venue.venueName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <Badge variant="secondary" className="bg-black/70 text-white">
            <Camera className="w-3 h-3 mr-1" />
            {venue.images?.length || 1}
          </Badge>
        </div>
        {venue.status && venue.status !== 'active' && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-yellow-500/90 text-white">
              {venue.status.toUpperCase()}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-[#212D47] transition-colors">
              {venue.venueName}
            </h3>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="line-clamp-1">
                {venue.location?.city && venue.location.city.trim() !== '' ? venue.location.city : 'Location not specified'}
                {venue.location?.state && venue.location.state.trim() !== '' && `, ${venue.location.state}`}
              </span>
            </div>
            {venue.category && venue.category.trim() !== '' && (
              <Badge variant="outline" className="mt-1 text-xs">
                {venue.category}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {venue.rating > 0 && (
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-semibold ml-1">{venue.rating?.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          {venue.amenities && venue.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {venue.amenities.slice(0, 3).map((amenity, index) => {
                const key = amenity?.toLowerCase() || '';
                const iconMap: Record<string, any> = {
                  'wifi': Wifi,
                  'free wifi': Wifi,
                  'pool': Waves,
                  'swimming pool': Waves,
                  'spa': Waves,
                  'fitness center': Dumbbell,
                  'gym': Dumbbell,
                  'restaurant': Utensils,
                  'dining': Utensils,
                  'parking': Car,
                  'room service': Coffee,
                };
                const Icon = iconMap[key] || Object.keys(iconMap).find(k => key.includes(k)) ? iconMap[Object.keys(iconMap).find(k => key.includes(k)) as string] : Info;
                const label = amenity.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
                return (
                  <Badge key={index} variant="outline" className="text-xs flex items-center gap-1">
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </Badge>
                );
              })}
              {venue.amenities.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{venue.amenities.length - 3} more
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-1" />
              <span>{(venue as any).maxGuestCapacity || venue.capacity || 'N/A'} guests</span>
            </div>
            {venue.priceRange && venue.priceRange.startingPrice > 0 && (
              <div className="text-right">
                <div className="text-sm text-gray-600">Starting from</div>
                <div className="font-semibold text-[#212D47]">
                  ₹{venue.priceRange.startingPrice.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Loading Skeleton
  const LoadingSkeleton: React.FC = () => (
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

  // Error Display
  const ErrorDisplay: React.FC = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <Alert className="max-w-md mb-4">
        <AlertDescription>
          {error || 'Failed to load banquets. Please try again.'}
        </AlertDescription>
      </Alert>
      <Button onClick={handleRetry} variant="outline">
        Try Again
      </Button>
    </div>
  );

  // No Results Display
  const NoResults: React.FC = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">No banquets found</h3>
        <p className="text-gray-600 mb-4">
          Try adjusting your search criteria or filters
        </p>
        <Button onClick={handleClearFilters} variant="outline">
          Clear Filters
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <Hero />

      {/* City Selector - Only show if there are cities */}
      {filterOptions.cities.length > 0 && <CitySelector />}

      {/* Filters Section - Only show if there are filter options */}
      {(filterOptions.categories.length > 0 || filterOptions.cities.length > 0 || filterOptions.ratings.length > 1) && (
        <section className="bg-gray-50 py-6">
          <div className="max-w-7xl mx-auto px-4">
            <VenueFilters />
          </div>
        </section>
      )}

      {/* Search and Controls */}
      <VenueSearch />

      {/* Results Section */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Wedding Banquets</h2>
          {!loading && !error && (
            <p className="text-gray-600">
              Showing {filteredVenues.length} results
              {(searchQuery || activeFilterCount > 0) && ' matching your criteria'}
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && <LoadingSkeleton />}

        {/* Error State */}
        {error && !loading && <ErrorDisplay />}

        {/* No Results State */}
        {!loading && !error && filteredVenues.length === 0 && hasFetched && <NoResults />}

        {/* Venues Grid */}
        {!loading && !error && filteredVenues.length > 0 && (() => {
          // New ordering:
          // 1) Featured first
          // 2) Then two rows of normal (~6 on lg)
          // 3) Then premium
          // 4) Then remaining normal
          const featured = filteredVenues.filter(v => (v as any).isFeatured);
          const premium = filteredVenues.filter(v => v.isPremium && !(v as any).isFeatured);
          const normal = filteredVenues.filter(v => !v.isPremium && !(v as any).isFeatured);
          const firstNormalChunk = normal.slice(0, 6);
          const remainingNormal = normal.slice(6);
          const ordered = [...featured, ...firstNormalChunk, ...premium, ...remainingNormal];
          return (
            <div className={`grid gap-6 ${viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
            }`}>
              {ordered.map((venue) => (
                <div key={venue.id} className="relative">
                  {venue.isPremium && (
                    <Badge className="absolute top-2 left-2 z-10 bg-[#212D47] text-white">Premium</Badge>
                  )}
                  <VenueCard venue={venue} onVenueClick={handleVenueClick} />
                </div>
              ))}
            </div>
          );
        })()}
      </main>
    </div>
  );
};

export default DynamicVenuePage;