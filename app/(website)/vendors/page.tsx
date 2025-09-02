"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, List, Grid, MapPin, Star, Users, Camera, ChevronDown, Award, Phone, Mail, Globe, Heart, Calendar } from 'lucide-react';
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
  fetchActiveVendors,
  selectActiveVendors,
  selectVendorLoading,
  selectVendorError,
  selectVendorHasFetched,
  selectVendorFilters,
  selectFilteredVendors,
  setFilters,
  clearFilters,
  clearError,
  Vendor
} from '@/lib/redux/features/vendorSlice';

type ViewMode = 'list' | 'grid';

interface VendorCardProps {
  vendor: Vendor;
  onVendorClick: (vendorId: string) => void;
}

const DynamicVendorPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  // Redux state selectors
  const activeVendors = useAppSelector(selectActiveVendors);
  const loading = useAppSelector(selectVendorLoading);
  const error = useAppSelector(selectVendorError);
  const filters = useAppSelector(selectVendorFilters);
  const hasFetched = useAppSelector(selectVendorHasFetched);
  const filteredVendors = useAppSelector(selectFilteredVendors);

  // Local state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [localSearch, setLocalSearch] = useState<string>('');
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchDraftRef = useRef<string>('');

  // On mount, fetch vendors and initialize filters from URL once
  useEffect(() => {
    if (!hasFetched) {
      dispatch(fetchActiveVendors());
    }
  
    const qp = searchParams.get('search');
    const cityParam = searchParams.get('city');
  
    if (qp && qp.trim() !== '') {
      dispatch(setFilters({ city: qp, search: qp }));
      setLocalSearch(qp);
    } else if (cityParam && cityParam.trim() !== '') {
      dispatch(setFilters({ city: cityParam }));
      setLocalSearch(cityParam);
    } else {
      dispatch(clearFilters());
      // Don't reset localSearch here, let user keep typing
    }
    // Run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  

  // Avoid syncing redux search back into input on every change to prevent focus jumps

  // Removed continuous URL watching to prevent focus loss/scroll jumps while typing

  // Dynamic filter options derived from active vendors only
  const filterOptions = useMemo(() => {
    console.log('Active vendors:', activeVendors.length, activeVendors);
    
    const categories = Array.from(
      new Set(activeVendors.map(vendor => vendor.category).filter(cat => cat && cat.trim() !== ''))
    );
    
    const cities = Array.from(
      new Set(activeVendors.map(vendor => vendor.city).filter(city => city && city.trim() !== ''))
    );
    
    const serviceAreas = Array.from(
      new Set(activeVendors.flatMap(vendor => vendor.serviceAreas || []).filter(area => area && area.trim() !== ''))
    );

    // Dynamic price ranges based on actual vendor prices (exclude 0 prices)
    const prices = activeVendors
      .map(vendor => vendor.startingPrice)
      .filter(price => price !== undefined && price !== null && price > 0)
      .sort((a, b) => a - b);
    
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 100000;
    const midPrice = prices.length > 0 ? Math.floor((minPrice + maxPrice) / 2) : 50000;
    
    const priceRanges = prices.length > 0 ? [
      `₹ ${minPrice} - ₹ ${midPrice}`,
      `₹ ${midPrice + 1} - ₹ ${maxPrice}`,
      `> ₹ ${maxPrice}`
    ] : [];

    return {
      categories,
      cities,
      serviceAreas,
      priceRanges,
      minPrice,
      maxPrice,
      midPrice
    };
  }, [activeVendors]);

  // Apply search explicitly (no dispatch during typing)
  const applySearch = () => {
    const raw = searchInputRef.current ? searchInputRef.current.value : localSearch;
    const trimmed = (raw || '').trim();
    if (filters.search !== trimmed) {
      dispatch(setFilters({ search: trimmed }));
    }
    setLocalSearch(trimmed);
  };

  // Handle filter changes
  const handleFilterChange = (category: string, value: string, checked: boolean) => {
    if (!checked) {
      // Reset to default values that show all vendors
      const resetFilter: any = {};
      if (category === 'minPrice' || category === 'maxPrice') {
        resetFilter.minPrice = 0;
        resetFilter.maxPrice = 1000000;
      } else {
        resetFilter[category] = '';
      }
      dispatch(setFilters(resetFilter));
      return;
    }

    const updatedFilter: any = {};

    if (category === 'priceRange') {
      if (value.includes(`${filterOptions.minPrice} - ₹ ${filterOptions.midPrice}`)) {
        updatedFilter.minPrice = filterOptions.minPrice;
        updatedFilter.maxPrice = filterOptions.midPrice;
      } else if (value.includes(`${filterOptions.midPrice + 1} - ₹ ${filterOptions.maxPrice}`)) {
        updatedFilter.minPrice = filterOptions.midPrice + 1;
        updatedFilter.maxPrice = filterOptions.maxPrice;
      } else {
        updatedFilter.minPrice = filterOptions.maxPrice + 1;
        updatedFilter.maxPrice = 9999999;
      }
    } else {
      updatedFilter[category] = value;
    }

    dispatch(setFilters(updatedFilter));
  };

  // Clear all filters
  const handleClearFilters = () => {
    dispatch(clearFilters());
    setLocalSearch('');
  };

  // Handle retry on error
  const handleRetry = () => {
    dispatch(clearError());
    dispatch(fetchActiveVendors());
  };

  // Handle vendor click
  const handleVendorClick = (vendorId: string) => {
            router.push(`/vendors/${vendorId}`);
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.city) count++;
    if (filters.serviceArea) count++;
    if (filters.minPrice !== 0 || filters.maxPrice !== 1000000) count++;
    if (filters.search) count++;
    return count;
  }, [filters]);

  // Hero Component
  const Hero: React.FC = () => (
    <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#212D47] to-[#2A3759]">
      {/* Hero Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/about-new/A gorgeous mandap decor and a beautiful….jpg"
          alt="Beautiful Wedding Vendors"
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
            href="/vendor"
            className="text-white hover:text-gray-200 transition-colors font-medium"
            aria-label="Vendor"
          >
            Vendor
          </a>
        </nav>
        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-wide uppercase mb-3">
          Find Your Perfect Wedding Vendors
        </h1>
        {/* Decorative Black Line */}
        <div className="mx-auto w-10 h-1 bg-black/80 rounded mb-4" />
        <p className="text-lg sm:text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
          Discover amazing vendors for your special day
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
              onClick={() => {
                dispatch(setFilters({ city }));
                // Update URL with city parameter
                const params = new URLSearchParams(searchParams);
                if (city) {
                  params.set('city', city);
                } else {
                  params.delete('city');
                }
                router.push(`/vendors?${params.toString()}`, { scroll: false });
              }}
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

  // Category Selector Component
  const CategorySelector: React.FC = () => (
    <div className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {filterOptions.categories.map((category) => {
            const categoryIcons: Record<string, any> = {
              'Venue': MapPin,
              'Planner': Calendar,
              'Photographer': Camera,
              'Decorator': Heart,
              'Caterer': Users,
              'Makeup': Star,
              'Entertainment': Users,
              'Others': Users
            };
            const Icon = categoryIcons[category] || Users;
            
            return (
              <button
                key={category}
                onClick={() => {
                  dispatch(setFilters({ category }));
                  // Update URL with category parameter
                  const params = new URLSearchParams(searchParams);
                  if (category) {
                    params.set('category', category);
                  } else {
                    params.delete('category');
                  }
                  router.push(`/vendors?${params.toString()}`, { scroll: false });
                }}
                className={`group relative flex flex-col items-center p-4 rounded-lg transition-all duration-300 ${
                  filters.category === category 
                    ? 'bg-[#212D47] text-white shadow-lg scale-105' 
                    : 'bg-gray-50 hover:bg-gray-100 hover:scale-105'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                  filters.category === category 
                    ? 'bg-white/20' 
                    : 'bg-white group-hover:bg-[#212D47]/10'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    filters.category === category ? 'text-white' : 'text-[#212D47]'
                  }`} />
                </div>
                <span className={`text-sm font-medium text-center ${
                  filters.category === category 
                    ? 'text-white' 
                    : 'text-gray-700 group-hover:text-gray-900'
                }`}>
                  {category}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Vendor Filters Component
  const VendorFilters: React.FC = () => {
    const filterCategories = {
      category: { title: 'Category', options: filterOptions.categories },
      city: { title: 'City', options: filterOptions.cities },
      serviceArea: { title: 'Service Area', options: filterOptions.serviceAreas },
      priceRange: { title: 'Price Range', options: filterOptions.priceRanges }
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
                        checked={
                          key === 'priceRange'
                            ? (option.includes(`${filterOptions.minPrice} - ₹ ${filterOptions.midPrice}`) && 
                               filters.minPrice === filterOptions.minPrice && 
                               filters.maxPrice === filterOptions.midPrice) ||
                              (option.includes(`${filterOptions.midPrice + 1} - ₹ ${filterOptions.maxPrice}`) && 
                               filters.minPrice === filterOptions.midPrice + 1 && 
                               filters.maxPrice === filterOptions.maxPrice) ||
                              (option.startsWith('>') && filters.minPrice > filterOptions.maxPrice)
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
            )
          ))}
        </div>

        <div className="flex gap-4 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={handleClearFilters}>
            Reset
          </Button>
          <Button className="px-8 bg-[#212D47] hover:bg-[#1A2335] text-white">
            View Results ({filteredVendors.length})
          </Button>
        </div>
      </div>
    );
  };

  // Vendor Search Component
  const VendorSearch: React.FC = () => (
    <div className="bg-card border-b p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                placeholder="Search Wedding Vendors..."
                defaultValue={localSearch}
                onChange={(e) => { searchDraftRef.current = e.target.value; }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applySearch();
                  }
                }}
                onBlur={(e) => {
                  const next = e.relatedTarget as HTMLElement | null;
                  if (!next || !next.closest('.vendor-search-controls')) {
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

          <div className="flex items-center gap-4">
            {activeFilterCount > 0 && (
              <Badge className="bg-[#212D47] text-white">
                {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied
              </Badge>
            )}

            <div className="flex items-center gap-2 vendor-search-controls">
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
            Showing <span className="font-semibold">{filteredVendors.length}</span> results
            {(filters.search || activeFilterCount > 0) && ' matching your criteria'}
          </p>
        </div>
      </div>
    </div>
  );

  // Vendor Card Component
  const VendorCard: React.FC<VendorCardProps> = ({ vendor, onVendorClick }) => (
    <Card
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
      onClick={() => onVendorClick(vendor.id)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={vendor.coverImageUrl || vendor.logoUrl || '/api/placeholder/400/300'}
          alt={vendor.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <Badge variant="secondary" className="bg-black/70 text-white">
            <Camera className="w-3 h-3 mr-1" />
            {vendor.portfolioImages?.length || 1}
          </Badge>
        </div>
        {vendor.status && vendor.status !== 'active' && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-yellow-500/90 text-white">
              {vendor.status.toUpperCase()}
            </Badge>
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-[#212D47]/90 text-white">
            {vendor.category}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-[#212D47] transition-colors">
              {vendor.name}
            </h3>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="line-clamp-1">
                {vendor.city && vendor.city.trim() !== '' ? vendor.city : 'Location not specified'}
                {vendor.state && vendor.state.trim() !== '' && `, ${vendor.state}`}
              </span>
            </div>
            {vendor.yearOfEstablishment && (
              <p className="text-xs text-gray-500 mt-1">
                Est. {vendor.yearOfEstablishment}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-1" />
                <span>{vendor.contactPersonName}</span>
              </div>
            </div>
            {vendor.awards && (
              <div className="flex items-center">
                <Award className="w-4 h-4 text-yellow-500" />
              </div>
            )}
          </div>

          {vendor.serviceAreas && vendor.serviceAreas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {vendor.serviceAreas.slice(0, 3).map((area, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {area}
                </Badge>
              ))}
              {vendor.serviceAreas.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{vendor.serviceAreas.length - 3} more areas
                </Badge>
              )}
            </div>
          )}

          {vendor.servicesOffered && vendor.servicesOffered.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {vendor.servicesOffered.slice(0, 2).map((service, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {service}
                </Badge>
              ))}
              {vendor.servicesOffered.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{vendor.servicesOffered.length - 2} more
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              {vendor.mobileVerified && (
                <div className="flex items-center">
                  <Phone className="w-3 h-3 mr-1 text-green-500" />
                  <span className="text-xs">Verified</span>
                </div>
              )}
              {vendor.websiteOrSocial && (
                <div className="flex items-center">
                  <Globe className="w-3 h-3 mr-1" />
                  <span className="text-xs">Online</span>
                </div>
              )}
            </div>
            {vendor.startingPrice > 0 && (
              <div className="text-right">
                <div className="text-sm text-gray-600">Starting from</div>
                <div className="font-semibold text-[#212D47]">
                  ₹{vendor.startingPrice.toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {vendor.guestCapacityMin && vendor.guestCapacityMax && (
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-1" />
              <span>
                {vendor.guestCapacityMin} - {vendor.guestCapacityMax} guests
              </span>
            </div>
          )}
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
          {error || 'Failed to load vendors. Please try again.'}
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
        <h3 className="text-lg font-semibold mb-2">No vendors found</h3>
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

      {/* Category Selector - Only show if there are categories */}
      {filterOptions.categories.length > 0 && <CategorySelector />}

      {/* City Selector - Only show if there are cities */}
      {filterOptions.cities.length > 0 && <CitySelector />}

      {/* Filters Section - Only show if there are filter options */}
      {(filterOptions.categories.length > 0 || filterOptions.cities.length > 0 || filterOptions.serviceAreas.length > 0) && (
        <section className="bg-gray-50 py-6">
          <div className="max-w-7xl mx-auto px-4">
            <VendorFilters />
          </div>
        </section>
      )}

      {/* Search and Controls */}
      <VendorSearch />

              {/* Results Section */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Wedding Vendors</h2>
            {!loading && !error && (
              <p className="text-gray-600">
                Showing {filteredVendors.length} results
                {(filters.search || activeFilterCount > 0) && ' matching your criteria'}
              </p>
            )}
            {/* Debug info removed to minimize unnecessary re-renders while typing */}
          </div>

        {/* Loading State */}
        {loading && <LoadingSkeleton />}

        {/* Error State */}
        {error && !loading && <ErrorDisplay />}

        {/* No Results State */}
        {!loading && !error && filteredVendors.length === 0 && hasFetched && <NoResults />}

        {/* Vendors Grid */}
        {!loading && !error && filteredVendors.length > 0 && (() => {
          const normal = filteredVendors.filter(v => !v.isPremium);
          const premium = filteredVendors.filter(v => v.isPremium);
          const ordered = [...normal.slice(0, 6), ...premium, ...normal.slice(6)];
          return (
            <div className={`grid gap-6 ${viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
            }`}>
              {ordered.map((vendor) => (
                <div key={vendor.id} className="relative">
                  {vendor.isPremium && (
                    <Badge className="absolute top-2 left-2 z-10 bg-[#212D47] text-white">Premium</Badge>
                  )}
                  <VendorCard vendor={vendor} onVendorClick={handleVendorClick} />
                </div>
              ))}
            </div>
          );
        })()}
      </main>
    </div>
  );
};

export default DynamicVendorPage;