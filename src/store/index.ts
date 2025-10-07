// --- 🔹 store.ts ---
// Redux Toolkit + Redux Persist + TypeScript cấu hình đầy đủ

import { configureStore, combineReducers } from "@reduxjs/toolkit";
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

import responsiveSlice from "./slices/responsiveSlice";
import userSlice from "./slices/userSlice";

// --- 1️⃣ Gộp các reducer ---
const rootReducer = combineReducers({
  responsive: responsiveSlice,
  user: userSlice,
});

// --- 2️⃣ Cấu hình redux-persist ---
const persistConfig = {
  key: "root",     // tên key trong localStorage
  storage,         // sử dụng localStorage
  whitelist: ["user"], // chỉ định slice nào được lưu (tùy chọn)
};

// --- 3️⃣ Tạo persisted reducer ---
const persistedReducer = persistReducer(persistConfig, rootReducer);

// --- 4️⃣ Tạo store ---
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// --- 5️⃣ Khởi tạo persistor ---
export const persistor = persistStore(store);

// --- 6️⃣ Xuất type hỗ trợ ---
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
