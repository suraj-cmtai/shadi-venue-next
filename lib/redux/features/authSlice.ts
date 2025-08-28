import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";

// The "auth" object will contain all user details from the cookie
export interface Auth {
  id: string;
  name: string;
  email: string;
  role: "admin" | "super-admin" | "hotel" | "vendor" | "user" | "blog" | "marketing";
  roleId: string;
  status: "active" | "inactive";
  createdOn: string;
  updatedOn: string;
  // Dynamic role-specific IDs
  adminId?: string;
  hotelId?: string;
  vendorId?: string;
  userId?: string;
  blogId?: string;
  marketingId?: string;
  [key: string]: any; // allow for extra fields if backend adds more
}

interface AuthState {
  auth: Auth | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  authList: Auth[];
  listLoading: boolean;
  listError: string | null;
}

const initialState: AuthState = {
  auth: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  authList: [],
  listLoading: false,
  listError: null,
};

export const signup = createAsyncThunk(
  "auth/signup",
  async (
    { name, email, password, role }: { name: string; email: string; password: string; role: string }
  ) => {
    const response = await axios.post("/api/routes/auth", {
      name,
      email,
      password,
      role,
      action: "signup",
    });
    return response.data;
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }) => {
    const response = await axios.post("/api/routes/auth", { email, password, action: "login" });
    return response.data;
  }
);

// Logout: clear auth state; persisted reducer will sync storage without needing purge
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    await axios.delete("/api/routes/auth");
    dispatch(clearAuth());
    return null;
  }
);

// Fetch all auth entries
export const fetchAuthList = createAsyncThunk(
  "auth/fetchList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/routes/auth/list");
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errorMessage || error.message);
    }
  }
);

// Update auth status
export const updateAuthStatus = createAsyncThunk(
  "auth/updateStatus",
  async ({ id, status }: { id: string; status: Auth["status"] }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("status", status);
      const response = await axios.put(`/api/routes/auth/${id}`, formData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errorMessage || error.message);
    }
  }
);

// Delete auth entry
export const deleteAuth = createAsyncThunk(
  "auth/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/routes/auth/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errorMessage || error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.auth = action.payload;
      state.isAuthenticated = !!action.payload;
      state.error = null;
    },
    clearAuth: (state) => {
      state.auth = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Signup
    builder.addCase(signup.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(signup.fulfilled, (state, action) => {
      state.isLoading = false;
      state.auth = action.payload;
      state.isAuthenticated = !!action.payload;
      state.error = null;
    });
    builder.addCase(signup.rejected, (state, action) => {
      state.isLoading = false;
      state.error = (action.payload as string) || action.error.message || "Signup failed";
    });

    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.auth = action.payload;
      state.isAuthenticated = !!action.payload;
      state.error = null;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = (action.payload as string) || action.error.message || "Login failed";
    });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.auth = null;
      state.isAuthenticated = false;
      state.error = null;
    });

    // Fetch Auth List
    builder.addCase(fetchAuthList.pending, (state) => {
      state.listLoading = true;
      state.listError = null;
    });
    builder.addCase(fetchAuthList.fulfilled, (state, action) => {
      state.listLoading = false;
      state.authList = action.payload;
      state.listError = null;
    });
    builder.addCase(fetchAuthList.rejected, (state, action) => {
      state.listLoading = false;
      state.listError = action.error.message || "Failed to fetch auth list";
    });

    // Update Auth Status
    builder.addCase(updateAuthStatus.fulfilled, (state, action) => {
      const updatedAuth = action.payload;
      state.authList = state.authList.map(auth =>
        auth.id === updatedAuth.id ? updatedAuth : auth
      );
    });

    // Delete Auth
    builder.addCase(deleteAuth.fulfilled, (state, action) => {
      state.authList = state.authList.filter(auth => auth.id !== action.payload);
    });
  },
});

export const { setAuth, clearAuth } = authSlice.actions;

// Selectors
export const selectAuth = (state: RootState) => state.auth.auth;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectError = (state: RootState) => state.auth.error;

export default authSlice.reducer;