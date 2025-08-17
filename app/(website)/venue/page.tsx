import React, { useState, useEffect, useMemo } from 'react';
import { Search, List, Grid, MapPin, Star, Users, Camera, ChevronDown } from 'lucide-react';
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
import { useRouter } from 'next/navigation';

// Redux imports
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import {
  fetchActiveHotels,
  selectActiveHotels,
  selectHotelLoading,
  selectHotelError,
  selectSearchQuery,
  selectFilters,
  selectHotelHasFetched,
  setSearchQuery,
  setFilters,
  clearFilters,
  clearError,
  Hotel
} from '@/lib/redux/features/hotelSlice';

const THEME_COLOR = '#212D47';

const cities = [
  { id: 'delhi', name: 'Delhi NCR', image: '/api/placeholder/64/64' },
  { id: 'mumbai', name: 'Mumbai', image: '/api/placeholder/64/64' },
  { id: 'bangalore', name: 'Bangalore', image: '/api/placeholder/64/64' },
  { id: 'hyderabad', name: 'Hyderabad', image: '/api/placeholder/64/64' },
  { id: 'chennai', name: 'Chennai', image: '/api/placeholder/64/64' },
  { id: 'goa', name: 'Goa', image: '/api/placeholder/64/64' },
  { id: 'jaipur', name: 'Jaipur', image: '/api/placeholder/64/64' },
  { id: 'pune', name: 'Pune', image: '/api/placeholder/64/64' }
];

type ViewMode = 'list' | 'grid';

interface VenueCardProps {
  venue: Hotel;
  onVenueClick: (venueId: string) => void;
}

