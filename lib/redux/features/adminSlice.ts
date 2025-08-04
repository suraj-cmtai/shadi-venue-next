import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import { getErrorMessage } from "@/lib/utils";

// Types for admin user management
export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'superadmin';
  avatar?: string;
  phoneNumber?: string;
  lastLogin?: string;
  actions: {
    action: string;
    target: string;
    timestamp: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Types for approval management
interface ApprovalRequest {
  id: string;
  entityId: string;
  entityType: 'hotel' | 'vendor' | 'user' | 'super-admin';
  status: 'pending' | 'approved' | 'rejected';
  metadata: {
    businessName?: string;
    email: string;
    registrationDate: string;
    documents?: string[];
    notes?: string;
  };
  submittedAt: string;
  processedAt?: string;
  processedBy?: string;
}

interface AdminState {
  admins: Admin[];
  currentAdmin: Admin | null;
  approvalRequests: ApprovalRequest[];
  stats: {
    totalPending: number;
    totalApproved: number;
    totalRejected: number;
    hotelsPending: number;
    vendorsPending: number;
    usersPending: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  admins: [],
  currentAdmin: null,
  approvalRequests: [],
  stats: {
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0,
    hotelsPending: 0,
    vendorsPending: 0,
    usersPending: 0,
  },
  loading: false,
  error: null,
};

// Admin management thunks
export const fetchAdmins = createAsyncThunk<Admin[]>(
  'admin/fetchAdmins',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/admin');
      return response.data.admins;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchAdminById = createAsyncThunk<Admin, string>(
  'admin/fetchAdminById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/admin?id=${id}`);
      return response.data.admin;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createAdmin = createAsyncThunk<Admin, Partial<Admin>>(
  'admin/createAdmin',
  async (adminData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/admin', adminData);
      return response.data.admin;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateAdmin = createAsyncThunk<Admin, { id: string; data: Partial<Admin> }>(
  'admin/updateAdmin',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put('/api/admin', { id, ...data });
      return response.data.admin;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteAdmin = createAsyncThunk<string, string>(
  'admin/deleteAdmin',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/admin?id=${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const logAdminAction = createAsyncThunk<void, { id: string; action: string; target: string }>(
  'admin/logAction',
  async ({ id, action, target }, { rejectWithValue }) => {
    try {
      await axios.patch('/api/admin', { id, action, target });
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Fetch all approval requests
export const fetchApprovalRequests = createAsyncThunk<ApprovalRequest[]>(
  "admin/fetchApprovalRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/admin/approvals");
      if (response.data.errorCode !== "NO") {
        throw new Error(response.data.errorMessage);
      }
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Process an approval request
export const processApprovalRequest = createAsyncThunk<
  ApprovalRequest,
  { requestId: string; approved: boolean; notes?: string }
>(
  "admin/processApprovalRequest",
  async ({ requestId, approved, notes }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/admin/approvals/${requestId}`, {
        approved,
        notes,
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

// Fetch admin dashboard stats
export const fetchAdminStats = createAsyncThunk<AdminState["stats"]>(
  "admin/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/admin/stats");
      if (response.data.errorCode !== "NO") {
        throw new Error(response.data.errorMessage);
      }
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateStats: (state, action: PayloadAction<Partial<AdminState["stats"]>>) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    setCurrentAdmin: (state, action: PayloadAction<Admin | null>) => {
      state.currentAdmin = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch admins
      .addCase(fetchAdmins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdmins.fulfilled, (state, action) => {
        state.admins = action.payload;
        state.loading = false;
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch admin by ID
      .addCase(fetchAdminById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminById.fulfilled, (state, action) => {
        state.currentAdmin = action.payload;
        state.loading = false;
      })
      .addCase(fetchAdminById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create admin
      .addCase(createAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.admins.push(action.payload);
        state.loading = false;
      })
      .addCase(createAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update admin
      .addCase(updateAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdmin.fulfilled, (state, action) => {
        const index = state.admins.findIndex(admin => admin.id === action.payload.id);
        if (index !== -1) {
          state.admins[index] = action.payload;
        }
        if (state.currentAdmin?.id === action.payload.id) {
          state.currentAdmin = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete admin
      .addCase(deleteAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdmin.fulfilled, (state, action) => {
        state.admins = state.admins.filter(admin => admin.id !== action.payload);
        if (state.currentAdmin?.id === action.payload) {
          state.currentAdmin = null;
        }
        state.loading = false;
      })
      .addCase(deleteAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Approval Requests
      .addCase(fetchApprovalRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApprovalRequests.fulfilled, (state, action) => {
        state.approvalRequests = action.payload;
        state.loading = false;
      })
      .addCase(fetchApprovalRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Process Approval Request
      .addCase(processApprovalRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processApprovalRequest.fulfilled, (state, action) => {
        const index = state.approvalRequests.findIndex(
          (request) => request.id === action.payload.id
        );
        if (index !== -1) {
          state.approvalRequests[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(processApprovalRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Admin Stats
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.stats = action.payload;
        state.loading = false;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { clearError, updateStats, setCurrentAdmin } = adminSlice.actions;

// Selectors
export const selectAdmins = (state: RootState) => state.admin.admins;
export const selectCurrentAdmin = (state: RootState) => state.admin.currentAdmin;
export const selectApprovalRequests = (state: RootState) =>
  state.admin.approvalRequests;
export const selectPendingApprovals = (state: RootState) =>
  state.admin.approvalRequests.filter(
    (request) => request.status === "pending"
  );
export const selectAdminStats = (state: RootState) => state.admin.stats;
export const selectAdminLoading = (state: RootState) => state.admin.loading;
export const selectAdminError = (state: RootState) => state.admin.error;

export default adminSlice.reducer;
