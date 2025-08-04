import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const signup = createAsyncThunk(
  "auth/signup",
  async ({ name, email, password }: { name: string; email: string; password: string }) => {
    const response = await axios.post("/api/routes/auth", { name, email, password, action: "signup" });
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
    return null;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
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
      state.user = action.payload.data;
      state.isAuthenticated = true;
      state.error = null;
    });
    builder.addCase(signup.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || "Signup failed";
    });

    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.data;
      state.isAuthenticated = true;
      state.error = null;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || "Login failed";
    });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    });
  },
});

export const { setUser } = authSlice.actions;

export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectError = (state: RootState) => state.auth.error;

export default authSlice.reducer;