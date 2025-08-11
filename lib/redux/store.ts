import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
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

// Configuration for redux-persist
const persistConfig = {
  key: 'auth',
  storage,
  whitelist: ['auth'] // only auth will be persisted
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
export type AppDispatch = typeof store.dispatch

export const persistor = persistStore(store);
export default store;