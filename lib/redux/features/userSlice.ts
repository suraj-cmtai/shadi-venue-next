import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import { getErrorMessage } from "@/lib/utils";

interface Theme {
  primaryColor: string;
  secondaryColor: string;
  titleColor: string;
  nameColor: string;
  backgroundColor: string;
  textColor: string;
}

interface Social {
  instagram?: string;
  facebook?: string;
  twitter?: string;
}

interface Person {
  name: string;
  description: string;
  image: string;
  socials: Social;
}

interface AboutSection {
  title: string;
  subtitle: string;
  groom: Person;
  bride: Person;
  coupleImage: string;
}

interface WeddingEvent {
  title: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  image?: string;
}

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  image?: string;
}

interface PlanningItem {
  title: string;
  description: string;
  icon?: string;
  completed: boolean;
}

interface InviteSection {
  heading: string;
  subheading: string;
  message: string;
  rsvpLink?: string;
  backgroundImage?: string;
}

interface Invite {
  isEnabled: boolean;
  theme: Theme;
  about: AboutSection;
  weddingEvents: WeddingEvent[];
  loveStory: TimelineEvent[];
  planning: PlanningItem[];
  invitation: InviteSection;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'hotel' | 'vendor';
  avatar?: string;
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  bookings?: string[];
  favorites?: {
    hotels?: string[];
    vendors?: string[];
  };
  notifications: {
    id: string;
    message: string;
    read: boolean;
    createdAt: string;
  }[];
  invite?: Invite;
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  selectedUser: User | null;
  searchQuery: string;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
  selectedUser: null,
  searchQuery: '',
};

// Async thunks
export const fetchUsers = createAsyncThunk<User[]>(
  "user/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/routes/users");
      if (response.data.errorCode !== "NO") {
        throw new Error(response.data.errorMessage);
      }
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchUserById = createAsyncThunk<User, string>(
  "user/fetchUserById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/routes/users/${id}`);
      if (response.data.errorCode !== "NO") {
        throw new Error(response.data.errorMessage);
      }
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateUser = createAsyncThunk<User, { id: string; data: FormData }>(
  "user/updateUser",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/routes/users/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.errorCode !== "NO") {
        throw new Error(response.data.errorMessage);
      }
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteUser = createAsyncThunk<string, string>(
  "user/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/routes/users/${id}`);
      if (response.data.errorCode !== "NO") {
        throw new Error(response.data.errorMessage);
      }
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

//
export const updateInvite = createAsyncThunk<User, { roleId: string; inviteData: Partial<Invite> }>(
  "user/updateInvite",
  async ({ roleId, inviteData }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/routes/users/${roleId}/invite`, inviteData);
      if (response.data.statusCode === 200) {
        return response.data.data;
      }
      return rejectWithValue(response.data.errorMessage || "Failed to update invite");
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);
//
export const toggleInviteStatus = createAsyncThunk<User, { roleId: string; isEnabled: boolean }>(
  "user/toggleInviteStatus",
  async ({ roleId, isEnabled }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/routes/users/${roleId}/invite/status`, { isEnabled });
      if (response.data.statusCode === 200) {
        return response.data.data;
      }
      return rejectWithValue(response.data.errorMessage || "Failed to toggle invite status");
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);
// 
export const updateInviteTheme = createAsyncThunk<User, { roleId: string; theme: Theme }>(
  "user/updateInviteTheme",
  async ({ roleId, theme }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/routes/users/${roleId}/invite/theme`, { theme });
      if (response.data.statusCode === 200) {
        return response.data.data;
      }
      return rejectWithValue(response.data.errorMessage || "Failed to update invite theme");
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);
//
export const updateWeddingEvent = createAsyncThunk<User,{ id: string; eventData: WeddingEvent; eventIndex?: number }>(
  "user/updateWeddingEvent",
  async ({ id, eventData, eventIndex }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/routes/users/${id}/invite/events`, {
        eventData,
        eventIndex,
      });
      if (response.data.errorCode !== "NO") {
        throw new Error(response.data.errorMessage);
      }
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);
//
export const deleteWeddingEvent = createAsyncThunk<User, { id: string; eventIndex: number }>(
  "user/deleteWeddingEvent",
  async ({ id, eventIndex }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/routes/users/${id}/invite/events/${eventIndex}`);
      if (response.data.errorCode !== "NO") {
        throw new Error(response.data.errorMessage);
      }
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    setSelectedUser: (state, action: PayloadAction<User>) => {
      state.selectedUser = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
        state.loading = false;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u.id !== action.payload);
        if (state.selectedUser?.id === action.payload) {
          state.selectedUser = null;
        }
        state.loading = false;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateInvite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInvite.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateInvite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(toggleInviteStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleInviteStatus.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
        state.loading = false;
      })
      .addCase(toggleInviteStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateInviteTheme.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInviteTheme.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateInviteTheme.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateWeddingEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWeddingEvent.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateWeddingEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteWeddingEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteWeddingEvent.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
        state.loading = false;
      })
      .addCase(deleteWeddingEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearSelectedUser,
  setSelectedUser,
  setSearchQuery,
} = userSlice.actions;

// Selectors
export const selectUsers = (state: RootState) => state.user.users;
export const selectUserLoading = (state: RootState) => state.user.loading;
export const selectUserError = (state: RootState) => state.user.error;
export const selectSelectedUser = (state: RootState) => state.user.selectedUser;

export default userSlice.reducer;
