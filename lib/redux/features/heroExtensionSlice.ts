import { createSlice, Dispatch, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";

// Define image types for the hero extension section
export type ImageType = 
  | 'tall_left' 
  | 'main_center' 
  | 'bottom_left' 
  | 'center_bottom' 
  | 'top_right' 
  | 'far_right';

export interface HeroExtensionImage {
  id: string;
  type: ImageType;
  imageUrl: string;
  altText: string;
  order: number;
  status: 'active' | 'inactive';
  createdOn: string;
  updatedOn: string;
}

export interface HeroExtensionContent {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  status: 'active' | 'inactive';
  createdOn: string;
  updatedOn: string;
}

interface HeroExtensionState {
  images: HeroExtensionImage[];
  content: HeroExtensionContent | null;
  activeImages: { [key in ImageType]: HeroExtensionImage[] };
  isLoading: boolean;
  hasFetched: boolean;
  error: string | null;
  selectedImage: HeroExtensionImage | null;
}

const initialState: HeroExtensionState = {
  images: [],
  content: null,
  activeImages: {
    tall_left: [],
    main_center: [],
    bottom_left: [],
    center_bottom: [],
    top_right: [],
    far_right: []
  },
  isLoading: false,
  hasFetched: false,
  error: null,
  selectedImage: null,
};

const heroExtensionSlice = createSlice({
  name: "heroExtension",
  initialState,
  reducers: {
    setImages: (state, action) => {
      state.images = action.payload;
      // Group images by type for easy access
      state.activeImages = action.payload.reduce((acc: any, image: HeroExtensionImage) => {
        if (image.status === 'active') {
          if (!acc[image.type]) acc[image.type] = [];
          acc[image.type].push(image);
        }
        return acc;
      }, {
        tall_left: [],
        main_center: [],
        bottom_left: [],
        center_bottom: [],
        top_right: [],
        far_right: []
      });
      
      // Sort images by order within each type
      Object.keys(state.activeImages).forEach(type => {
        state.activeImages[type as ImageType].sort((a, b) => a.order - b.order);
      });
      
      state.isLoading = false;
      state.error = null;
    },
    setContent: (state, action) => {
      state.content = action.payload;
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
    setSelectedImage: (state, action) => {
      state.selectedImage = action.payload;
    },
    clearSelectedImage: (state) => {
      state.selectedImage = null;
    },
    clearImages: (state) => {
      state.images = [];
      state.activeImages = {
        tall_left: [],
        main_center: [],
        bottom_left: [],
        center_bottom: [],
        top_right: [],
        far_right: []
      };
    },

    // Local state updates
    addImage: (state, action) => {
      state.images.unshift(action.payload);
      // Re-group images
      const allImages = state.images;
      state.activeImages = allImages.reduce((acc: any, image: HeroExtensionImage) => {
        if (image.status === 'active') {
          if (!acc[image.type]) acc[image.type] = [];
          acc[image.type].push(image);
        }
        return acc;
      }, {
        tall_left: [],
        main_center: [],
        bottom_left: [],
        center_bottom: [],
        top_right: [],
        far_right: []
      });
      state.isLoading = false;
      state.error = null;
    },
    updateImage: (state, action) => {
      const index = state.images.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.images[index] = action.payload;
      }
      // Re-group images
      const allImages = state.images;
      state.activeImages = allImages.reduce((acc: any, image: HeroExtensionImage) => {
        if (image.status === 'active') {
          if (!acc[image.type]) acc[image.type] = [];
          acc[image.type].push(image);
        }
        return acc;
      }, {
        tall_left: [],
        main_center: [],
        bottom_left: [],
        center_bottom: [],
        top_right: [],
        far_right: []
      });
      
      if (state.selectedImage?.id === action.payload.id) {
        state.selectedImage = action.payload;
      }
      state.isLoading = false;
      state.error = null;
    },
    removeImage: (state, action) => {
      state.images = state.images.filter(item => item.id !== action.payload);
      // Re-group images
      const allImages = state.images;
      state.activeImages = allImages.reduce((acc: any, image: HeroExtensionImage) => {
        if (image.status === 'active') {
          if (!acc[image.type]) acc[image.type] = [];
          acc[image.type].push(image);
        }
        return acc;
      }, {
        tall_left: [],
        main_center: [],
        bottom_left: [],
        center_bottom: [],
        top_right: [],
        far_right: []
      });
      
      if (state.selectedImage?.id === action.payload) {
        state.selectedImage = null;
      }
      state.isLoading = false;
      state.error = null;
    },
    updateContent: (state, action) => {
      state.content = action.payload;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveImages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveImages.fulfilled, (state, action: PayloadAction<HeroExtensionImage[]>) => {
        // Group active images by type
        state.activeImages = action.payload.reduce((acc: any, image: HeroExtensionImage) => {
          if (!acc[image.type]) acc[image.type] = [];
          acc[image.type].push(image);
          return acc;
        }, {
          tall_left: [],
          main_center: [],
          bottom_left: [],
          center_bottom: [],
          top_right: [],
          far_right: []
        });
        
        // Sort images by order within each type
        Object.keys(state.activeImages).forEach(type => {
          state.activeImages[type as ImageType].sort((a, b) => a.order - b.order);
        });
        
        state.isLoading = false;
        state.hasFetched = true;
        state.error = null;
      })
      .addCase(fetchActiveImages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.hasFetched = true;
      });
  },
});

