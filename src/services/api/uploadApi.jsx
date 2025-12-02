import http from "@/services/http";

/**
 * Upload 1 file ảnh lên server
 * Backend: POST /upload/image
 * Body: multipart/form-data, field name: "file"
 */
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  // http instance này đã bao gồm Interceptor để gắn Token JWT
  const res = await http.post("/upload/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  // Trả về { secure_url, public_id }
  return res.data; 
}

export async function uploadImages(files) {
  const formData = new FormData();
  // files có thể là FileList hoặc mảng File
  const fileArray = Array.from(files);
  
  fileArray.forEach((file) => {
    formData.append("files", file);
  });

  const res = await http.post("/upload/images", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}

export async function deleteImage(publicId) {
  const res = await http.delete("/upload/image", {
    data: { public_id: publicId },
  });
  return res.data;
}

export const UploadApi = {
  uploadImage,
  uploadImages,
  deleteImage,
};