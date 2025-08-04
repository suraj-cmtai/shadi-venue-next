import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import { getErrorMessage } from "@/lib/utils";

// Define interfaces
interface Subscriber {
  id: string;
  email: string;
  status: 'Active' | 'Inactive' | 'Unsubscribed';
  source: string;
  createdAt: string;
  updatedAt: string;
  lastEmailSent?: string | null;
}

interface SubscriberState {
  subscribers: Subscriber[];
  loading: boolean;
  error: string | null;
  selectedSubscriber: Subscriber | null;
}

const initialState: SubscriberState = {
  subscribers: [],
  loading: false,
  error: null,
  selectedSubscriber: null,
};

// Fetch all subscribers
export const fetchSubscribers = createAsyncThunk<Subscriber[]>(
  "subscriber/fetchSubscribers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/routes/subscribers");
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Create a new subscriber
export const createSubscriber = createAsyncThunk<Subscriber, FormData>(
  "subscriber/createSubscriber",
  async (subscriberData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/routes/subscribers", subscriberData);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Update a subscriber
export const updateSubscriber = createAsyncThunk<
  Subscriber,
  { id: string; data: FormData }
>(
  "subscriber/updateSubscriber",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/routes/subscribers/${id}`, data);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Delete a subscriber
export const deleteSubscriber = createAsyncThunk<string, string>(
  "subscriber/deleteSubscriber",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/routes/subscribers/${id}`);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const subscriberSlice = createSlice({
  name: "subscriber",
  initialState,
  reducers: {
    clearSelectedSubscriber: (state) => {
      state.selectedSubscriber = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Subscribers
      .addCase(fetchSubscribers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscribers.fulfilled, (state, action: PayloadAction<Subscriber[]>) => {
        state.subscribers = action.payload;
        state.loading = false;
      })
      .addCase(fetchSubscribers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Subscriber
      .addCase(createSubscriber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubscriber.fulfilled, (state, action: PayloadAction<Subscriber>) => {
        state.subscribers.unshift(action.payload);
        state.loading = false;
      })
      .addCase(createSubscriber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Subscriber
      .addCase(updateSubscriber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubscriber.fulfilled, (state, action: PayloadAction<Subscriber>) => {
        const index = state.subscribers.findIndex(subscriber => subscriber.id === action.payload.id);
        if (index !== -1) {
          state.subscribers[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateSubscriber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Subscriber
      .addCase(deleteSubscriber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubscriber.fulfilled, (state, action: PayloadAction<string>) => {
        state.subscribers = state.subscribers.filter(subscriber => subscriber.id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteSubscriber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedSubscriber } = subscriberSlice.actions;

// Selectors
export const selectSubscribers = (state: RootState) => state.subscriber.subscribers;
export const selectSubscriberLoading = (state: RootState) => state.subscriber.loading;
export const selectSubscriberError = (state: RootState) => state.subscriber.error;
export const selectSelectedSubscriber = (state: RootState) => state.subscriber.selectedSubscriber;

export default subscriberSlice.reducer;