export const { 
  setImages, 
  setContent,
  setIsLoading, 
  setError, 
  setSelectedImage, 
  clearSelectedImage, 
  clearImages,
  addImage,
  updateImage,
  removeImage,
  updateContent
} = heroExtensionSlice.actions;

// Async thunks
export const fetchImages = () => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.get("/api/routes/hero-extension");
    if (response.status === 200) {
      dispatch(setImages(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const fetchContent = () => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.get("/api/routes/hero-extension/content");
    if (response.status === 200) {
      dispatch(setContent(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const fetchImageById = (id: string) => async (dispatch: Dispatch) => {     
  dispatch(setIsLoading(true));
  try {
    const response = await axios.get(`/api/routes/hero-extension/${id}`);
    if (response.status === 200) {
      dispatch(setSelectedImage(response.data.data));
      dispatch(setIsLoading(false));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const fetchActiveImages = createAsyncThunk<HeroExtensionImage[], void>(
  "heroExtension/fetchActiveImages",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/routes/hero-extension/active");
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

export const addImageAction = (imageData: Omit<HeroExtensionImage, 'id' | 'createdOn' | 'updatedOn'>) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.post("/api/routes/hero-extension", imageData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200 || response.status === 201) {
      dispatch(addImage(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const updateImageAction = (imageData: Partial<HeroExtensionImage>, id: string) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.put(`/api/routes/hero-extension/${id}`, imageData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200) {
      dispatch(updateImage(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};  

export const deleteImageAction = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.delete(`/api/routes/hero-extension/${id}`);
    if (response.status === 200) {
      dispatch(removeImage(id));
    } else {
      dispatch(setError(response.data.message)); 
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
}; 

export const updateContentAction = (contentData: Partial<HeroExtensionContent>, id?: string) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const url = id ? `/api/routes/hero-extension/content/${id}` : "/api/routes/hero-extension/content";
    const method = id ? 'put' : 'post';
    
    const response = await axios[method](url, contentData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (response.status === 200 || response.status === 201) {
      dispatch(updateContent(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

// Selectors
export const selectImages = (state: RootState) => state.heroExtension.images;
export const selectContent = (state: RootState) => state.heroExtension.content;
export const selectActiveImages = (state: RootState) => state.heroExtension.activeImages;
export const selectSelectedImage = (state: RootState) => state.heroExtension.selectedImage;
export const selectIsLoading = (state: RootState) => state.heroExtension.isLoading;
export const selectHasFetched = (state: RootState) => state.heroExtension.hasFetched; 
export const selectError = (state: RootState) => state.heroExtension.error;

// Helper selectors
export const selectImagesByType = (state: RootState, type: ImageType) => 
  state.heroExtension.images.filter(image => image.type === type);

export const selectActiveImagesByType = (state: RootState, type: ImageType) => 
  state.heroExtension.activeImages[type] || [];

export const selectRandomImageByType = (state: RootState, type: ImageType) => {
  const images = state.heroExtension.activeImages[type] || [];
  if (images.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
};

export default heroExtensionSlice.reducer;