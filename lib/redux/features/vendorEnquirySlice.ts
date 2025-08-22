import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import { getErrorMessage } from "@/lib/utils";

// Define interfaces matching the service
export enum VendorEnquiryStatus {
  NEW = "New",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed"
}

export interface VendorEnquiry {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  status: VendorEnquiryStatus;
  createdAt: string;
  updatedAt: string;
  authId: string; // The authId of the vendor user
}

interface VendorEnquiryState {
  enquiries: VendorEnquiry[];
  loading: boolean;
  error: string | null;
  selectedEnquiry: VendorEnquiry | null;
}

const initialState: VendorEnquiryState = {
  enquiries: [],
  loading: false,
  error: null,
  selectedEnquiry: null,
};

// API URLs
const API_URL = "/api/routes/vendor-enquiry";

// Async Thunks

// Fetch all vendor enquiries (admin only)
export const fetchVendorEnquiries = createAsyncThunk<VendorEnquiry[]>(
  "vendorEnquiry/fetchVendorEnquiries",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Fetch vendor enquiry by ID
export const fetchVendorEnquiryById = createAsyncThunk<VendorEnquiry, string>(
  "vendorEnquiry/fetchVendorEnquiryById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Fetch vendor enquiries by authId (premium vendors only)
export const fetchVendorEnquiriesByAuthId = createAsyncThunk<VendorEnquiry[], string>(
  "vendorEnquiry/fetchVendorEnquiriesByAuthId",
  async (authId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/vendor/${authId}`);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Create a new vendor enquiry
export const createVendorEnquiry = createAsyncThunk<
  VendorEnquiry,
  Omit<VendorEnquiry, "id" | "createdAt" | "updatedAt">
>(
  "vendorEnquiry/createVendorEnquiry",
  async (enquiryData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, enquiryData);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Update a vendor enquiry
export const updateVendorEnquiry = createAsyncThunk<
  VendorEnquiry,
  { 
    id: string; 
    data: Partial<Omit<VendorEnquiry, "id" | "createdAt" | "authId">> 
  }
>(
  "vendorEnquiry/updateVendorEnquiry",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, data);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Delete a vendor enquiry
export const deleteVendorEnquiry = createAsyncThunk<string, string>(
  "vendorEnquiry/deleteVendorEnquiry",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const vendorEnquirySlice = createSlice({
  name: "vendorEnquiry",
  initialState,
  reducers: {
    clearSelectedEnquiry: (state) => {
      state.selectedEnquiry = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setSelectedEnquiry: (state, action: PayloadAction<VendorEnquiry | null>) => {
      state.selectedEnquiry = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Vendor Enquiries
      .addCase(fetchVendorEnquiries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorEnquiries.fulfilled, (state, action: PayloadAction<VendorEnquiry[]>) => {
        state.enquiries = action.payload;
        state.loading = false;
      })
      .addCase(fetchVendorEnquiries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Vendor Enquiry by ID
      .addCase(fetchVendorEnquiryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorEnquiryById.fulfilled, (state, action: PayloadAction<VendorEnquiry>) => {
        state.selectedEnquiry = action.payload;
        state.loading = false;
      })
      .addCase(fetchVendorEnquiryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Vendor Enquiries by AuthId
      .addCase(fetchVendorEnquiriesByAuthId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorEnquiriesByAuthId.fulfilled, (state, action: PayloadAction<VendorEnquiry[]>) => {
        state.enquiries = action.payload;
        state.loading = false;
      })
      .addCase(fetchVendorEnquiriesByAuthId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Vendor Enquiry
      .addCase(createVendorEnquiry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVendorEnquiry.fulfilled, (state, action: PayloadAction<VendorEnquiry>) => {
        state.enquiries.unshift(action.payload);
        state.loading = false;
      })
      .addCase(createVendorEnquiry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Vendor Enquiry
      .addCase(updateVendorEnquiry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVendorEnquiry.fulfilled, (state, action: PayloadAction<VendorEnquiry>) => {
        const index = state.enquiries.findIndex(enquiry => enquiry.id === action.payload.id);
        if (index !== -1) {
          state.enquiries[index] = action.payload;
        }
        // Also update selectedEnquiry if it's the same one
        if (state.selectedEnquiry?.id === action.payload.id) {
          state.selectedEnquiry = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateVendorEnquiry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Vendor Enquiry
      .addCase(deleteVendorEnquiry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVendorEnquiry.fulfilled, (state, action: PayloadAction<string>) => {
        state.enquiries = state.enquiries.filter(enquiry => enquiry.id !== action.payload);
        // Clear selectedEnquiry if it's the deleted one
        if (state.selectedEnquiry?.id === action.payload) {
          state.selectedEnquiry = null;
        }
        state.loading = false;
      })
      .addCase(deleteVendorEnquiry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearSelectedEnquiry, 
  clearError, 
  setSelectedEnquiry 
} = vendorEnquirySlice.actions;

// Selectors
export const selectVendorEnquiries = (state: RootState) => state.vendorEnquiry.enquiries;
export const selectVendorEnquiryLoading = (state: RootState) => state.vendorEnquiry.loading;
export const selectVendorEnquiryError = (state: RootState) => state.vendorEnquiry.error;
export const selectSelectedVendorEnquiry = (state: RootState) => state.vendorEnquiry.selectedEnquiry;

// Derived selectors
export const selectVendorEnquiriesByStatus = (status: VendorEnquiryStatus) => (state: RootState) =>
  state.vendorEnquiry.enquiries.filter(enquiry => enquiry.status === status);

export const selectVendorEnquiryById = (id: string) => (state: RootState) =>
  state.vendorEnquiry.enquiries.find(enquiry => enquiry.id === id);

export default vendorEnquirySlice.reducer;