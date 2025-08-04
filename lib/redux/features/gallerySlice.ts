import { createSlice, Dispatch, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";

// Define a type for gallery items
export interface GalleryItem {
  id: string;
  title: string;
  image: string;
  category: string;
  description: string;
  status: 'active' | 'inactive';
  createdOn: string;
  updatedOn: string;
}

interface GalleryState {
  gallery: GalleryItem[];
  activeGallery?: GalleryItem[]; // Optional, can be used for active galleries
  isLoading: boolean;
  hasFetched: boolean;
  error: string | null;
  selectedGallery: GalleryItem | null;
}

const initialState: GalleryState = {
  gallery: [],
  activeGallery: [], // Initialize as an empty array
  isLoading: false,
  hasFetched: false,
  error: null,
  selectedGallery: null,
};

const gallerySlice = createSlice({
  name: "gallery",
  initialState,
  reducers: {
    setGallery: (state, action) => {
      state.gallery = action.payload;
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
    setSelectedGallery: (state, action) => {
      state.selectedGallery = action.payload;
    },
    clearSelectedGallery: (state) => {
      state.selectedGallery = null;
    },
    clearGallery: (state) => {
      state.gallery = [];
    },

    // New reducers for local state updates
    addGalleryItem: (state, action) => {
      state.gallery.unshift(action.payload); // Add to beginning of array
      state.isLoading = false;
      state.error = null;
    },
    updateGalleryItem: (state, action) => {
      const index = state.gallery.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.gallery[index] = action.payload;
      }
      // Also update selectedGallery if it's the same item
      if (state.selectedGallery?.id === action.payload.id) {
        state.selectedGallery = action.payload;
      }
      state.isLoading = false;
      state.error = null;
    },
    removeGalleryItem: (state, action) => {
      state.gallery = state.gallery.filter(item => item.id !== action.payload);
      // Clear selectedGallery if it was the deleted item
      if (state.selectedGallery?.id === action.payload) {
        state.selectedGallery = null;
      }
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveGallery.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveGallery.fulfilled, (state, action: PayloadAction<GalleryItem[]>) => {
        state.activeGallery = action.payload;
        state.isLoading = false;
        state.hasFetched = true;
        state.error = null;
      })
      .addCase(fetchActiveGallery.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.hasFetched = true;
      });
  },
});

export const { 
  setGallery, 
  setIsLoading, 
  setError, 
  setSelectedGallery, 
  clearSelectedGallery, 
  clearGallery,
  addGalleryItem,
  updateGalleryItem,
  removeGalleryItem
} = gallerySlice.actions;

export const fetchGallery = () => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.get("/api/routes/gallery");
    if (response.status === 200) {
      dispatch(setGallery(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const fetchGalleryById = (id: string) => async (dispatch: Dispatch) => {     
  dispatch(setIsLoading(true));
  try {
    const response = await axios.get(`/api/routes/gallery/${id}`);
    if (response.status === 200) {
      dispatch(setSelectedGallery(response.data.data));
      dispatch(setIsLoading(false));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const fetchActiveGallery = createAsyncThunk<GalleryItem[], void>(
  "gallery/fetchActiveGallery",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/routes/gallery/active");
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

export const addGallery = (gallery: FormData) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.post("/api/routes/gallery", gallery, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    if (response.status === 200 || response.status === 201) {
      // Add the new item to the local state instead of refetching
      dispatch(addGalleryItem(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const updateGallery = (gallery: FormData, id: string) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.put(`/api/routes/gallery/${id}`, gallery, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    if (response.status === 200) {
      // Update the specific item in local state instead of refetching
      dispatch(updateGalleryItem(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};  

export const deleteGallery = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.delete(`/api/routes/gallery/${id}`);
    if (response.status === 200) {
      // Remove the item from local state instead of refetching
      dispatch(removeGalleryItem(id));
    } else {
      dispatch(setError(response.data.message)); 
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
}; 

export const selectGallery = (state: RootState) => state.gallery.gallery;
export const selectSelectedGallery = (state: RootState) => state.gallery.selectedGallery;
export const selectIsLoading = (state: RootState) => state.gallery.isLoading;
export const selectHasFetched = (state: RootState) => state.gallery.hasFetched; 
export const selectError = (state: RootState) => state.gallery.error;

export const selectActiveGalleryList = (state: RootState) => state.gallery.activeGallery || []; // Return empty array if undefined

export default gallerySlice.reducer;