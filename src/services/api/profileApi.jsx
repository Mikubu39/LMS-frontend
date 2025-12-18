// src/services/api/profileApi.jsx
import http from "@/services/http";

/**
 * Map object profile từ backend -> shape user trong FE
 */
export function mapProfileToUser(profile, prevUser = {}) {
  if (!profile) return prevUser || null;

  return {
    ...prevUser,
    id: profile.user_id ?? prevUser.id,
    user_id: profile.user_id ?? prevUser.user_id,
    email: profile.email ?? prevUser.email,
    full_name: profile.full_name ?? prevUser.full_name,
    name: profile.full_name ?? prevUser.name,
    phone: profile.phone ?? prevUser.phone,
    address: profile.address ?? prevUser.address,
    avatar: profile.avatar ?? prevUser.avatar,
    role: profile.role ?? prevUser.role,
    dateOfBirth: profile.dateOfBirth ?? prevUser.dateOfBirth,
    dob: profile.dateOfBirth ?? prevUser.dob,
    gender: profile.gender ?? prevUser.gender,
    isActive: profile.isActive ?? prevUser.isActive,
    student_code: profile.student_code ?? prevUser.student_code,
  };
}

/**
 * Lấy profile của chính mình
 * Backend: GET /users/profile/me
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
 */
export async function updateProfile(payload) {
  const res = await http.patch("/users/profile/me", payload);
  return res.data;
}

/**
 * Cập nhật avatar khi đã có sẵn URL ảnh
 */
export async function updateAvatarUrl(avatarUrl) {
  const res = await http.patch("/users/profile/me", {
    avatar: avatarUrl,
  });
  return {
    profile: res.data,
    avatarUrl,
  };
}

/**
 * 🟢 ĐỔI MẬT KHẨU
 * Backend: PATCH /users/profile/password
 * Body: { oldPassword, newPassword }
 */
export async function changePassword(body) {
  try {
    const res = await http.patch("/users/profile/password", body);
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi đổi mật khẩu:", error);
    // Ném lỗi ra để component Profile.jsx bắt được và hiển thị
    const msg = error?.response?.data?.message || "Đổi mật khẩu thất bại";
    throw new Error(msg);
  }
}

// Export default object
export const ProfileApi = {
  getProfile,
  updateProfile,
  updateAvatarUrl,
  changePassword, // 👈 Đã thêm vào đây
  mapProfileToUser,
};