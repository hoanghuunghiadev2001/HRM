import { configureStore, combineReducers } from "@reduxjs/toolkit";
import responsiveSlice from "./slices/responsiveSlice";
import userSlice from "./slices/userSlice";

import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

// --- 1️⃣ Gộp reducer
const rootReducer = combineReducers({
  responsive: responsiveSlice,
  user: userSlice,
});

// --- 2️⃣ Cấu hình persist
const persistConfig = {
  key: "root",
  storage,
};

// --- 3️⃣ Chỉ bật persist ở client
const persistedReducer =
  typeof window !== "undefined"
    ? persistReducer(persistConfig, rootReducer)
    : rootReducer;

// --- 4️⃣ Tạo store
export const store = configureStore({
  reducer: persistedReducer as typeof rootReducer, // 👈 ép kiểu an toàn
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// --- 5️⃣ Chỉ khởi tạo persistor ở client
export const persistor =
  typeof window !== "undefined" ? persistStore(store) : null;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
