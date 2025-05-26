import { configureStore } from "@reduxjs/toolkit";
import responsiveSlice from "./slices/responsiveSlice";

export const store = configureStore({
  reducer: {
    responsive: responsiveSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
