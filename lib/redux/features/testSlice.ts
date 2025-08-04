import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import { getErrorMessage } from "@/lib/utils";

// Test interfaces based on testServices.ts
export interface TestQuestion {
  id: number;
  question: string;
  options: string[];
  category: string;
}

export interface TestAnswer {
  questionId: number;
  answer: string;
  timeSpent: number;
  category: string;
}

export interface CareerRecommendation {
  title: string;
  description: string;
  matchPercentage: number;
  skills: string[];
  educationPath: string[];
  image?: string;
  link?: string;
  id?: string;
}

export interface UserDetails {
  name: string;
  phone: string;
  email: string;
}

export interface TestResult {
  id: string;
  questions: TestQuestion[];
  answers: TestAnswer[];
  recommendations: CareerRecommendation[];
  userDetails: UserDetails;
  testDuration?: number;
  totalQuestions?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TestStats {
  totalTests: number;
  averageQuestions: number;
  averageDuration: number;
  mostCommonCategories: { category: string; count: number }[];
  averageMatchPercentage: number;
  uniqueUsers: number;
}

interface TestState {
  testResults: TestResult[];
  selectedTest: TestResult | null;
  testStats: TestStats | null;
  loading: boolean;
  error: string | null;
  hasFetched: boolean;
  hasFetchedStats: boolean;
}

const initialState: TestState = {
  testResults: [],
  selectedTest: null,
  testStats: null,
  loading: false,
  error: null,
  hasFetched: false,
  hasFetchedStats: false,
};

// Async thunks
export const fetchTestResults = createAsyncThunk<TestResult[]>(
  "test/fetchTestResults",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/routes/test");
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchTestResultById = createAsyncThunk<TestResult, string>(
  "test/fetchTestResultById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/routes/test?id=${id}`);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchTestStats = createAsyncThunk<TestStats>(
  "test/fetchTestStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/routes/test?stats=true");
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteTestResult = createAsyncThunk<string, string>(
  "test/deleteTestResult",
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/routes/test?id=${id}`);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const testSlice = createSlice({
  name: "test",
  initialState,
  reducers: {
    clearSelectedTest: (state) => {
      state.selectedTest = null;
    },
    clearTestStats: (state) => {
      state.testStats = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch test results
    builder
      .addCase(fetchTestResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestResults.fulfilled, (state, action) => {
        state.loading = false;
        state.testResults = action.payload || [];
        state.error = null;
        state.hasFetched = true;
      })
      .addCase(fetchTestResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch test result by ID
    builder
      .addCase(fetchTestResultById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestResultById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTest = action.payload;
        state.error = null;
      })
      .addCase(fetchTestResultById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.selectedTest = null;
      });

    // Fetch test stats
    builder
      .addCase(fetchTestStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestStats.fulfilled, (state, action) => {
        state.loading = false;
        state.testStats = action.payload;
        state.error = null;
        state.hasFetchedStats = true;
      })
      .addCase(fetchTestStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.hasFetchedStats = true;
      });

    // Delete test result
    builder
      .addCase(deleteTestResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTestResult.fulfilled, (state, action) => {
        state.loading = false;
        state.testResults = state.testResults.filter(
          (test) => test.id !== action.payload
        );
        state.error = null;
      })
      .addCase(deleteTestResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedTest, clearTestStats } = testSlice.actions;

// Selectors
export const selectTestResults = (state: RootState) => state.test.testResults;
export const selectSelectedTest = (state: RootState) => state.test.selectedTest;
export const selectTestStats = (state: RootState) => state.test.testStats;
export const selectTestLoading = (state: RootState) => state.test.loading;
export const selectTestError = (state: RootState) => state.test.error;
export const selectHasFetchedTests = (state: RootState) => state.test.hasFetched;
export const selectHasFetchedTestStats = (state: RootState) => state.test.hasFetchedStats;

export default testSlice.reducer; 