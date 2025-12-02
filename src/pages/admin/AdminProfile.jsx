// src/pages/admin/AdminProfile.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Avatar,
  Button,
  Form,
  Input,
  Row,
  Col,
  Upload,
  message,
  Spin,
} from "antd";
import {
  UserOutlined,
  CameraOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/authSlice";

import { UploadApi } from "@/services/api/uploadApi";
import { UserApi } from "@/services/api/userApi";

export default function AdminProfile() {
  // 1. Khởi tạo instance form
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 2. Load dữ liệu khi vào trang
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const currentUser = JSON.parse(storedUser);
        setUserId(currentUser.id);
        setAvatarUrl(currentUser.avatar);

        // Map dữ liệu vào form
        form.setFieldsValue({
          fullName: currentUser.fullName || currentUser.name || "",
          email: currentUser.email || "",
          phone: currentUser.phone || "",
        });
      }
    } catch (err) {
      console.error("Lỗi parse user:", err);
    }
  }, [form]);

  // 3. Xử lý Upload ảnh (Đã hoạt động tốt)
  const handleCustomUpload = async ({ file, onSuccess, onError }) => {
    setUploading(true);
    try {
      const res = await UploadApi.uploadImage(file);
      const newImageUrl = res.secure_url || res.url || res.data?.url;

      if (newImageUrl) {
        setAvatarUrl(newImageUrl);
        message.success("Tải ảnh thành công!");
        onSuccess("ok");
      } else {
        throw new Error("Không lấy được link ảnh từ API");
      }
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Lỗi upload ảnh.");
      onError(error);
    } finally {
      setUploading(false);
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) return Upload.LIST_IGNORE;
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Ảnh phải < 5MB!");
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  // 4. Xử lý Lưu thay đổi (FIX LỖI 400 TẠI ĐÂY)
  const handleUpdate = async (values) => {
    if (!userId) {
      message.error("Vui lòng đăng nhập lại.");
      return;
    }

    // ⚠️ QUAN TRỌNG: Chỉ lấy đúng các trường Backend cần.
    // Không dùng "...values" vì nó sẽ kèm theo "fullName" gây lỗi 400.
    const cleanPayload = {
      name: values.fullName, // Map từ field 'fullName' của form sang 'name' của DB
      phone: values.phone,
      avatar: avatarUrl,
    };

    console.log("Payload gửi đi:", cleanPayload); // Debug xem gửi gì

    setLoading(true);
    try {
      // Gọi API PATCH
      await UserApi.update(userId, cleanPayload);
      
      message.success("Cập nhật thành công!");

      // Cập nhật Redux & LocalStorage để Header đổi ngay
      const oldUser = JSON.parse(localStorage.getItem("user")) || {};
      const newUser = {
        ...oldUser,
        ...cleanPayload,
        fullName: values.fullName, // Giữ field này cho frontend dùng
      };

      localStorage.setItem("user", JSON.stringify(newUser));
      dispatch(setUser(newUser));

    } catch (error) {
      console.error("Update Error:", error);
      // Hiển thị lỗi chi tiết từ Backend trả về
      const msg = error.response?.data?.message;
      if (Array.isArray(msg)) {
        message.error(msg.join(", ")); // VD: "phone must be a number string"
      } else {
        message.error(msg || "Lỗi khi lưu dữ liệu (400)");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card style={{ textAlign: "center" }}>
            <Upload
              name="file"
              showUploadList={false}
              customRequest={handleCustomUpload}
              beforeUpload={beforeUpload}
              accept="image/*"
            >
              <div style={{ cursor: "pointer", position: "relative", display: "inline-block" }}>
                {uploading ? (
                  <div style={{ width: 100, height: 100, borderRadius: "50%", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                  </div>
                ) : (
                  <Avatar size={100} src={avatarUrl} icon={<UserOutlined />} />
                )}
                <div style={{ position: "absolute", bottom: 0, right: 0, background: "#1890ff", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid white" }}>
                  <CameraOutlined style={{ color: "#fff" }} />
                </div>
              </div>
            </Upload>
            <h3 style={{ marginTop: 16 }}>{form.getFieldValue("fullName") || "Admin"}</h3>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card title="Thông tin cá nhân">
            {/* ✅ Đã thêm prop form={form} để fix warning */}
            <Form 
              layout="vertical" 
              form={form} 
              onFinish={handleUpdate}
            >
              <Form.Item
                label="Họ và tên"
                name="fullName"
                rules={[{ required: true, message: "Nhập họ tên" }]}
              >
                <Input placeholder="Nhập họ tên" />
              </Form.Item>

              <Form.Item label="Email" name="email">
                <Input disabled />
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[{ pattern: /^[0-9]+$/, message: "SĐT chỉ chứa số" }]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>

              <div style={{ textAlign: "right" }}>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Lưu thay đổi
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}