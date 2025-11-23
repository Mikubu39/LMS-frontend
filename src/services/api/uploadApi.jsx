// src/services/api/uploadApi.jsx
import http from "@/services/http";

/**
 * Backend UploadController:
 *
 * @Post('image')
 *  - URL:    POST /upload/image
 *  - Field:  "file"
 *
 * @Post('images')
 *  - URL:    POST /upload/images
 *  - Field:  "files" (array)
 *
 * @Delete('image')
 *  - URL:    DELETE /upload/image
 *  - Body:   { public_id: string }
 *
 * Response (tuỳ UploadService, thường kiểu Cloudinary):
 *  {
 *    url?: string;
 *    secure_url?: string;
 *    public_id?: string;
 *    ...
 *  }
 */

/**
 * Upload 1 file ảnh lên server
 * Backend: POST /upload/image
 * Body: multipart/form-data, field name: "file"
 */
export async function uploadImage(file) {
  const formData = new FormData();
  // ⚠️ TÊN FIELD PHẢI TRÙNG VỚI FileInterceptor('file')
  formData.append("file", file);

  const res = await http.post("/upload/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Accept: "application/json",
    },
  });

  return res.data; // ví dụ: { secure_url, public_id, ... }
}

/**
 * Upload nhiều ảnh (tối đa 10 file)
 * Backend: POST /upload/images
 * Body: multipart/form-data, field name: "files" (array)
 */
export async function uploadImages(files) {
  const formData = new FormData();

  // 'files' trùng với FilesInterceptor('files', 10)
  files.forEach((file) => {
    formData.append("files", file);
  });

  const res = await http.post("/upload/images", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Accept: "application/json",
    },
  });

  return res.data; // thường là mảng [{ secure_url, public_id }, ...]
}

/**
 * Xoá 1 ảnh theo public_id trên Cloudinary
 * Backend: DELETE /upload/image
 * Body: { public_id: string }
 */
export async function deleteImage(publicId) {
  const res = await http.delete("/upload/image", {
    data: { public_id: publicId },
  });

  return res.data;
}

// Gộp lại cho tiện import
export const UploadApi = {
  uploadImage,
  uploadImages,
  deleteImage,
};
