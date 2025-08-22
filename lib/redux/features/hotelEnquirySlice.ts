import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import { getErrorMessage } from "@/lib/utils";

// Define interfaces matching the backend service (see @file_context_0)
export interface HotelEnquiry {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  status: "Pending" | "Contacted" | "Closed";
  createdAt: string;
  updatedAt: string;
  authId: string; // The authId of the hotel user
}

interface HotelEnquiryState {
  enquiries: HotelEnquiry[];
  loading: boolean;
  error: string | null;
  selectedEnquiry: HotelEnquiry | null;
}

const initialState: HotelEnquiryState = {
  enquiries: [],
  loading: false,
  error: null,
  selectedEnquiry: null,
};

// API URLs
const API_URL = "/api/routes/hotel-enquiry";

// Async Thunks

// Fetch all hotel enquiries (admin only)
export const fetchHotelEnquiries = createAsyncThunk<HotelEnquiry[]>(
  "hotelEnquiry/fetchHotelEnquiries",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Fetch hotel enquiry by ID
export const fetchHotelEnquiryById = createAsyncThunk<HotelEnquiry, string>(
  "hotelEnquiry/fetchHotelEnquiryById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Fetch hotel enquiries by authId (premium hotels only)
export const fetchHotelEnquiriesByAuthId = createAsyncThunk<HotelEnquiry[], string>(
  "hotelEnquiry/fetchHotelEnquiriesByAuthId",
  async (authId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/hotel/${authId}`);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Create a new hotel enquiry
export const createHotelEnquiry = createAsyncThunk<
  HotelEnquiry,
  Omit<HotelEnquiry, "id" | "createdAt" | "updatedAt">
>(
  "hotelEnquiry/createHotelEnquiry",
  async (enquiryData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, enquiryData);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Update a hotel enquiry
export const updateHotelEnquiry = createAsyncThunk<
  HotelEnquiry,
  { 
    id: string; 
    data: Partial<Omit<HotelEnquiry, "id" | "createdAt" | "authId">> 
  }
>(
  "hotelEnquiry/updateHotelEnquiry",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, data);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Delete a hotel enquiry
export const deleteHotelEnquiry = createAsyncThunk<string, string>(
  "hotelEnquiry/deleteHotelEnquiry",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const hotelEnquirySlice = createSlice({
  name: "hotelEnquiry",
  initialState,
  reducers: {
    clearSelectedEnquiry: (state) => {
      state.selectedEnquiry = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setSelectedEnquiry: (state, action: PayloadAction<HotelEnquiry | null>) => {
      state.selectedEnquiry = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Hotel Enquiries
      .addCase(fetchHotelEnquiries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotelEnquiries.fulfilled, (state, action: PayloadAction<HotelEnquiry[]>) => {
        state.enquiries = action.payload;
        state.loading = false;
      })
      .addCase(fetchHotelEnquiries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Hotel Enquiry by ID
      .addCase(fetchHotelEnquiryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotelEnquiryById.fulfilled, (state, action: PayloadAction<HotelEnquiry>) => {
        state.selectedEnquiry = action.payload;
        state.loading = false;
      })
      .addCase(fetchHotelEnquiryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Hotel Enquiries by AuthId
      .addCase(fetchHotelEnquiriesByAuthId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotelEnquiriesByAuthId.fulfilled, (state, action: PayloadAction<HotelEnquiry[]>) => {
        state.enquiries = action.payload;
        state.loading = false;
      })
      .addCase(fetchHotelEnquiriesByAuthId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Hotel Enquiry
      .addCase(createHotelEnquiry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHotelEnquiry.fulfilled, (state, action: PayloadAction<HotelEnquiry>) => {
        state.enquiries.unshift(action.payload);
        state.loading = false;
      })
      .addCase(createHotelEnquiry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Hotel Enquiry
      .addCase(updateHotelEnquiry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHotelEnquiry.fulfilled, (state, action: PayloadAction<HotelEnquiry>) => {
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
      .addCase(updateHotelEnquiry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Hotel Enquiry
      .addCase(deleteHotelEnquiry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHotelEnquiry.fulfilled, (state, action: PayloadAction<string>) => {
        state.enquiries = state.enquiries.filter(enquiry => enquiry.id !== action.payload);
        // Clear selectedEnquiry if it's the deleted one
        if (state.selectedEnquiry?.id === action.payload) {
          state.selectedEnquiry = null;
        }
        state.loading = false;
      })
      .addCase(deleteHotelEnquiry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearSelectedEnquiry, 
  clearError, 
  setSelectedEnquiry 
} = hotelEnquirySlice.actions;

// Selectors
export const selectHotelEnquiries = (state: RootState) => state.hotelEnquiry.enquiries;
export const selectHotelEnquiryLoading = (state: RootState) => state.hotelEnquiry.loading;
export const selectHotelEnquiryError = (state: RootState) => state.hotelEnquiry.error;
export const selectSelectedHotelEnquiry = (state: RootState) => state.hotelEnquiry.selectedEnquiry;

// Derived selectors
export const selectHotelEnquiriesByStatus = (status: "Pending" | "Contacted" | "Closed") => (state: RootState) =>
  state.hotelEnquiry.enquiries.filter(enquiry => enquiry.status === status);

export const selectHotelEnquiryById = (id: string) => (state: RootState) =>
  state.hotelEnquiry.enquiries.find(enquiry => enquiry.id === id);

export default hotelEnquirySlice.reducer;