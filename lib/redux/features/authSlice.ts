import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";

// The "auth" object will contain all user details from the cookie
export interface Auth {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId: string;
  status: string;
  [key: string]: any; // allow for extra fields if backend adds more
}

interface AuthState {
  auth: Auth | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  auth: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
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

export const logout = createAsyncThunk(
  "auth/logout",
  async () => {
    await axios.delete("/api/routes/auth");
    // Cookie should be cleared by backend
    return null;
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
  },
});

export const { setAuth, clearAuth } = authSlice.actions;

// Selectors
export const selectAuth = (state: RootState) => state.auth.auth;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectError = (state: RootState) => state.auth.error;

export default authSlice.reducer;