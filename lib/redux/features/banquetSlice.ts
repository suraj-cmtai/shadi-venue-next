import { createSlice, createAsyncThunk, PayloadAction, createSelector } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import { getErrorMessage } from "@/lib/utils";

// Define interfaces
export interface Banquet {
  // Basic Details
  id: string;
  category: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  priceRange: {
    startingPrice: number;
    currency: string;
  };
  rating: number;
  status: "draft" | "active" | "archived";
  description: string;
  amenities: string[];

  // Venue Details
  venueName: string;
  capacity: number;
  area: string;
  venueType: "Indoor" | "Outdoor" | "Both";
  facilities: string[];

  // Pricing & Packages
  pricingRange: string;
  packages?: string;
  rentalOptions: string;

  // Photos & Media
  images: string[];
  contactInfo: {
    phone: string;
    email: string;
    website: string;
  };
  policies: {
    checkIn: string;
    checkOut: string;
    cancellation: string;
  };
  googleLocation: string;
  createdAt: string;
  updatedAt: string;
  isPremium: boolean;
  isFeatured?: boolean;
  firstName: string;
  lastName: string;
  companyName: string;
  position: string;
  websiteLink: string;

  // Wedding Package Information
  offerWeddingPackages: string;
  resortCategory: string;
  maxGuestCapacity: string;
  totalRooms: string;
  venueAvailability: string;

  // Arrays for multi-select fields
  servicesOffered: string[];
  diningOptions: string[];
  otherAmenities: string[];
  preferredContactMethod: string[];

  // Strings/arrays for boolean-like fields
  allInclusivePackages: string[];
  staffAccommodation: string;

  // Business and Booking Information
  bookingLeadTime: string;
  weddingDepositRequired: string;
  refundPolicy: string;
  referralSource: string;
  partnershipInterest: string;

  // File uploads
  uploadResortPhotos: string[];
  uploadMarriagePhotos: string[];
  uploadWeddingBrochure: string[];
  uploadCancelledCheque: string[];

  // Agreement fields
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
  signature: string;
}

// Utility: Featured first sorting
const sortFeaturedFirst = (items: Banquet[]) =>
  [...items].sort((a, b) => ((b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)));

interface BanquetState {
  banquets: Banquet[];
  activeBanquets: Banquet[];
  premiumBanquets: Banquet[];
  loading: boolean;
  hasFetched: boolean;
  error: string | null;
  selectedBanquet: Banquet | null;
  filters: {
    city: string;
    venueType: string;
    minCapacity: number;
    maxCapacity: number;
  };
  searchQuery: string;
}

const initialState: BanquetState = {
  banquets: [],
  activeBanquets: [],
  premiumBanquets: [],
  loading: false,
  hasFetched: false,
  error: null,
  selectedBanquet: null,
  filters: {
    city: '',
    venueType: '',
    minCapacity: 0,
    maxCapacity: 10000,
  },
  searchQuery: '',
};

import { Auth } from './authSlice';

// Listen for auth actions to handle banquet selection
export const listenToAuth = createAsyncThunk(
  'banquet/listenToAuth',
  async (auth: Auth | null, { dispatch }) => {
    if (auth?.role === 'hotel' && auth?.roleId) {
      dispatch(fetchBanquetById(auth.roleId));
    }
  }
);

