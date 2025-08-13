import { createSlice, Dispatch, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";

// Define a type for wedding items
export interface WeddingItem {
  id: string;
  coupleNames: string;
  location: string;
  photoCount: number;
  weddingDate: string;
  theme: string;
  description: string;
  status: 'active' | 'inactive';
  images: {
    main: string;
    thumbnail1: string;
    thumbnail2: string;
    gallery: string[];
  };
  createdOn: string;
  updatedOn: string;
}

interface WeddingState {
  weddings: WeddingItem[];
  activeWeddings?: WeddingItem[];
  isLoading: boolean;
  hasFetched: boolean;
  error: string | null;
  selectedWedding: WeddingItem | null;
}

const initialState: WeddingState = {
  weddings: [],
  activeWeddings: [],
  isLoading: false,
  hasFetched: false,
  error: null,
  selectedWedding: null,
};

const weddingSlice = createSlice({
  name: "wedding",
  initialState,
  reducers: {
    setWeddings: (state, action) => {
      state.weddings = action.payload;
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
    setSelectedWedding: (state, action) => {
      state.selectedWedding = action.payload;
    },
    clearSelectedWedding: (state) => {
      state.selectedWedding = null;
    },
    clearWeddings: (state) => {
      state.weddings = [];
    },

    // New reducers for local state updates
    addWeddingItem: (state, action) => {
      state.weddings.unshift(action.payload);
      state.isLoading = false;
      state.error = null;
    },
    updateWeddingItem: (state, action) => {
      const index = state.weddings.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.weddings[index] = action.payload;
      }
      if (state.selectedWedding?.id === action.payload.id) {
        state.selectedWedding = action.payload;
      }
      state.isLoading = false;
      state.error = null;
    },
    removeWeddingItem: (state, action) => {
      state.weddings = state.weddings.filter(item => item.id !== action.payload);
      if (state.selectedWedding?.id === action.payload) {
        state.selectedWedding = null;
      }
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveWeddings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveWeddings.fulfilled, (state, action: PayloadAction<WeddingItem[]>) => {
        state.activeWeddings = action.payload;
        state.isLoading = false;
        state.hasFetched = true;
        state.error = null;
      })
      .addCase(fetchActiveWeddings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.hasFetched = true;
      });
  },
});

export const { 
  setWeddings, 
  setIsLoading, 
  setError, 
  setSelectedWedding, 
  clearSelectedWedding, 
  clearWeddings,
  addWeddingItem,
  updateWeddingItem,
  removeWeddingItem
} = weddingSlice.actions;

export const fetchWeddings = () => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.get("/api/routes/wedding");
    if (response.status === 200) {
      dispatch(setWeddings(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const fetchWeddingById = (id: string) => async (dispatch: Dispatch) => {     
  dispatch(setIsLoading(true));
  try {
    const response = await axios.get(`/api/routes/wedding/${id}`);
    if (response.status === 200) {
      dispatch(setSelectedWedding(response.data.data));
      dispatch(setIsLoading(false));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const fetchActiveWeddings = createAsyncThunk<WeddingItem[], void>(
  "wedding/fetchActiveWeddings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/routes/wedding/active");
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

export const addWedding = (wedding: FormData) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.post("/api/routes/wedding", wedding, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    if (response.status === 200 || response.status === 201) {
      dispatch(addWeddingItem(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const updateWedding = (wedding: FormData, id: string) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.put(`/api/routes/wedding/${id}`, wedding, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    if (response.status === 200) {
      dispatch(updateWeddingItem(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};  

export const deleteWedding = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.delete(`/api/routes/wedding/${id}`);
    if (response.status === 200) {
      dispatch(removeWeddingItem(id));
    } else {
      dispatch(setError(response.data.message)); 
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
}; 

export const selectWeddings = (state: RootState) => state.weddingManagement.weddings;
export const selectSelectedWedding = (state: RootState) => state.weddingManagement.selectedWedding;
export const selectIsLoading = (state: RootState) => state.weddingManagement.isLoading;
export const selectHasFetched = (state: RootState) => state.weddingManagement.hasFetched; 
export const selectError = (state: RootState) => state.weddingManagement.error;

export const selectActiveWeddingsList = (state: RootState) => state.weddingManagement.activeWeddings || [];

export default weddingSlice.reducer;
