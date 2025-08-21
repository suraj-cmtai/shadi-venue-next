import { configureStore, combineReducers, ThunkDispatch, Action } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import createWebStorage from 'redux-persist/lib/storage/createWebStorage'

const createNoopStorage = () => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
};

const storage = typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage();
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
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
import rsvpReducer from "./features/rsvpSlice";
import weddingManagementReducer from "./features/weddingSlice"
import heroReducer from "./features/heroSlice";
import testimonialReducer from "./features/testimonialSlice";
import heroExtensionReducer from "./features/heroExtensionSlice";
import aboutReducer from "./features/aboutSlice";
import vendorEnquiryReducer from "./features/vendorEnquirySlice";
import hotelEnquiryReducer from "./features/hotelEnquirySlice";

// Configuration for redux-persist
const persistConfig = {
  key: "auth",
  storage,
  whitelist: ["auth"], // only auth will be persisted
  blacklist: [], // optionally blacklist any redux path
};

const rootReducer = combineReducers({
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
  rsvp: rsvpReducer,
  weddingManagement: weddingManagementReducer,
  hero: heroReducer,
  testimonial: testimonialReducer,
  heroExtension: heroExtensionReducer,
  about: aboutReducer,
  vendorEnquiry: vendorEnquiryReducer,
  hotelEnquiry: hotelEnquiryReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = ThunkDispatch<RootState, unknown, Action> & typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const persistor = persistStore(store);
export default store;