// Fetch all banquets
export const fetchBanquets = createAsyncThunk<Banquet[]>(
  "banquet/fetchBanquets",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/routes/banquet");
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Fetch all premium banquets (GET_PREMIUM)
export const fetchPremiumBanquets = createAsyncThunk<Banquet[]>(
  "banquet/fetchPremiumBanquets",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/routes/banquet/premium");
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Fetch banquet by ID
export const fetchBanquetById = createAsyncThunk<Banquet, string>(
  "banquet/fetchBanquetById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/routes/banquet/${id}`);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Create a new banquet
export const createBanquet = createAsyncThunk<Banquet, FormData>(
  "banquet/createBanquet",
  async (banquetData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/routes/banquet", banquetData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Update a banquet
export const updateBanquet = createAsyncThunk<Banquet, { id: string; data: FormData }>(
  "banquet/updateBanquet",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/routes/banquet/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Delete a banquet
export const deleteBanquet = createAsyncThunk<string, string>(
  "banquet/deleteBanquet",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/routes/banquet/${id}`);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Fetch all active banquets
export const fetchActiveBanquets = createAsyncThunk<Banquet[]>(
  "banquet/fetchActiveBanquets",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/routes/banquet/active");
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const banquetSlice = createSlice({
  name: "banquet",
  initialState,
  reducers: {
    clearSelectedBanquet: (state) => {
      state.selectedBanquet = null;
    },
    setSelectedBanquet: (state, action: PayloadAction<Banquet>) => {
      state.selectedBanquet = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<BanquetState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.searchQuery = '';
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Banquets
      .addCase(fetchBanquets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanquets.fulfilled, (state, action: PayloadAction<Banquet[]>) => {
        state.banquets = sortFeaturedFirst(action.payload);
        state.loading = false;
        state.hasFetched = true;
      })
      .addCase(fetchBanquets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.hasFetched = true;
      })

      // Fetch Premium Banquets
      .addCase(fetchPremiumBanquets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPremiumBanquets.fulfilled, (state, action: PayloadAction<Banquet[]>) => {
        state.premiumBanquets = sortFeaturedFirst(action.payload);
        state.loading = false;
      })
      .addCase(fetchPremiumBanquets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Banquet by ID
      .addCase(fetchBanquetById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanquetById.fulfilled, (state, action: PayloadAction<Banquet>) => {
        state.selectedBanquet = action.payload;
        state.loading = false;
        state.hasFetched = true;
      })
      .addCase(fetchBanquetById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.hasFetched = true;
      })

      // Create Banquet
      .addCase(createBanquet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBanquet.fulfilled, (state, action: PayloadAction<Banquet>) => {
        state.banquets.unshift(action.payload);
        state.banquets = sortFeaturedFirst(state.banquets);
        state.loading = false;
      })
      .addCase(createBanquet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Banquet
      .addCase(updateBanquet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBanquet.fulfilled, (state, action: PayloadAction<Banquet>) => {
        const index = state.banquets.findIndex(banquet => banquet.id === action.payload.id);
        if (index !== -1) {
          state.banquets[index] = action.payload;
        }
        if (state.selectedBanquet?.id === action.payload.id) {
          state.selectedBanquet = action.payload;
        }
        state.banquets = sortFeaturedFirst(state.banquets);
        state.loading = false;
      })
      .addCase(updateBanquet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Banquet
      .addCase(deleteBanquet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBanquet.fulfilled, (state, action: PayloadAction<string>) => {
        state.banquets = state.banquets.filter(banquet => banquet.id !== action.payload);
        if (state.selectedBanquet?.id === action.payload) {
          state.selectedBanquet = null;
        }
        state.loading = false;
      })
      .addCase(deleteBanquet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch active Banquets
      .addCase(fetchActiveBanquets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveBanquets.fulfilled, (state, action: PayloadAction<Banquet[]>) => {
        state.activeBanquets = sortFeaturedFirst(action.payload);
        state.loading = false;
        state.hasFetched = true;
      })
      .addCase(fetchActiveBanquets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.hasFetched = true;
      });
  },
});

export const { 
  clearSelectedBanquet, 
  setSelectedBanquet, 
  setSearchQuery, 
  setFilters, 
  clearFilters,
  clearError 
} = banquetSlice.actions;

// Selectors
const selectBanquetSlice = (state: any) => state.banquet ?? state.hotel ?? {};

export const selectBanquets = (state: RootState) =>
  (selectBanquetSlice(state).banquets ?? selectBanquetSlice(state).hotels ?? []) as Banquet[];

export const selectActiveBanquets = (state: RootState) =>
  (selectBanquetSlice(state).activeBanquets ?? selectBanquetSlice(state).activeHotels ?? []) as Banquet[];

export const selectPremiumBanquets = (state: RootState) =>
  (selectBanquetSlice(state).premiumBanquets ?? selectBanquetSlice(state).premiumHotels ?? []) as Banquet[];

export const selectBanquetLoading = (state: RootState) =>
  Boolean(selectBanquetSlice(state).loading);

export const selectBanquetError = (state: RootState) =>
  (selectBanquetSlice(state).error ?? null) as string | null;

export const selectSelectedBanquet = (state: RootState) =>
  (selectBanquetSlice(state).selectedBanquet ?? selectBanquetSlice(state).selectedHotel ?? null) as Banquet | null;

export const selectSearchQuery = (state: RootState) =>
  (selectBanquetSlice(state).searchQuery ?? '') as string;

export const selectFilters = (state: RootState) =>
  (selectBanquetSlice(state).filters ?? {
    city: '',
    venueType: '',
    minCapacity: 0,
    maxCapacity: 10000,
  }) as BanquetState['filters'];

export const selectBanquetHasFetched = (state: RootState) =>
  Boolean(selectBanquetSlice(state).hasFetched);

// Advanced selectors with filtering and searching
export const selectFilteredBanquets = createSelector(
  [selectBanquets, selectSearchQuery, selectFilters],
  (banquets: Banquet[], searchQuery: string, filters: any) => {
    return banquets.filter((banquet: Banquet) => {
      // Text search
      const matchesSearch = !searchQuery || 
        banquet.venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        banquet.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        banquet.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${banquet.firstName} ${banquet.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        banquet.location.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      // City filter
      const matchesCity = !filters.city || banquet.location.city === filters.city;
      
      // Venue type filter
      const matchesVenueType = !filters.venueType || banquet.venueType === filters.venueType;
      
      // Capacity filter
      const matchesCapacity = banquet.capacity >= filters.minCapacity && 
                             banquet.capacity <= filters.maxCapacity;
      
      return matchesSearch && matchesCity && matchesVenueType && matchesCapacity;
    });
  }
);

export const selectBanquetsByVenueType = createSelector(
  [selectBanquets],
  (banquets: Banquet[]) => {
    return banquets.reduce((acc: Record<string, Banquet[]>, banquet: Banquet) => {
      const key = banquet.venueType;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(banquet);
      return acc;
    }, {} as Record<string, Banquet[]>);
  }
);

export const selectBanquetsByCity = createSelector(
  [selectBanquets],
  (banquets: Banquet[]) => {
    return banquets.reduce((acc: Record<string, Banquet[]>, banquet: Banquet) => {
      const city = banquet.location.city;
      if (!acc[city]) {
        acc[city] = [];
      }
      acc[city].push(banquet);
      return acc;
    }, {} as Record<string, Banquet[]>);
  }
);

export default banquetSlice.reducer;
