import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import { getErrorMessage } from "@/lib/utils";

export type VendorType = 'flower' | 'catering' | 'decoration' | 'photography' | 'music' | 'other';

interface Vendor {
  id: string;
  name: string;
  type: VendorType;
  description: string;
  services: string[];
  pricing: {
    basePrice: number;
    currency: 'EUR' | 'CAD' | 'AUD' | 'GBP' | 'USD' | 'INR';
  };
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  portfolio: {
    images: string[];
    videos?: string[];
  };
  rating: number;
  reviews: {
    userId: string;
    rating: number;
    comment: string;
    date: string;
  }[];
  availability: {
    days: string[];
    hours: string;
  };
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface VendorState {
  vendors: Vendor[];
  activeVendors: Vendor[];
  loading: boolean;
  error: string | null;
  selectedVendor: Vendor | null;
  filters: {
    type: VendorType | '';
    city: string;
    priceRange: [number, number];
    rating: number;
  };
  searchQuery: string;
}

const initialState: VendorState = {
  vendors: [],
  activeVendors: [],
  loading: false,
  error: null,
  selectedVendor: null,
  filters: {
    type: '',
    city: '',
    priceRange: [0, 10000],
    rating: 0,
  },
  searchQuery: '',
};

// Async thunks
export const fetchVendors = createAsyncThunk<Vendor[]>(
  "vendor/fetchVendors",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/routes/vendor");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchVendorById = createAsyncThunk<Vendor, string>(
  "vendor/fetchVendorById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/routes/vendor/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createVendor = createAsyncThunk<Vendor, FormData>(
  "vendor/createVendor",
  async (vendorData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/routes/vendor", vendorData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateVendor = createAsyncThunk<Vendor, { id: string; data: FormData }>(
  "vendor/updateVendor",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/routes/vendor/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteVendor = createAsyncThunk<string, string>(
  "vendor/deleteVendor",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/routes/vendor/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const vendorSlice = createSlice({
  name: "vendor",
  initialState,
  reducers: {
    clearSelectedVendor: (state) => {
      state.selectedVendor = null;
    },
    setSelectedVendor: (state, action: PayloadAction<Vendor>) => {
      state.selectedVendor = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<VendorState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.searchQuery = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.vendors = action.payload;
        state.loading = false;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchVendorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorById.fulfilled, (state, action) => {
        state.selectedVendor = action.payload;
        state.loading = false;
      })
      .addCase(fetchVendorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVendor.fulfilled, (state, action) => {
        state.vendors.unshift(action.payload);
        state.loading = false;
      })
      .addCase(createVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVendor.fulfilled, (state, action) => {
        const index = state.vendors.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.vendors[index] = action.payload;
        }
        if (state.selectedVendor?.id === action.payload.id) {
          state.selectedVendor = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.vendors = state.vendors.filter(v => v.id !== action.payload);
        if (state.selectedVendor?.id === action.payload) {
          state.selectedVendor = null;
        }
        state.loading = false;
      })
      .addCase(deleteVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearSelectedVendor,
  setSelectedVendor,
  setSearchQuery,
  setFilters,
  clearFilters,
} = vendorSlice.actions;

// Selectors
export const selectVendors = (state: RootState) => state.vendor.vendors;
export const selectVendorLoading = (state: RootState) => state.vendor.loading;
export const selectVendorError = (state: RootState) => state.vendor.error;
export const selectSelectedVendor = (state: RootState) => state.vendor.selectedVendor;

export default vendorSlice.reducer;
