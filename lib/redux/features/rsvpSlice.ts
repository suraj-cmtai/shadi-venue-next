import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import { getErrorMessage } from "@/lib/utils";

export interface RSVPResponse {
  id: string;
  inviteId: string;  // links to user's invite
  userId: string;    // the wedding owner's ID
  name: string;
  email: string;
  phone?: string;
  numberOfGuests: number;
  message?: string;
  attending: boolean;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'declined';
}

interface RSVPState {
  responses: RSVPResponse[];
  loading: boolean;
  error: string | null;
}

const initialState: RSVPState = {
  responses: [],
  loading: false,
  error: null,
};

// Fetch RSVP responses for a specific invite
export const fetchRSVPResponses = createAsyncThunk<RSVPResponse[], string>(
  "rsvp/fetchResponses",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/routes/invite/${userId}/responses`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Submit new RSVP response
export const submitRSVP = createAsyncThunk<
  RSVPResponse,
  Omit<RSVPResponse, "id" | "createdAt" | "status">
>(
  "rsvp/submit",
  async (rsvpData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/routes/invite/${rsvpData.userId}/rsvp`, rsvpData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Update RSVP status
export const updateRSVPStatus = createAsyncThunk<
  RSVPResponse,
  { rsvpId: string; userId: string; status: RSVPResponse["status"] }
>(
  "rsvp/updateStatus",
  async ({ rsvpId, userId, status }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/routes/invite/${userId}/responses/${rsvpId}`, {
        status,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const rsvpSlice = createSlice({
  name: "rsvp",
  initialState,
  reducers: {
    clearResponses: (state) => {
      state.responses = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch responses
      .addCase(fetchRSVPResponses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRSVPResponses.fulfilled, (state, action) => {
        state.responses = action.payload;
        state.loading = false;
      })
      .addCase(fetchRSVPResponses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Submit RSVP
      .addCase(submitRSVP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitRSVP.fulfilled, (state, action) => {
        state.responses.push(action.payload);
        state.loading = false;
      })
      .addCase(submitRSVP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update RSVP status
      .addCase(updateRSVPStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRSVPStatus.fulfilled, (state, action) => {
        const index = state.responses.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.responses[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateRSVPStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearResponses } = rsvpSlice.actions;

// Selectors
export const selectRSVPResponses = (state: RootState) => state.rsvp.responses;
export const selectRSVPLoading = (state: RootState) => state.rsvp.loading;
export const selectRSVPError = (state: RootState) => state.rsvp.error;

export default rsvpSlice.reducer;
