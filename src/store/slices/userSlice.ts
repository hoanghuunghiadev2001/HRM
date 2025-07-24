import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  id: string | null; // Thêm id nếu cần
  employeeCode: string | null; // Thêm employeeCode nếu cần
  name: string | null;
  avatar: string | null;
  role: string; // Thêm role nếu cần
}

const initialState: UserState = {
  name: null,
  avatar: null,
  role: 'USER', // Mặc định là USER, có thể thay đổi nếu cần
  employeeCode: null,
  id: null, // Mặc định là null, có thể thay đổi nếu cần
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ name: string; avatar: string; id: string, employeeCode: string }>) => {
      state.name = action.payload.name;
      state.avatar = action.payload.avatar;
      state.id = action.payload.id || null; // Cập nhật id nếu có
      state.employeeCode = action.payload.employeeCode || null; // Cập nhật employeeCode nếu  
    },
    setUserAvatar: (state, action) => {
      state.avatar = action.payload; // chỉ cập nhật avatar
    },
    setUserRole: (state, action) => {
      state.role = action.payload; // chỉ cập nhật avatar
    },

    clearUser: (state) => {
      state.name = null;
      state.avatar = null;
    },
  },
});

export const { setUser, clearUser, setUserAvatar,setUserRole } = userSlice.actions;
export default userSlice.reducer;
