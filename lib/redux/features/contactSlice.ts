import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import { getErrorMessage } from "@/lib/utils";

// Define interfaces
export interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'New' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  createdAt: string;
  updatedAt: string;
}

interface ContactState {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  selectedContact: Contact | null;
}

const initialState: ContactState = {
  contacts: [],
  loading: false,
  error: null,
  selectedContact: null,
};

// Fetch all contacts
export const fetchContacts = createAsyncThunk<Contact[]>(
  "contact/fetchContacts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/routes/contact");
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Create a new contact
export const createContact = createAsyncThunk<Contact, FormData>(
  "contact/createContact",
  async (contactData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/routes/contact", contactData);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Update a contact
export const updateContact = createAsyncThunk<Contact, { id: number; data: FormData }>(
  "contact/updateContact",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/routes/contact/${id}`, data);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Delete a contact
export const deleteContact = createAsyncThunk<number, number>(
  "contact/deleteContact",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/routes/contact/${id}`);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {
    clearSelectedContact: (state) => {
      state.selectedContact = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Contacts
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action: PayloadAction<Contact[]>) => {
        state.contacts = action.payload;
        state.loading = false;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Contact
      .addCase(createContact.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createContact.fulfilled, (state, action: PayloadAction<Contact>) => {
        state.contacts.unshift(action.payload);
        state.loading = false;
      })
      .addCase(createContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Contact
      .addCase(updateContact.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateContact.fulfilled, (state, action: PayloadAction<Contact>) => {
        const index = state.contacts.findIndex(contact => contact.id === action.payload.id);
        if (index !== -1) {
          state.contacts[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Contact
      .addCase(deleteContact.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteContact.fulfilled, (state, action: PayloadAction<number>) => {
        state.contacts = state.contacts.filter(contact => contact.id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedContact } = contactSlice.actions;

// Selectors
export const selectContacts = (state: RootState) => state.contact.contacts;
export const selectContactLoading = (state: RootState) => state.contact.loading;
export const selectContactError = (state: RootState) => state.contact.error;
export const selectSelectedContact = (state: RootState) => state.contact.selectedContact;

export default contactSlice.reducer;
