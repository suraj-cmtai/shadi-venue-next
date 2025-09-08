import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import { getErrorMessage } from "@/lib/utils";

// Define interfaces matching the service
export enum BanquetEnquiryStatus {
  NEW = "New",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed"
}

export interface BanquetEnquiry {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  status: BanquetEnquiryStatus;
  createdAt: string;
  updatedAt: string;
  authId: string; // The authId of the banquet user
  message: string;
}

interface BanquetEnquiryState {
  enquiries: BanquetEnquiry[];
  loading: boolean;
  error: string | null;
  selectedEnquiry: BanquetEnquiry | null;
}

const initialState: BanquetEnquiryState = {
  enquiries: [],
  loading: false,
  error: null,
  selectedEnquiry: null,
};

// API URLs
const API_URL = "/api/routes/banquet-enquiry";

// Async Thunks

// Fetch all banquet enquiries (admin only)
export const fetchBanquetEnquiries = createAsyncThunk<BanquetEnquiry[]>(
  "banquetEnquiry/fetchBanquetEnquiries",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Fetch banquet enquiry by ID
export const fetchBanquetEnquiryById = createAsyncThunk<BanquetEnquiry, string>(
  "banquetEnquiry/fetchBanquetEnquiryById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Fetch banquet enquiries by authId (premium banquets only)
export const fetchBanquetEnquiriesByAuthId = createAsyncThunk<BanquetEnquiry[], string>(
  "banquetEnquiry/fetchBanquetEnquiriesByAuthId",
  async (authId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/banquet/${authId}`);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Create a new banquet enquiry
export const createBanquetEnquiry = createAsyncThunk<
  BanquetEnquiry,
  Omit<BanquetEnquiry, "id" | "createdAt" | "updatedAt">
>(
  "banquetEnquiry/createBanquetEnquiry",
  async (enquiryData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, enquiryData);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Update a banquet enquiry
export const updateBanquetEnquiry = createAsyncThunk<
  BanquetEnquiry,
  { 
    id: string; 
    data: Partial<Omit<BanquetEnquiry, "id" | "createdAt" | "authId" | "message">> 
  }
>(
  "banquetEnquiry/updateBanquetEnquiry",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, data);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Delete a banquet enquiry
export const deleteBanquetEnquiry = createAsyncThunk<string, string>(
  "banquetEnquiry/deleteBanquetEnquiry",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const banquetEnquirySlice = createSlice({
  name: "banquetEnquiry",
  initialState,
  reducers: {
    clearSelectedEnquiry: (state) => {
      state.selectedEnquiry = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setSelectedEnquiry: (state, action: PayloadAction<BanquetEnquiry | null>) => {
      state.selectedEnquiry = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Banquet Enquiries
      .addCase(fetchBanquetEnquiries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanquetEnquiries.fulfilled, (state, action: PayloadAction<BanquetEnquiry[]>) => {
        state.enquiries = action.payload;
        state.loading = false;
      })
      .addCase(fetchBanquetEnquiries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Banquet Enquiry by ID
      .addCase(fetchBanquetEnquiryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanquetEnquiryById.fulfilled, (state, action: PayloadAction<BanquetEnquiry>) => {
        state.selectedEnquiry = action.payload;
        state.loading = false;
      })
      .addCase(fetchBanquetEnquiryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Banquet Enquiries by AuthId
      .addCase(fetchBanquetEnquiriesByAuthId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanquetEnquiriesByAuthId.fulfilled, (state, action: PayloadAction<BanquetEnquiry[]>) => {
        state.enquiries = action.payload;
        state.loading = false;
      })
      .addCase(fetchBanquetEnquiriesByAuthId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Banquet Enquiry
      .addCase(createBanquetEnquiry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBanquetEnquiry.fulfilled, (state, action: PayloadAction<BanquetEnquiry>) => {
        state.enquiries.unshift(action.payload);
        state.loading = false;
      })
      .addCase(createBanquetEnquiry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Banquet Enquiry
      .addCase(updateBanquetEnquiry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBanquetEnquiry.fulfilled, (state, action: PayloadAction<BanquetEnquiry>) => {
        const index = state.enquiries.findIndex((enquiry: BanquetEnquiry) => enquiry.id === action.payload.id);
        if (index !== -1) {
          state.enquiries[index] = action.payload;
        }
        // Also update selectedEnquiry if it's the same one
        if (state.selectedEnquiry?.id === action.payload.id) {
          state.selectedEnquiry = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateBanquetEnquiry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Banquet Enquiry
      .addCase(deleteBanquetEnquiry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBanquetEnquiry.fulfilled, (state, action: PayloadAction<string>) => {
        state.enquiries = state.enquiries.filter((enquiry: BanquetEnquiry) => enquiry.id !== action.payload);
        // Clear selectedEnquiry if it's the deleted one
        if (state.selectedEnquiry?.id === action.payload) {
          state.selectedEnquiry = null;
        }
        state.loading = false;
      })
      .addCase(deleteBanquetEnquiry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearSelectedEnquiry, 
  clearError, 
  setSelectedEnquiry 
} = banquetEnquirySlice.actions;

// Selectors
export const selectBanquetEnquiries = (state: RootState) => state.banquetEnquiry.enquiries;
export const selectBanquetEnquiryLoading = (state: RootState) => state.banquetEnquiry.loading;
export const selectBanquetEnquiryError = (state: RootState) => state.banquetEnquiry.error;
export const selectSelectedBanquetEnquiry = (state: RootState) => state.banquetEnquiry.selectedEnquiry;

// Derived selectors
export const selectBanquetEnquiriesByStatus = (status: BanquetEnquiryStatus) => (state: RootState) =>
  state.banquetEnquiry.enquiries.filter((enquiry: BanquetEnquiry) => enquiry.status === status);

export const selectBanquetEnquiryById = (id: string) => (state: RootState) =>
  state.banquetEnquiry.enquiries.find((enquiry: BanquetEnquiry) => enquiry.id === id);

export default banquetEnquirySlice.reducer;