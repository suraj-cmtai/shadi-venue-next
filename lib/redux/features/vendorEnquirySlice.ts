import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  AnyAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import { getErrorMessage } from "@/lib/utils";

// --- TypeScript Interfaces (Aapke naye form ke anusaar) ---
export type VendorCategory =
  | "Venue"
  | "Planner"
  | "Photographer"
  | "Decorator"
  | "Caterer"
  | "Makeup"
  | "Entertainment"
  | "Others";
export type Designation = "Owner" | "Manager" | "Other";
export type ServiceArea =
  | "Local City"
  | "Statewide"
  | "Pan India"
  | "International";
export type PaymentMode = "UPI" | "Cash" | "Bank Transfer" | "Card" | "Other";
export type Facility =
  | "Rooms"
  | "Parking"
  | "Catering"
  | "Decor"
  | "DJ"
  | "Liquor License"
  | "Pool"
  | "Other";

export interface VendorEnquiry {
  id: string;
  businessName: string;
  category: VendorCategory;
  yearOfEstablishment?: string;
  contactPersonName: string;
  designation: Designation;
  mobileNumber: string;
  whatsappNumber?: string;
  emailId: string;
  websiteOrSocial?: string;
  fullAddress: string;
  city: string;
  state: string;
  pinCode: string;
  serviceAreas: ServiceArea;
  servicesOffered: string[];
  startingPrice: number;
  guestCapacityMin?: number;
  guestCapacityMax?: number;
  facilitiesAvailable?: Facility[];
  specialities?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  portfolioImageUrls?: string[];
  videoLinks?: string[];
  about?: string;
  awards?: string;
  notableClients?: string;
  advancePaymentPercent?: number;
  refundPolicy?: string;
  paymentModesAccepted?: PaymentMode[];
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  updatedAt: string;
}

interface VendorEnquiryState {
  enquiries: VendorEnquiry[];
  currentEnquiry: VendorEnquiry | null;
  loading: boolean;
  error: string | null;
}

const initialState: VendorEnquiryState = {
  enquiries: [],
  currentEnquiry: null,
  loading: false,
  error: null,
};

const API_URL = "/api/vendor-enquiries";

// --- Async Thunks ---

export const fetchEnquiries = createAsyncThunk<VendorEnquiry[]>(
  "vendorEnquiry/fetchEnquiries",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data.enquiries;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ✨ BADLAAV: Ab yeh FormData ke bajaye ek saaf object lega ✨
export const createEnquiry = createAsyncThunk<
  VendorEnquiry,
  Omit<VendorEnquiry, "id" | "createdAt" | "updatedAt">
>("vendorEnquiry/createEnquiry", async (enquiryData, { rejectWithValue }) => {
  try {
    // Note: File uploads ab service mein handle honge
    const response = await axios.post(API_URL, enquiryData);
    return response.data.enquiry;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// ✨ BADLAAV: Ab yeh FormData ke bajaye ek saaf object lega ✨
export const updateEnquiry = createAsyncThunk<
  VendorEnquiry,
  { id: string; data: Partial<VendorEnquiry> }
>("vendorEnquiry/updateEnquiry", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data.enquiry;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteEnquiry = createAsyncThunk<string, string>(
  "vendorEnquiry/deleteEnquiry",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// --- Slice Definition ---
const vendorEnquirySlice = createSlice({
  name: "vendorEnquiry",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentEnquiry: (state, action: PayloadAction<VendorEnquiry | null>) => {
      state.currentEnquiry = action.payload;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state: VendorEnquiryState) => {
      state.loading = true;
      state.error = null;
    };
    const handleRejected = (state: VendorEnquiryState, action: AnyAction) => {
      state.loading = false;
      state.error = action.payload as string;
    };

    builder
      .addCase(fetchEnquiries.pending, handlePending)
      .addCase(
        fetchEnquiries.fulfilled,
        (state, action: PayloadAction<VendorEnquiry[]>) => {
          state.enquiries = action.payload;
          state.loading = false;
        }
      )
      .addCase(fetchEnquiries.rejected, handleRejected)
      .addCase(createEnquiry.pending, handlePending)
      .addCase(
        createEnquiry.fulfilled,
        (state, action: PayloadAction<VendorEnquiry>) => {
          state.enquiries.unshift(action.payload);
          state.loading = false;
        }
      )
      .addCase(createEnquiry.rejected, handleRejected)
      .addCase(updateEnquiry.pending, handlePending)
      .addCase(
        updateEnquiry.fulfilled,
        (state, action: PayloadAction<VendorEnquiry>) => {
          const index = state.enquiries.findIndex(
            (e) => e.id === action.payload.id
          );
          if (index !== -1) {
            state.enquiries[index] = action.payload;
          }
          state.loading = false;
        }
      )
      .addCase(updateEnquiry.rejected, handleRejected)
      .addCase(deleteEnquiry.pending, handlePending)
      .addCase(
        deleteEnquiry.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.enquiries = state.enquiries.filter(
            (e) => e.id !== action.payload
          );
          state.loading = false;
        }
      )
      .addCase(deleteEnquiry.rejected, handleRejected);
  },
});

export const { clearError, setCurrentEnquiry } = vendorEnquirySlice.actions;

export const selectEnquiries = (state: RootState) =>
  state.vendorEnquiry.enquiries;
export const selectCurrentEnquiry = (state: RootState) =>
  state.vendorEnquiry.currentEnquiry;
export const selectEnquiryLoading = (state: RootState) =>
  state.vendorEnquiry.loading;
export const selectEnquiryError = (state: RootState) =>
  state.vendorEnquiry.error;

export default vendorEnquirySlice.reducer;
