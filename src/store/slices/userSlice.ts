import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  id: string | null;
  employeeCode: string | null;
  name: string | null;
  avatar: string | null;
  role: string;
  department?: string | null;
  position?: string | null;
  departmentID?: string | null;
  brand?: string | null; // 🔹 Đã có sẵn cấu trúc
}

const initialState: UserState = {
  name: null,
  avatar: null,
  role: "USER",
  employeeCode: null,
  id: null,
  department: null,
  position: null,
  departmentID: null, // 🛠️ Sửa lỗi thiếu dấu phẩy ở đây
  brand: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // 🔹 Thêm brand và role vào kiểu dữ liệu nhận từ API ở PayloadAction
    setUser: (
      state,
      action: PayloadAction<{
        name: string;
        avatar: string;
        id: string;
        employeeCode: string;
        role: string; // Thêm role
        department?: string;
        position?: string;
        departmentID?: string;
        brand?: string; // Thêm brand vào payload nhận vào
      }>,
    ) => {
      state.name = action.payload.name;
      // Lưu ý: Key trả về từ API login của bạn là `avt`, nếu dispatch nguyên cục data
      // hãy chắc chắn map đúng key: state.avatar = action.payload.avatar || (action.payload as any).avt;
      state.avatar = action.payload.avatar;
      state.id = action.payload.id || null;
      state.employeeCode = action.payload.employeeCode || null;
      state.role = action.payload.role || "USER"; // Cập nhật role khi đăng nhập
      state.department = action.payload.department || null;
      state.position = action.payload.position || null;
      state.departmentID = action.payload.departmentID || null;
      state.brand = action.payload.brand || null; // 🔹 Gán dữ liệu brand thành công!
    },
    setUserAvatar: (state, action: PayloadAction<string>) => {
      state.avatar = action.payload;
    },
    setUserRole: (state, action: PayloadAction<string>) => {
      state.role = action.payload;
    },
    clearUser: (state) => {
      // 🔹 Reset toàn bộ thông tin về trạng thái ban đầu khi logout
      state.id = null;
      state.employeeCode = null;
      state.name = null;
      state.avatar = null;
      state.role = "USER";
      state.department = null;
      state.position = null;
      state.departmentID = null;
      state.brand = null;
    },
  },
});

export const { setUser, clearUser, setUserAvatar, setUserRole } =
  userSlice.actions;
export default userSlice.reducer;
