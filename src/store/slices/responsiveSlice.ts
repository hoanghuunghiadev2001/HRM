// store/responsive.ts

import { createSlice } from "@reduxjs/toolkit";

interface ResponsiveState {
  isMobile: boolean;
}

const initialState: ResponsiveState = {
  isMobile: false, // mặc định là desktop
};

const responsiveSlice = createSlice({
  name: "responsive",
  initialState,
  reducers: {
    setIsMobile: (state, action) => {
      state.isMobile = action.payload;
    },
  },
});

export const { setIsMobile } = responsiveSlice.actions;
export default responsiveSlice.reducer;
