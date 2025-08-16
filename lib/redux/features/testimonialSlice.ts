import { createSlice, Dispatch, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";

// Define a type for testimonials
export interface Testimonial {
  id: string;
  name: string;
  text: string;
  images: string[];
  storyUrl: string;
  status: 'active' | 'inactive';
  order: number;
  createdOn: string;
  updatedOn: string;
}

interface TestimonialState {
  testimonials: Testimonial[];
  activeTestimonials?: Testimonial[]; // Optional, can be used for active testimonials
  isLoading: boolean;
  hasFetched: boolean;
  error: string | null;
  selectedTestimonial: Testimonial | null;
}

const initialState: TestimonialState = {
  testimonials: [],
  activeTestimonials: [], // Initialize as an empty array
  isLoading: false,
  hasFetched: false,
  error: null,
  selectedTestimonial: null,
};

const testimonialSlice = createSlice({
  name: "testimonial",
  initialState,
  reducers: {
    setTestimonials: (state, action) => {
      state.testimonials = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setSelectedTestimonial: (state, action) => {
      state.selectedTestimonial = action.payload;
    },
    clearSelectedTestimonial: (state) => {
      state.selectedTestimonial = null;
    },
    clearTestimonials: (state) => {
      state.testimonials = [];
    },

    // New reducers for local state updates
    addTestimonial: (state, action) => {
      state.testimonials.unshift(action.payload); // Add to beginning of array
      state.isLoading = false;
      state.error = null;
    },
    updateTestimonial: (state, action) => {
      const index = state.testimonials.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.testimonials[index] = action.payload;
      }
      // Also update selectedTestimonial if it's the same item
      if (state.selectedTestimonial?.id === action.payload.id) {
        state.selectedTestimonial = action.payload;
      }
      state.isLoading = false;
      state.error = null;
    },
    removeTestimonial: (state, action) => {
      state.testimonials = state.testimonials.filter(item => item.id !== action.payload);
      // Clear selectedTestimonial if it was the deleted item
      if (state.selectedTestimonial?.id === action.payload) {
        state.selectedTestimonial = null;
      }
      state.isLoading = false;
      state.error = null;
    },
    reorderTestimonials: (state, action) => {
      // Update testimonials order locally
      const { testimonialId, newOrder } = action.payload;
      const testimonial = state.testimonials.find(t => t.id === testimonialId);
      if (testimonial) {
        testimonial.order = newOrder;
        // Re-sort testimonials by order
        state.testimonials.sort((a, b) => a.order - b.order);
      }
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveTestimonials.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveTestimonials.fulfilled, (state, action: PayloadAction<Testimonial[]>) => {
        state.activeTestimonials = action.payload;
        state.isLoading = false;
        state.hasFetched = true;
        state.error = null;
      })
      .addCase(fetchActiveTestimonials.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.hasFetched = true;
      });
  },
});

export const { 
  setTestimonials, 
  setIsLoading, 
  setError, 
  setSelectedTestimonial, 
  clearSelectedTestimonial, 
  clearTestimonials,
  addTestimonial,
  updateTestimonial,
  removeTestimonial,
  reorderTestimonials
} = testimonialSlice.actions;

export const fetchTestimonials = () => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.get("/api/routes/testimonial");
    if (response.status === 200) {
      dispatch(setTestimonials(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const fetchTestimonialById = (id: string) => async (dispatch: Dispatch) => {     
  dispatch(setIsLoading(true));
  try {
    const response = await axios.get(`/api/routes/testimonial/${id}`);
    if (response.status === 200) {
      dispatch(setSelectedTestimonial(response.data.data));
      dispatch(setIsLoading(false));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const fetchActiveTestimonials = createAsyncThunk<Testimonial[], void>(
  "testimonial/fetchActiveTestimonials",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/routes/testimonial/active");
      if (response.status === 200) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error: unknown) {
      const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
      return rejectWithValue(message || "Unknown error");
    }
  }
);

export const addTestimonialAction = (testimonialData: Omit<Testimonial, 'id' | 'createdOn' | 'updatedOn'>) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.post("/api/routes/testimonial", testimonialData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200 || response.status === 201) {
      // Add the new item to the local state instead of refetching
      dispatch(addTestimonial(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const updateTestimonialAction = (testimonialData: Partial<Testimonial>, id: string) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.put(`/api/routes/testimonial/${id}`, testimonialData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200) {
      // Update the specific item in local state instead of refetching
      dispatch(updateTestimonial(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};  

export const deleteTestimonialAction = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.delete(`/api/routes/testimonial/${id}`);
    if (response.status === 200) {
      // Remove the item from local state instead of refetching
      dispatch(removeTestimonial(id));
    } else {
      dispatch(setError(response.data.message)); 
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
}; 

export const updateTestimonialOrderAction = (testimonialId: string, newOrder: number) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.put("/api/routes/testimonial/order", {
      testimonialId,
      newOrder
    }, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200) {
      // Update the order in local state
      dispatch(reorderTestimonials({ testimonialId, newOrder }));
    } else {
      dispatch(setError(response.data.message)); 
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const selectTestimonials = (state: RootState) => state.testimonial.testimonials;
export const selectSelectedTestimonial = (state: RootState) => state.testimonial.selectedTestimonial;
export const selectIsLoading = (state: RootState) => state.testimonial.isLoading;
export const selectHasFetched = (state: RootState) => state.testimonial.hasFetched; 
export const selectError = (state: RootState) => state.testimonial.error;

export const selectActiveTestimonials = (state: RootState) => state.testimonial.activeTestimonials || []; // Return empty array if undefined

export default testimonialSlice.reducer;