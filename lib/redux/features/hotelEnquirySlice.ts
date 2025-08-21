import { createSlice, Dispatch, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import { getErrorMessage } from "@/lib/utils";

// --- TypeScript Interface ---
export interface HotelEnquiry {
  id: string;
  hotelName: string;
  city: string;
  name?: string;
  phone?: string;
  email?: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  message?: string;
  status: "Pending" | "Contacted" | "Closed";
  createdAt: string;
  updatedAt: string;
}

interface HotelEnquiryState {
  enquiries: HotelEnquiry[];
  isLoading: boolean;
  error: string | null;
  selectedEnquiry: HotelEnquiry | null;
}

const initialState: HotelEnquiryState = {
  enquiries: [],
  isLoading: false,
  error: null,
  selectedEnquiry: null,
};

const API_URL = "/api/hotel-enquiries"; // Consistent API endpoint

const hotelEnquirySlice = createSlice({
  name: "hotelEnquiry",
  initialState,
  reducers: {
    setEnquiries: (state, action: PayloadAction<HotelEnquiry[]>) => {
      state.enquiries = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addEnquiry: (state, action: PayloadAction<HotelEnquiry>) => {
      state.enquiries.unshift(action.payload);
      state.isLoading = false;
      state.error = null;
    },
    updateEnquiryState: (state, action: PayloadAction<HotelEnquiry>) => {
      const index = state.enquiries.findIndex(
        (item) => item.id === action.payload.id
      );
      if (index !== -1) {
        state.enquiries[index] = action.payload;
      }
      if (state.selectedEnquiry?.id === action.payload.id) {
        state.selectedEnquiry = action.payload;
      }
      state.isLoading = false;
      state.error = null;
    },
    removeEnquiry: (state, action: PayloadAction<string>) => {
      state.enquiries = state.enquiries.filter(
        (item) => item.id !== action.payload
      );
      if (state.selectedEnquiry?.id === action.payload) {
        state.selectedEnquiry = null;
      }
      state.isLoading = false;
      state.error = null;
    },
    setSelectedEnquiry: (state, action: PayloadAction<HotelEnquiry | null>) => {
      state.selectedEnquiry = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setEnquiries,
  addEnquiry,
  updateEnquiryState,
  removeEnquiry,
  setSelectedEnquiry,
  setIsLoading,
  setError,
  clearError,
} = hotelEnquirySlice.actions;

// --- Async Thunks (Manual Dispatch Pattern) ---

// READ All Enquiries
export const fetchHotelEnquiries = () => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.get(API_URL);
    if (response.status === 200) {
      dispatch(setEnquiries(response.data.enquiries));
    } else {
      dispatch(setError(response.data.message || "Failed to fetch enquiries"));
    }
  } catch (error: unknown) {
    dispatch(setError(getErrorMessage(error)));
  }
};

// CREATE New Enquiry
export const createHotelEnquiry =
  (enquiryData: Omit<HotelEnquiry, "id" | "createdAt" | "updatedAt">) =>
  async (dispatch: Dispatch) => {
    dispatch(setIsLoading(true));
    try {
      const response = await axios.post(API_URL, enquiryData);
      if (response.status === 201) {
        dispatch(addEnquiry(response.data.enquiry));
      } else {
        dispatch(setError(response.data.message || "Failed to create enquiry"));
      }
    } catch (error: unknown) {
      dispatch(setError(getErrorMessage(error)));
    }
  };

// UPDATE Enquiry by ID
export const updateHotelEnquiry =
  (id: string, enquiryData: Partial<HotelEnquiry>) =>
  async (dispatch: Dispatch) => {
    dispatch(setIsLoading(true));
    try {
      const response = await axios.put(`${API_URL}/${id}`, enquiryData);
      if (response.status === 200) {
        dispatch(updateEnquiryState(response.data.enquiry));
      } else {
        dispatch(setError(response.data.message || "Failed to update enquiry"));
      }
    } catch (error: unknown) {
      dispatch(setError(getErrorMessage(error)));
    }
  };

// DELETE Enquiry by ID
export const deleteHotelEnquiry =
  (id: string) => async (dispatch: Dispatch) => {
    dispatch(setIsLoading(true));
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      if (response.status === 200) {
        dispatch(removeEnquiry(id));
      } else {
        dispatch(setError(response.data.message || "Failed to delete enquiry"));
      }
    } catch (error: unknown) {
      dispatch(setError(getErrorMessage(error)));
    }
  };

// Selectors
export const selectHotelEnquiries = (state: RootState) =>
  state.hotelEnquiry.enquiries;
export const selectSelectedHotelEnquiry = (state: RootState) =>
  state.hotelEnquiry.selectedEnquiry;
export const selectHotelEnquiryLoading = (state: RootState) =>
  state.hotelEnquiry.isLoading;
export const selectHotelEnquiryError = (state: RootState) =>
  state.hotelEnquiry.error;

export default hotelEnquirySlice.reducer;
