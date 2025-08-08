import { configureStore } from '@reduxjs/toolkit'
import galleryReducer from "./features/gallerySlice";
import authReducer from "./features/authSlice";
import blogReducer from "./features/blogSlice";
import courseReducer from "./features/courseSlice";
import subscriberReducer from "./features/subscriberSlice";
import contactReducer from "./features/contactSlice";
import testReducer from "./features/testSlice";
import hotelReducer from "./features/hotelSlice";
import adminReducer from "./features/adminSlice";
import vendorReducer from "./features/vendorSlice";
import userReducer from "./features/userSlice";
import weddingReducer from "./features/inviteSlice";

export const store = configureStore({
  reducer: {
    gallery: galleryReducer,
    auth: authReducer,
    blog: blogReducer,
    course: courseReducer,
    subscriber: subscriberReducer,
    contact: contactReducer,
    test: testReducer,
    hotel: hotelReducer,
    admin: adminReducer,
    vendor: vendorReducer,
    user: userReducer,
    wedding: weddingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store;