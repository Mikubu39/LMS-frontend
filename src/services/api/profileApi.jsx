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
 * Backend (gợi ý): PATCH /users/profile/me
 *
 * payload ví dụ (từ Profile.jsx):
 * {
 *   full_name,
 *   phone,
 *   email,
 *   dateOfBirth,
 * }
 */
export async function updateProfile(payload) {
  const res = await http.patch("/users/profile/me", payload);
  return res.data; // trả về profile đã update
}

/**
 * Upload avatar + cập nhật profile
 *
 * Logic:
 * 1. POST file lên endpoint upload (trả về URL ảnh)
 * 2. PATCH /users/profile/me { avatar: url }
 *
 * ✅ LƯU Ý: tuỳ backend của bạn, hãy chỉnh lại đường dẫn upload:
 *    - "/upload/avatar"   (ví dụ)
 *    - hoặc "/files/upload"
 *    - hoặc "/cloudinary/upload"
 */
export async function uploadAvatarAndUpdateProfile(file) {
  const formData = new FormData();
  formData.append("file", file);

  // 1) Upload file để lấy URL ảnh
  const uploadRes = await http.post("/upload/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  // tuỳ backend, field có thể là: url | secure_url | avatar | ...
  const data = uploadRes.data;
  const imageUrl =
    data?.url || data?.secure_url || data?.avatar || data?.imageUrl || data;

  if (!imageUrl) {
    throw new Error("Không lấy được URL ảnh từ API upload.");
  }

  // 2) Cập nhật profile với avatar mới
  const profileRes = await http.patch("/users/profile/me", {
    avatar: imageUrl,
  });

  return {
    profile: profileRes.data, // object profile mới
    avatarUrl: imageUrl,      // URL ảnh để dùng ngay nếu cần
  };
}

// Gộp lại cho tiện import kiểu:
// import { ProfileApi } from "@/services/api/profileApi.jsx";
export const ProfileApi = {
  getProfile,
  updateProfile,
  uploadAvatarAndUpdateProfile,
  mapProfileToUser,
};
