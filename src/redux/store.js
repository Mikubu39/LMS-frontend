// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

// 🔹 Khởi tạo store
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// 🔹 Re-export mọi thứ từ authSlice
//    => dùng ở nơi khác: import { setUser, logout, selectIsAuthenticated } from "@/redux/store";
export * from "./authSlice";

// 🔹 Default export để import kiểu: import store from "@/redux/store";
export default store;
