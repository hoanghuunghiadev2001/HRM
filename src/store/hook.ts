import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./index";

// Sử dụng thay cho `useDispatch` thông thường để có gợi ý kiểu
export const useAppDispatch: () => AppDispatch = useDispatch;

// Sử dụng thay cho `useSelector` thông thường để có gợi ý kiểu
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
