import { createSlice, Dispatch, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";

// Define a type for about content
export interface AboutContent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  status: 'active' | 'inactive';
  createdOn: string;
  updatedOn: string;
}

// Define a type for process steps
export interface ProcessStep {
  id: string;
  icon: string;
  title: string;
  description: string;
  bgColor: string;
  titleColor: string;
  order: number;
  status: 'active' | 'inactive';
  createdOn: string;
  updatedOn: string;
}

interface AboutState {
  aboutContent: AboutContent[];
  processSteps: ProcessStep[];
  activeAboutContent?: AboutContent[];
  activeProcessSteps?: ProcessStep[];
  isLoading: boolean;
  hasFetched: boolean;
  error: string | null;
  selectedAboutContent: AboutContent | null;
  selectedProcessStep: ProcessStep | null;
}

const initialState: AboutState = {
  aboutContent: [],
  processSteps: [],
  activeAboutContent: [],
  activeProcessSteps: [],
  isLoading: false,
  hasFetched: false,
  error: null,
  selectedAboutContent: null,
  selectedProcessStep: null,
};

const aboutSlice = createSlice({
  name: "about",
  initialState,
  reducers: {
    // About Content reducers
    setAboutContent: (state, action) => {
      state.aboutContent = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addAboutContent: (state, action) => {
      state.aboutContent.unshift(action.payload);
      state.isLoading = false;
      state.error = null;
    },
    updateAboutContent: (state, action) => {
      const index = state.aboutContent.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.aboutContent[index] = action.payload;
      }
      if (state.selectedAboutContent?.id === action.payload.id) {
        state.selectedAboutContent = action.payload;
      }
      state.isLoading = false;
      state.error = null;
    },
    removeAboutContent: (state, action) => {
      state.aboutContent = state.aboutContent.filter(item => item.id !== action.payload);
      if (state.selectedAboutContent?.id === action.payload) {
        state.selectedAboutContent = null;
      }
      state.isLoading = false;
      state.error = null;
    },
    setSelectedAboutContent: (state, action) => {
      state.selectedAboutContent = action.payload;
    },
    clearSelectedAboutContent: (state) => {
      state.selectedAboutContent = null;
    },

    // Process Steps reducers
    setProcessSteps: (state, action) => {
      state.processSteps = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addProcessStep: (state, action) => {
      state.processSteps.unshift(action.payload);
      state.isLoading = false;
      state.error = null;
    },
    updateProcessStep: (state, action) => {
      const index = state.processSteps.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.processSteps[index] = action.payload;
      }
      if (state.selectedProcessStep?.id === action.payload.id) {
        state.selectedProcessStep = action.payload;
      }
      state.isLoading = false;
      state.error = null;
    },
    removeProcessStep: (state, action) => {
      state.processSteps = state.processSteps.filter(item => item.id !== action.payload);
      if (state.selectedProcessStep?.id === action.payload) {
        state.selectedProcessStep = null;
      }
      state.isLoading = false;
      state.error = null;
    },
    setSelectedProcessStep: (state, action) => {
      state.selectedProcessStep = action.payload;
    },
    clearSelectedProcessStep: (state) => {
      state.selectedProcessStep = null;
    },

    // Common reducers
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch active about content
      .addCase(fetchActiveAboutContent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveAboutContent.fulfilled, (state, action: PayloadAction<AboutContent[]>) => {
        state.activeAboutContent = action.payload;
        state.isLoading = false;
        state.hasFetched = true;
        state.error = null;
      })
      .addCase(fetchActiveAboutContent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.hasFetched = true;
      })
      // Fetch active process steps
      .addCase(fetchActiveProcessSteps.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveProcessSteps.fulfilled, (state, action: PayloadAction<ProcessStep[]>) => {
        state.activeProcessSteps = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchActiveProcessSteps.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setAboutContent,
  addAboutContent,
  updateAboutContent,
  removeAboutContent,
  setSelectedAboutContent,
  clearSelectedAboutContent,
  setProcessSteps,
  addProcessStep,
  updateProcessStep,
  removeProcessStep,
  setSelectedProcessStep,
  clearSelectedProcessStep,
  setIsLoading,
  setError,
  clearError,
} = aboutSlice.actions;

// Async thunks for fetching active content
export const fetchActiveAboutContent = createAsyncThunk<AboutContent[], void>(
  "about/fetchActiveAboutContent",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/routes/about/active");
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

export const fetchActiveProcessSteps = createAsyncThunk<ProcessStep[], void>(
  "about/fetchActiveProcessSteps",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/routes/about/process-steps/active");
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

// About Content CRUD operations
export const fetchAboutContent = () => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.get("/api/routes/about");
    if (response.status === 200) {
      dispatch(setAboutContent(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const fetchAboutContentById = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.get(`/api/routes/about/${id}`);
    if (response.status === 200) {
      dispatch(setSelectedAboutContent(response.data.data));
      dispatch(setIsLoading(false));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const createAboutContent = (aboutData: Omit<AboutContent, 'id' | 'createdOn' | 'updatedOn'>) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.post("/api/routes/about", aboutData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200 || response.status === 201) {
      dispatch(addAboutContent(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const updateAboutContentById = (aboutData: Partial<AboutContent>, id: string) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.put(`/api/routes/about/${id}`, aboutData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200) {
      dispatch(updateAboutContent(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const deleteAboutContent = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.delete(`/api/routes/about/${id}`);
    if (response.status === 200) {
      dispatch(removeAboutContent(id));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

// Process Steps CRUD operations
export const fetchProcessSteps = () => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.get("/api/routes/about/process-steps");
    if (response.status === 200) {
      dispatch(setProcessSteps(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const fetchProcessStepById = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.get(`/api/routes/about/process-steps/${id}`);
    if (response.status === 200) {
      dispatch(setSelectedProcessStep(response.data.data));
      dispatch(setIsLoading(false));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const createProcessStep = (stepData: Omit<ProcessStep, 'id' | 'createdOn' | 'updatedOn'>) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.post("/api/routes/about/process-steps", stepData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200 || response.status === 201) {
      dispatch(addProcessStep(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const updateProcessStepById = (stepData: Partial<ProcessStep>, id: string) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.put(`/api/routes/about/process-steps/${id}`, stepData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200) {
      dispatch(updateProcessStep(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const deleteProcessStep = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.delete(`/api/routes/about/process-steps/${id}`);
    if (response.status === 200) {
      dispatch(removeProcessStep(id));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

// Selectors
export const selectAboutContent = (state: RootState) => state.about.aboutContent;
export const selectProcessSteps = (state: RootState) => state.about.processSteps;
export const selectActiveAboutContent = (state: RootState) => state.about.activeAboutContent || [];
export const selectActiveProcessSteps = (state: RootState) => state.about.activeProcessSteps || [];
export const selectSelectedAboutContent = (state: RootState) => state.about.selectedAboutContent;
export const selectSelectedProcessStep = (state: RootState) => state.about.selectedProcessStep;
export const selectIsLoading = (state: RootState) => state.about.isLoading;
export const selectHasFetched = (state: RootState) => state.about.hasFetched;
export const selectError = (state: RootState) => state.about.error;

export default aboutSlice.reducer;