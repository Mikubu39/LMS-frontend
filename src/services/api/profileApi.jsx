// src/services/api/profileApi.jsx
import http from "@/services/http";

/**
 * Map object profile từ backend -> shape user trong FE (authSlice)
 * profile backend:
 * {
 *   user_id: string;
 *   email: string;
 *   full_name: string;
 *   phone: string | null;
 *   address: string | null;
 *   avatar: string | null;
 *   role: string;
 *   isActive: boolean;
 *   dateOfBirth: string | null; // "YYYY-MM-DD"
 *   gender: string | null;
 * }
 *
 * prevUser: user hiện tại trong Redux (để giữ token, studentCode, ...)
 */
export function mapProfileToUser(profile, prevUser = {}) {
  if (!profile) return prevUser || null;

  return {
    // giữ lại toàn bộ thông tin cũ (token, studentCode, ...),
    // sau đó override bằng dữ liệu profile mới
    ...prevUser,

    id: profile.user_id ?? prevUser.id,
    user_id: profile.user_id ?? prevUser.user_id,

    email: profile.email ?? prevUser.email,
    full_name: profile.full_name ?? prevUser.full_name,
    name: profile.full_name ?? prevUser.name, // nhiều chỗ trong FE đang dùng user.name

    phone: profile.phone ?? prevUser.phone,
    address: profile.address ?? prevUser.address,
    avatar: profile.avatar ?? prevUser.avatar,
    role: profile.role ?? prevUser.role,

    dateOfBirth: profile.dateOfBirth ?? prevUser.dateOfBirth,
    dob: profile.dateOfBirth ?? prevUser.dob, // back-compat nếu chỗ khác dùng user.dob

    gender: profile.gender ?? prevUser.gender,
    isActive: profile.isActive ?? prevUser.isActive,
  };
}

/**
 * Lấy profile của chính mình
 * Backend: GET /users/profile/me
 *
 * getProfile() -> trả về raw profile từ backend
 * getProfile({ mapped: true, prevUser }) -> trả về user đã map sẵn
 */
export async function getProfile(options = {}) {
  const { mapped = false, prevUser } = options;

  const res = await http.get("/users/profile/me");
  const profile = res.data;

  if (mapped) {
    return mapProfileToUser(profile, prevUser);
  }

  return profile;
}

/**
 * Cập nhật thông tin profile
 * Backend: PATCH /users/profile/me
 *
 * payload ví dụ:
 * {
 *   full_name: "Nguyễn Văn C",
 *   phone: "0123456789",
 *   address: "Đà Nẵng",
 *   avatar: "https://example.com/new-avatar.jpg",
 *   dateOfBirth: "1995-05-15",
 *   gender: "female"
 * }
 */
export async function updateProfile(payload) {
  const res = await http.patch("/users/profile/me", payload);
  return res.data; // trả về profile đã update
}

/**
 * Cập nhật avatar khi đã có sẵn URL ảnh (không upload file ở FE nữa)
 *
 * avatarUrl: string (https://...)
 */
export async function updateAvatarUrl(avatarUrl) {
  const res = await http.patch("/users/profile/me", {
    avatar: avatarUrl,
  });

  return {
    profile: res.data, // profile mới
    avatarUrl,         // URL avatar để dùng ngay
  };
}

// Gộp lại cho tiện import:
// import { ProfileApi } from "@/services/api/profileApi.jsx";
export const ProfileApi = {
  getProfile,
  updateProfile,
  updateAvatarUrl,
  mapProfileToUser,
};
