// src/services/api/uploadApi.jsx
import http from "@/services/http";

/**
 * Upload 1 file ảnh lên server
 * Backend: POST /upload/image
 * Body: multipart/form-data, field name: "image"
 * Response:
 * {
 *   "secure_url": "...",
 *   "public_id": "..."
 * }
 */
export async function uploadImage(file) {
  const formData = new FormData();
  // tên field phải trùng với bên backend multer.single("image")
  formData.append("image", file);

  const res = await http.post("/upload/image", formData, {
    headers: {
      // ⚠️ Ghi đè Content-Type mặc định "application/json"
      "Content-Type": "multipart/form-data",
      Accept: "application/json",
    },
    // Nếu backend dùng cookie (session) thì bật thêm:
    // withCredentials: true,
  });

  return res.data; // { secure_url, public_id }
}
