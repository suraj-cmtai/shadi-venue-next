import { createSlice, Dispatch, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";

// Define a type for hero slides
export interface HeroSlide {
  id: string;
  image: string;
  heading: string;
  subtext: string;
  cta: string;
  status: 'active' | 'inactive';
  createdOn: string;
  updatedOn: string;
}

interface HeroState {
  heroSlides: HeroSlide[];
  activeHeroSlides?: HeroSlide[]; // Optional, can be used for active hero slides
  isLoading: boolean;
  hasFetched: boolean;
  error: string | null;
  selectedHeroSlide: HeroSlide | null;
}

const initialState: HeroState = {
  heroSlides: [],
  activeHeroSlides: [], // Initialize as an empty array
  isLoading: false,
  hasFetched: false,
  error: null,
  selectedHeroSlide: null,
};

const heroSlice = createSlice({
  name: "hero",
  initialState,
  reducers: {
    setHeroSlides: (state, action) => {
      state.heroSlides = action.payload;
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
    setSelectedHeroSlide: (state, action) => {
      state.selectedHeroSlide = action.payload;
    },
    clearSelectedHeroSlide: (state) => {
      state.selectedHeroSlide = null;
    },
    clearHeroSlides: (state) => {
      state.heroSlides = [];
    },

    // New reducers for local state updates
    addHeroSlide: (state, action) => {
      state.heroSlides.unshift(action.payload); // Add to beginning of array
      state.isLoading = false;
      state.error = null;
    },
    updateHeroSlide: (state, action) => {
      const index = state.heroSlides.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.heroSlides[index] = action.payload;
      }
      // Also update selectedHeroSlide if it's the same item
      if (state.selectedHeroSlide?.id === action.payload.id) {
        state.selectedHeroSlide = action.payload;
      }
      state.isLoading = false;
      state.error = null;
    },
    removeHeroSlide: (state, action) => {
      state.heroSlides = state.heroSlides.filter(item => item.id !== action.payload);
      // Clear selectedHeroSlide if it was the deleted item
      if (state.selectedHeroSlide?.id === action.payload) {
        state.selectedHeroSlide = null;
      }
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveHeroSlides.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveHeroSlides.fulfilled, (state, action: PayloadAction<HeroSlide[]>) => {
        state.activeHeroSlides = action.payload;
        state.isLoading = false;
        state.hasFetched = true;
        state.error = null;
      })
      .addCase(fetchActiveHeroSlides.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.hasFetched = true;
      });
  },
});

export const { 
  setHeroSlides, 
  setIsLoading, 
  setError, 
  setSelectedHeroSlide, 
  clearSelectedHeroSlide, 
  clearHeroSlides,
  addHeroSlide,
  updateHeroSlide,
  removeHeroSlide
} = heroSlice.actions;

export const fetchHeroSlides = () => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.get("/api/routes/hero");
    if (response.status === 200) {
      dispatch(setHeroSlides(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const fetchHeroSlideById = (id: string) => async (dispatch: Dispatch) => {     
  dispatch(setIsLoading(true));
  try {
    const response = await axios.get(`/api/routes/hero/${id}`);
    if (response.status === 200) {
      dispatch(setSelectedHeroSlide(response.data.data));
      dispatch(setIsLoading(false));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const fetchActiveHeroSlides = createAsyncThunk<HeroSlide[], void>(
  "hero/fetchActiveHeroSlides",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/routes/hero/active");
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

export const addHero = (heroData: Omit<HeroSlide, 'id' | 'createdOn' | 'updatedOn'>) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.post("/api/routes/hero", heroData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200 || response.status === 201) {
      // Add the new item to the local state instead of refetching
      dispatch(addHeroSlide(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const updateHero = (heroData: Partial<HeroSlide>, id: string) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.put(`/api/routes/hero/${id}`, heroData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200) {
      // Update the specific item in local state instead of refetching
      dispatch(updateHeroSlide(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};  

export const deleteHero = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.delete(`/api/routes/hero/${id}`);
    if (response.status === 200) {
      // Remove the item from local state instead of refetching
      dispatch(removeHeroSlide(id));
    } else {
      dispatch(setError(response.data.message)); 
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
}; 

export const selectHeroSlides = (state: RootState) => state.hero.heroSlides;
export const selectSelectedHeroSlide = (state: RootState) => state.hero.selectedHeroSlide;
export const selectIsLoading = (state: RootState) => state.hero.isLoading;
export const selectHasFetched = (state: RootState) => state.hero.hasFetched; 
export const selectError = (state: RootState) => state.hero.error;

export const selectActiveHeroSlides = (state: RootState) => state.hero.activeHeroSlides || []; // Return empty array if undefined

export default heroSlice.reducer;