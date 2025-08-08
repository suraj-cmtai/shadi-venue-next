import { createSlice, createAsyncThunk, PayloadAction, createSelector } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import { getErrorMessage } from "@/lib/utils";

// Define interfaces
interface Hotel {
  id: string;
  name: string;
  category: string; // e.g., 'luxury', 'business', 'resort', etc.
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  priceRange: {
    startingPrice: number;
    currency: 'EUR' | 'CAD' | 'AUD' | 'GBP' | 'USD' | 'INR';
  };
  rating: number;
  status: 'active' | 'draft' | 'archived';
  description: string;
  amenities: string[];
  rooms: {
    type: string;
    capacity: number;
    pricePerNight: number;
    available: number;
  }[];
  images: string[];
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  policies: {
    checkIn: string;
    checkOut: string;
    cancellation: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface HotelState {
  hotels: Hotel[];
  activeHotels: Hotel[];
  loading: boolean;
  hasFetched: boolean;
  error: string | null;
  selectedHotel: Hotel | null;
  filters: {
    category: string;
    city: string;
    priceRange: [number, number];
    rating: number;
  };
  searchQuery: string;
}

const initialState: HotelState = {
  hotels: [],
  activeHotels: [],
  loading: false,
  hasFetched: false,
  error: null,
  selectedHotel: null,
  filters: {
    category: '',
    city: '',
    priceRange: [0, 10000],
    rating: 0,
  },
  searchQuery: '',
};

import { Auth } from './authSlice';

// Listen for auth actions to handle hotel selection
export const listenToAuth = createAsyncThunk(
  'hotel/listenToAuth',
  async (auth: Auth | null, { dispatch }) => {
    if (auth?.role === 'hotel' && auth?.roleId) {
      dispatch(fetchHotelById(auth.roleId));
    }
  }
);

// Fetch all hotels
export const fetchHotels = createAsyncThunk<Hotel[]>(
  "hotel/fetchHotels",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/routes/hotel");
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Fetch hotel by ID
export const fetchHotelById = createAsyncThunk<Hotel, string>(
  "hotel/fetchHotelById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/routes/hotel/${id}`);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Create a new hotel
export const createHotel = createAsyncThunk<Hotel, FormData>(
  "hotel/createHotel",
  async (hotelData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/routes/hotel", hotelData, {
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

// Update a hotel
export const updateHotel = createAsyncThunk<Hotel, { id: string; data: FormData }>(
  "hotel/updateHotel",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/routes/hotel/${id}`, data, {
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

// Delete a hotel
export const deleteHotel = createAsyncThunk<string, string>(
  "hotel/deleteHotel",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/routes/hotel/${id}`);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Fetch all active hotels
export const fetchActiveHotels = createAsyncThunk<Hotel[]>(
  "hotel/fetchActiveHotels",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/routes/hotel/active");
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const hotelSlice = createSlice({
  name: "hotel",
  initialState,
  reducers: {
    clearSelectedHotel: (state) => {
      state.selectedHotel = null;
    },
    setSelectedHotel: (state, action: PayloadAction<Hotel>) => {
      state.selectedHotel = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<HotelState['filters']>>) => {
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
      // Fetch Hotels
      .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action: PayloadAction<Hotel[]>) => {
        state.hotels = action.payload;
        state.loading = false;
        state.hasFetched = true;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.hasFetched = true;
      })

      // Fetch Hotel by ID
      .addCase(fetchHotelById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotelById.fulfilled, (state, action: PayloadAction<Hotel>) => {
        state.selectedHotel = action.payload;
        state.loading = false;
        state.hasFetched = true;
      })
      .addCase(fetchHotelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.hasFetched = true;
      })

      // Create Hotel
      .addCase(createHotel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHotel.fulfilled, (state, action: PayloadAction<Hotel>) => {
        state.hotels.unshift(action.payload);
        state.loading = false;
      })
      .addCase(createHotel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Hotel
      .addCase(updateHotel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHotel.fulfilled, (state, action: PayloadAction<Hotel>) => {
        const index = state.hotels.findIndex(hotel => hotel.id === action.payload.id);
        if (index !== -1) {
          state.hotels[index] = action.payload;
        }
        if (state.selectedHotel?.id === action.payload.id) {
          state.selectedHotel = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateHotel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Hotel
      .addCase(deleteHotel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHotel.fulfilled, (state, action: PayloadAction<string>) => {
        state.hotels = state.hotels.filter(hotel => hotel.id !== action.payload);
        if (state.selectedHotel?.id === action.payload) {
          state.selectedHotel = null;
        }
        state.loading = false;
      })
      .addCase(deleteHotel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch active Hotels
      .addCase(fetchActiveHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveHotels.fulfilled, (state, action: PayloadAction<Hotel[]>) => {
        state.activeHotels = action.payload;
        state.loading = false;
        state.hasFetched = true;
      })
      .addCase(fetchActiveHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.hasFetched = true;
      });
  },
});

export const { 
  clearSelectedHotel, 
  setSelectedHotel, 
  setSearchQuery, 
  setFilters, 
  clearFilters,
  clearError 
} = hotelSlice.actions;

// Selectors
export const selectHotels = (state: RootState) => state.hotel.hotels;
export const selectActiveHotels = (state: RootState) => state.hotel.activeHotels;
export const selectHotelLoading = (state: RootState) => state.hotel.loading;
export const selectHotelError = (state: RootState) => state.hotel.error;
export const selectSelectedHotel = (state: RootState) => state.hotel.selectedHotel;
export const selectSearchQuery = (state: RootState) => state.hotel.searchQuery;
export const selectFilters = (state: RootState) => state.hotel.filters;
export const selectHotelHasFetched = (state: RootState) => state.hotel.hasFetched;

// Advanced selectors with filtering and searching
export const selectFilteredHotels = createSelector(
  [selectHotels, selectSearchQuery, selectFilters],
  (hotels, searchQuery, filters) => {
    return hotels.filter(hotel => {
      // Text search
      const matchesSearch = !searchQuery || 
        hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotel.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotel.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotel.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = !filters.category || hotel.category === filters.category;
      
      // City filter
      const matchesCity = !filters.city || hotel.location.city === filters.city;
      
      // Price range filter
      const matchesPrice = hotel.priceRange.startingPrice >= filters.priceRange[0] && 
                          hotel.priceRange.startingPrice <= filters.priceRange[1];
      
      // Rating filter
      const matchesRating = !filters.rating || hotel.rating >= filters.rating;
      
      return matchesSearch && matchesCategory && matchesCity && matchesPrice && matchesRating;
    });
  }
);

export const selectHotelsByCategory = createSelector(
  [selectHotels],
  (hotels) => {
    return hotels.reduce((acc, hotel) => {
      if (!acc[hotel.category]) {
        acc[hotel.category] = [];
      }
      acc[hotel.category].push(hotel);
      return acc;
    }, {} as Record<string, Hotel[]>);
  }
);

export const selectHotelsByCity = createSelector(
  [selectHotels],
  (hotels) => {
    return hotels.reduce((acc, hotel) => {
      const city = hotel.location.city;
      if (!acc[city]) {
        acc[city] = [];
      }
      acc[city].push(hotel);
      return acc;
    }, {} as Record<string, Hotel[]>);
  }
);

export default hotelSlice.reducer;
