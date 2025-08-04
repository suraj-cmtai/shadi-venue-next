import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import { getErrorMessage } from "@/lib/utils";

// 1. Updated interface to match the API
interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  category: string | null;
  tags: string[];
  excerpt: string | null;
  status: 'draft' | 'published';
  image: string | null;
  createdOn: string; // Assuming these are ISO date strings
  updatedOn: string;
}

interface BlogState {
  blogs: Blog[];
  publishedBlogs: Blog[]; // Separate state for published blogs
  loading: boolean;
  error: string | null;
  selectedBlog: Blog | null;
  currentBlog: Blog | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  hasFetched: boolean; 
  hasFetchedBlogBySlug: boolean;
}

const initialState: BlogState = {
  blogs: [],
  publishedBlogs: [],
  loading: false,
  error: null,
  selectedBlog: null,
  currentBlog: null,
  pagination: {
    page: 1,
    limit: 6,
    total: 0,
  },
  hasFetched: false,
  hasFetchedBlogBySlug: false,
};



// 2. createAsyncThunk for fetching all blogs
export const fetchBlogs = createAsyncThunk<Blog[]>(
  "blog/fetchBlogs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/routes/blogs");
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// 3. createAsyncThunk for creating a new blog (handles FormData)
export const createBlog = createAsyncThunk<Blog, FormData>(
  "blog/createBlog",
  async (blogData, { rejectWithValue }) => {
    try {
      // Axios will automatically set the correct Content-Type for FormData
      const response = await axios.post("/api/routes/blogs", blogData);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// 4. createAsyncThunk for updating a blog (handles FormData)
export const updateBlog = createAsyncThunk<Blog, { id: string; data: FormData }>(
  "blog/updateBlog",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/routes/blogs/${id}`, data);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// 5. createAsyncThunk for deleting a blog
export const deleteBlog = createAsyncThunk<string, string>(
  "blog/deleteBlog",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/routes/blogs/${id}`);
      return id; // Return the id on success for the reducer
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// 6. Add fetchBlogBySlug thunk
export const fetchBlogBySlug = createAsyncThunk<Blog, string>(
  "blog/fetchBlogBySlug",
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/routes/blogs/slug/${slug}`);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// 7. fetch all published blogs
export const fetchPublishedBlogs = createAsyncThunk<Blog[]>(
  "blog/fetchPublishedBlogs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/routes/blogs/published");
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    // Reducers for synchronous actions if any are needed
    clearSelectedBlog: (state) => {
      state.selectedBlog = null;
    },
    clearCurrentBlog: (state) => {
      state.currentBlog = null;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setTotal: (state, action: PayloadAction<number>) => {
      state.pagination.total = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch all blogs
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = action.payload || [];
        state.error = null;
        state.pagination.total = Array.isArray(action.payload) ? action.payload.length : 0;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch blog by slug
    builder
      .addCase(fetchBlogBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBlog = action.payload;
        state.error = null;
        state.hasFetchedBlogBySlug = true;
      })
      .addCase(fetchBlogBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.currentBlog = null;
        state.hasFetchedBlogBySlug = true;
      });

    // Fetch published blogs
    builder
      .addCase(fetchPublishedBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublishedBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.publishedBlogs = action.payload;
        state.error = null;
        state.hasFetched = true;
      })
      .addCase(fetchPublishedBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.hasFetched = true;
      });

    // Create blog
    builder
      .addCase(createBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs.push(action.payload);
        state.error = null;
        state.pagination.total += 1;
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update blog
    builder
      .addCase(updateBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = state.blogs.map((blog) =>
          blog.id === action.payload.id ? action.payload : blog
        );
        state.error = null;
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete blog
    builder
      .addCase(deleteBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = state.blogs.filter((blog) => blog.id !== action.payload);
        state.error = null;
        state.pagination.total -= 1;
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  clearSelectedBlog,
  clearCurrentBlog,
  setPage,
  setTotal
} = blogSlice.actions;

// Selectors
export const selectBlogs = (state: RootState) => state.blog.blogs;
export const selectPublishedBlogs = (state: RootState) => state.blog.publishedBlogs;
export const selectBlogLoading = (state: RootState) => state.blog.loading;
export const selectBlogError = (state: RootState) => state.blog.error;
export const selectSelectedBlog = (state: RootState) => state.blog.selectedBlog;
export const selectCurrentBlog = (state: RootState) => state.blog.currentBlog;
export const selectPagination = (state: RootState) => state.blog.pagination;
export const selectHasFetchedBlogs = (state: RootState) => state.blog.hasFetched;
export const selectHasFetchedBlogBySlug = (state: RootState) => state.blog.hasFetchedBlogBySlug;

export default blogSlice.reducer;