const DynamicVenuePage: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Redux state selectors
  const activeHotels = useAppSelector(selectActiveHotels);
  const loading = useAppSelector(selectHotelLoading);
  const error = useAppSelector(selectHotelError);
  const searchQuery = useAppSelector(selectSearchQuery);
  const filters = useAppSelector(selectFilters);
  const hasFetched = useAppSelector(selectHotelHasFetched);

  // Local state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [openSections, setOpenSections] = useState<string[]>([]);

  // Fetch active hotels on component mount
  useEffect(() => {
    if (!hasFetched) {
      dispatch(fetchActiveHotels());
    }
  }, [dispatch, hasFetched]);

  // Dynamic filter options derived from active hotels
  const filterOptions = useMemo(() => {
    const categories = [...new Set(activeHotels.map(hotel => hotel.category).filter(Boolean))];
    const locations = [...new Set(activeHotels.map(hotel => hotel.location?.city).filter(Boolean))];
    const venueTypes = [...new Set(activeHotels.map(hotel => hotel.venueType).filter(Boolean))];
    const capacities = [...new Set(activeHotels.map(hotel => hotel.maxGuestCapacity).filter(Boolean))];

    return {
      categories,
      locations,
      venueTypes,
      capacities,
      priceRanges: ['< ₹ 1,500', '₹ 1,500 - ₹ 2,500', '₹ 2,500 - ₹ 4,000', '> ₹ 4,000'],
      ratings: ['All Ratings', '4+', '4.5+', '4.8+']
    };
  }, [activeHotels]);

  // Filter active hotels based on current filters and search
  const filteredVenues = useMemo(() => {
    return activeHotels.filter(hotel => {
      // Text search
      const matchesSearch = !searchQuery || 
        hotel.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotel.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotel.location?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotel.category?.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = !filters.category || hotel.category === filters.category;

      // City filter
      const matchesCity = !filters.city || hotel.location?.city === filters.city;

      // Price range filter - using the exact filter structure from hotelSlice
      const matchesPrice = hotel.priceRange?.startingPrice >= filters.priceRange[0] && 
                          hotel.priceRange?.startingPrice <= filters.priceRange[1];

      // Rating filter
      const matchesRating = !filters.rating || hotel.rating >= filters.rating;

      return matchesSearch && matchesCategory && matchesCity && matchesPrice && matchesRating;
    });
  }, [activeHotels, searchQuery, filters]);

  // Handle search changes
  const handleSearchChange = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  // Handle filter changes with proper typing
  const handleFilterChange = (category: string, value: string, checked: boolean) => {
    if (!checked) {
      const resetFilter: any = {};
      if (category === 'priceRange') {
        resetFilter[category] = [0, 10000] as [number, number];
      } else if (category === 'rating') {
        resetFilter[category] = 0;
      } else {
        resetFilter[category] = '';
      }
      dispatch(setFilters(resetFilter));
      return;
    }

    const updatedFilter: any = {};

    if (category === 'priceRange') {
      if (value.startsWith('<')) updatedFilter[category] = [0, 1500] as [number, number];
      else if (value.includes('1,500 - ₹ 2,500')) updatedFilter[category] = [1500, 2500] as [number, number];
      else if (value.includes('2,500 - ₹ 4,000')) updatedFilter[category] = [2500, 4000] as [number, number];
      else updatedFilter[category] = [4000, 100000] as [number, number];
    } else if (category === 'rating') {
      if (value === 'All Ratings') updatedFilter[category] = 0;
      else updatedFilter[category] = parseFloat(value) || 0;
    } else {
      updatedFilter[category] = value;
    }

    dispatch(setFilters(updatedFilter));
  };

  // Clear all filters
  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  // Handle retry on error
  const handleRetry = () => {
    dispatch(clearError());
    dispatch(fetchActiveHotels());
  };

  // Handle venue click
  const handleVenueClick = (venueId: string) => {
    router.push(`/venue/${venueId}`);
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.city) count++;
    if (filters.rating > 0) count++;
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 10000) count++;
    return count;
  }, [filters]);

  // Hero Component
  const Hero: React.FC = () => (
    <div className="relative bg-gradient-to-r from-[#212D47] to-[#2A3759] text-white py-20">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Find Your Perfect Wedding Venue
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          Discover amazing venues for your special day
        </p>
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search for wedding venues..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-12 py-4 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // City Selector Component
  const CitySelector: React.FC = () => (
    <div className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Popular Cities</h2>
        <div className="flex flex-wrap items-center justify-center gap-6">
          {cities.map((city) => (
            <button
              key={city.id}
              onClick={() => dispatch(setFilters({ city: city.name.replace(' NCR', '') }))}
              className={`group relative flex flex-col items-center transition-all duration-300 ${
                filters.city === city.name.replace(' NCR', '') ? 'scale-110' : 'hover:scale-105'
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full overflow-hidden border-4 transition-all duration-300 ${
                  filters.city === city.name.replace(' NCR', '') 
                    ? 'shadow-lg border-[#212D47]' 
                    : 'border-gray-300 hover:border-[#212D47]/50'
                }`}
              >
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className={`mt-2 text-sm font-medium transition-colors ${
                filters.city === city.name.replace(' NCR', '') 
                  ? 'text-[#212D47]' 
                  : 'text-gray-600 group-hover:text-gray-900'
              }`}>
                {city.name}
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
      category: { title: 'Category', options: filterOptions.categories },
      city: { title: 'Location', options: filterOptions.locations },
      priceRange: { title: 'Price Range', options: filterOptions.priceRanges },
      rating: { title: 'Rating', options: filterOptions.ratings }
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Object.entries(filterCategories).map(([key, category]) => (
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
                {category.options.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${key}-${option}`}
                      checked={
                        key === 'rating'
                          ? filters.rating === parseFloat(option) || (option === 'All Ratings' && filters.rating === 0)
                          : key === 'priceRange'
                            ? (option.startsWith('<') && filters.priceRange[0] === 0 && filters.priceRange[1] === 1500) ||
                              (option.includes('1,500 - ₹ 2,500') && filters.priceRange[0] === 1500 && filters.priceRange[1] === 2500) ||
                              (option.includes('2,500 - ₹ 4,000') && filters.priceRange[0] === 2500 && filters.priceRange[1] === 4000) ||
                              (option.startsWith('>') && filters.priceRange[0] === 4000)
                            : (filters as any)[key] === option
                      }
                      onCheckedChange={(checked) => handleFilterChange(key, option, checked as boolean)}
                    />
                    <Label htmlFor={`${key}-${option}`} className="text-xs text-gray-600 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
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
                placeholder="Search Wedding Venues..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {activeFilterCount > 0 && (
              <Badge className="bg-[#212D47] text-white">
                {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied
              </Badge>
            )}

            <div className="flex items-center gap-2">
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
          alt={venue.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <Badge variant="secondary" className="bg-black/70 text-white">
            <Camera className="w-3 h-3 mr-1" />
            {venue.images?.length || 1}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-[#212D47] transition-colors">
              {venue.name}
            </h3>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="line-clamp-1">
                {venue.location?.city}, {venue.location?.state}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-semibold ml-1">{venue.rating?.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {venue.amenities?.slice(0, 2).map((amenity, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {venue.amenities && venue.amenities.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{venue.amenities.length - 2} more
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-1" />
              <span>{venue.maxGuestCapacity || 'N/A'} guests</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Starting from</div>
              <div className="font-semibold text-[#212D47]">
                {venue.priceRange?.startingPrice} {venue.priceRange?.currency}
              </div>
            </div>
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
          {error || 'Failed to load venues. Please try again.'}
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
        <h3 className="text-lg font-semibold mb-2">No venues found</h3>
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

      {/* City Selector */}
      <CitySelector />

      {/* Filters Section */}
      <section className="bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <VenueFilters />
        </div>
      </section>

      {/* Search and Controls */}
      <VenueSearch />

      {/* Results Section */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Wedding Venues</h2>
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
        {!loading && !error && filteredVenues.length > 0 && (
          <div className={`grid gap-6 ${viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
          }`}>
            {filteredVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} onVenueClick={handleVenueClick} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DynamicVenuePage;