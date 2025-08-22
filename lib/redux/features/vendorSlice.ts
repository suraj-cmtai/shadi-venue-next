import { createSlice, createAsyncThunk, PayloadAction, createSelector } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import { getErrorMessage } from "@/lib/utils";

// Vendor Category options as per new requirements
export type VendorCategory =
  | "Venue"
  | "Planner"
  | "Photographer"
  | "Decorator"
  | "Caterer"
  | "Makeup"
  | "Entertainment"
  | "Others";

// Service Areas options
export type ServiceArea =
  | "Local City"
  | "Statewide"
  | "Pan India"
  | "International";

// Payment Modes
export type PaymentMode =
  | "UPI"
  | "Cash"
  | "Bank Transfer"
  | "Card"
  | "Other";

// Facilities for venues
export type Facility =
  | "Rooms"
  | "Parking"
  | "Catering"
  | "Decor"
  | "DJ"
  | "Liquor License"
  | "Pool"
  | "Other";

// Vendor interface as per new registration form
export interface Vendor {
  id: string;

  // Step 1: Basic Business Info
  businessName: string;
  category: VendorCategory;
  yearOfEstablishment?: string;

  // Step 2: Contact Details
  contactPersonName: string;
  designation: "Owner" | "Manager" | "Other";
  mobileNumber: string;
  mobileVerified?: boolean;
  whatsappNumber?: string;
  email: string;
  websiteOrSocial?: string;

  // Step 3: Location & Coverage
  address: string;
  city: string;
  state: string;
  pinCode: string;
  serviceAreas: ServiceArea[];

  // Step 4: Services / Venue Details
  servicesOffered: string[];
  startingPrice: number;
  guestCapacityMin?: number;
  guestCapacityMax?: number;
  facilitiesAvailable?: Facility[];
  specialities?: string;

  // Step 5: Portfolio Upload
  logoUrl: string;
  coverImageUrl: string;
  portfolioImages: string[]; // up to 10–15
  videoLinks?: string[]; // YouTube/Vimeo

  // Step 6: Business Highlights
  about: string;
  awards?: string;
  notableClients?: string;

  // Step 7: Payment & Booking Terms
  advancePaymentPercent?: number;
  refundPolicy?: string;
  paymentModesAccepted: PaymentMode[];

  // Step 8: Account Setup
  username: string;
  passwordHash?: string; // never expose plain password
  agreedToTerms: boolean;

  // System fields
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;

  // Premium field
  isPremium: boolean;
}

interface VendorState {
  vendors: Vendor[];
  activeVendors: Vendor[];
  premiumVendors: Vendor[];
  loading: boolean;
  hasFetched: boolean;
  error: string | null;
  selectedVendor: Vendor | null;
  filters: {
    category: VendorCategory | "";
    city: string;
    serviceArea: ServiceArea | "";
    minPrice: number;
    maxPrice: number;
    search: string;
  };
}

const initialState: VendorState = {
  vendors: [],
  activeVendors: [],
  premiumVendors: [],
  loading: false,
  hasFetched: false,
  error: null,
  selectedVendor: null,
  filters: {
    category: "",
    city: "",
    serviceArea: "",
    minPrice: 0,
    maxPrice: 1000000,
    search: "",
  },
};

// Listen for auth actions to handle vendor selection (if needed, similar to hotelSlice)
export const listenToAuth = createAsyncThunk(
  'vendor/listenToAuth',
  async (auth: any, { dispatch }) => {
    if (auth?.role === 'vendor' && auth?.roleId) {
      dispatch(fetchVendorById(auth.roleId));
    }
  }
);

// Fetch all vendors
export const fetchVendors = createAsyncThunk<Vendor[]>(
  "vendor/fetchVendors",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/routes/vendor");
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Fetch active vendors
export const fetchActiveVendors = createAsyncThunk<Vendor[]>(
  "vendor/fetchActiveVendors",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/routes/vendor/active");
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Fetch premium vendors
export const fetchPremiumVendor = createAsyncThunk<Vendor[]>(
  "vendor/fetchPremiumVendor",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/routes/vendor/premium");
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Fetch vendor by ID
export const fetchVendorById = createAsyncThunk<Vendor, string>(
  "vendor/fetchVendorById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/routes/vendor/${id}`);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Create a new vendor
export const createVendor = createAsyncThunk<Vendor, FormData>(
  "vendor/createVendor",
  async (vendorData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/routes/vendor", vendorData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Update a vendor
export const updateVendor = createAsyncThunk<Vendor, { id: string; data: FormData }>(
  "vendor/updateVendor",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/routes/vendor/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Delete a vendor
export const deleteVendor = createAsyncThunk<string, string>(
  "vendor/deleteVendor",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/routes/vendor/${id}`);
      return id;
    } catch (error: unknown) {
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
    setFilters: (state, action: PayloadAction<Partial<VendorState["filters"]>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Vendors
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action: PayloadAction<Vendor[]>) => {
        state.vendors = action.payload;
        state.loading = false;
        state.hasFetched = true;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.hasFetched = true;
      })

      // Fetch Active Vendors
      .addCase(fetchActiveVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveVendors.fulfilled, (state, action: PayloadAction<Vendor[]>) => {
        state.activeVendors = action.payload;
        state.loading = false;
        state.hasFetched = true;
      })
      .addCase(fetchActiveVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.hasFetched = true;
      })

      // Fetch Premium Vendors
      .addCase(fetchPremiumVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPremiumVendor.fulfilled, (state, action: PayloadAction<Vendor[]>) => {
        state.premiumVendors = action.payload;
        state.loading = false;
        state.hasFetched = true;
      })
      .addCase(fetchPremiumVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.hasFetched = true;
      })  

      // Fetch Vendor by ID
      .addCase(fetchVendorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorById.fulfilled, (state, action: PayloadAction<Vendor>) => {
        state.selectedVendor = action.payload;
        state.loading = false;
        state.hasFetched = true;
      })
      .addCase(fetchVendorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.hasFetched = true;
      })

      // Create Vendor
      .addCase(createVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVendor.fulfilled, (state, action: PayloadAction<Vendor>) => {
        state.vendors.unshift(action.payload);
        state.loading = false;
      })
      .addCase(createVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Vendor
      .addCase(updateVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVendor.fulfilled, (state, action: PayloadAction<Vendor>) => {
        const index = state.vendors.findIndex((v) => v.id === action.payload.id);
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

      // Delete Vendor
      .addCase(deleteVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVendor.fulfilled, (state, action: PayloadAction<string>) => {
        state.vendors = state.vendors.filter((v) => v.id !== action.payload);
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
  setFilters,
  clearFilters,
  clearError,
} = vendorSlice.actions;

// Selectors
export const selectVendors = (state: RootState) => state.vendor.vendors;
export const selectActiveVendors = (state: RootState) => state.vendor.activeVendors;
export const selectPremiumVendor = (state: RootState) => state.vendor.premiumVendors;
export const selectVendorLoading = (state: RootState) => state.vendor.loading;
export const selectVendorError = (state: RootState) => state.vendor.error;
export const selectSelectedVendor = (state: RootState) => state.vendor.selectedVendor;
export const selectVendorHasFetched = (state: RootState) => state.vendor.hasFetched;
export const selectVendorFilters = (state: RootState) => state.vendor.filters;

// Advanced selectors with filtering and searching
export const selectFilteredVendors = createSelector(
  [selectActiveVendors, selectVendorFilters],
  (activeVendors, filters) => {
    return activeVendors.filter(vendor => {
      // Text search
      const matchesSearch = !filters.search ||
        vendor.businessName.toLowerCase().includes(filters.search.toLowerCase()) ||
        vendor.about?.toLowerCase().includes(filters.search.toLowerCase()) ||
        vendor.city.toLowerCase().includes(filters.search.toLowerCase()) ||
        vendor.category.toLowerCase().includes(filters.search.toLowerCase());

      // Category filter
      const matchesCategory = !filters.category || vendor.category === filters.category;

      // City filter
      const matchesCity = !filters.city || vendor.city === filters.city;

      // Service area filter
      const matchesServiceArea = !filters.serviceArea || vendor.serviceAreas.includes(filters.serviceArea);

      // Price range filter
      const matchesPrice = vendor.startingPrice >= filters.minPrice &&
        vendor.startingPrice <= filters.maxPrice;

      return matchesSearch && matchesCategory && matchesCity && matchesServiceArea && matchesPrice;
    });
  }
);

export const selectVendorsByCategory = createSelector(
  [selectVendors],
  (vendors) => {
    return vendors.reduce((acc, vendor) => {
      if (!acc[vendor.category]) {
        acc[vendor.category] = [];
      }
      acc[vendor.category].push(vendor);
      return acc;
    }, {} as Record<string, Vendor[]>);
  }
);

export const selectVendorsByCity = createSelector(
  [selectVendors],
  (vendors) => {
    return vendors.reduce((acc, vendor) => {
      const city = vendor.city;
      if (!acc[city]) {
        acc[city] = [];
      }
      acc[city].push(vendor);
      return acc;
    }, {} as Record<string, Vendor[]>);
  }
);

export default vendorSlice.reducer;
