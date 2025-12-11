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
import { useDispatch, useSelector } from "react-redux";
import { setUser, selectUser } from "@/redux/authSlice";

// 🟢 ĐÃ SỬA: Import ProfileApi thay vì UserApi
import { ProfileApi } from "@/services/api/profileApi";
import { UploadApi } from "@/services/api/uploadApi";

export default function AdminProfile() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  
  // Lấy user hiện tại từ Redux làm fallback
  const currentUser = useSelector(selectUser);

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // 1. Load dữ liệu MỚI NHẤT từ API khi vào trang
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setFetching(true);
        // Gọi API lấy thông tin profile của chính mình
        const data = await ProfileApi.getProfile({ mapped: true, prevUser: currentUser });
        
        // Cập nhật Redux ngay để header/sidebar hiển thị đúng
        dispatch(setUser(data));
        
        // Map dữ liệu vào form
        // Lưu ý: data.full_name là từ backend, form dùng name="fullName"
        form.setFieldsValue({
          fullName: data.full_name || data.name || "", 
          email: data.email || "",
          phone: data.phone || "",
        });

        setAvatarUrl(data.avatar);
      } catch (error) {
        console.error("Lỗi lấy profile:", error);
        message.error("Không tải được thông tin cá nhân");
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, dispatch]); 

  // 2. Xử lý Upload ảnh (Giữ nguyên logic cũ nhưng thêm thông báo)
  const handleCustomUpload = async ({ file, onSuccess, onError }) => {
    setUploading(true);
    try {
      const res = await UploadApi.uploadImage(file);
      const newImageUrl = res.secure_url || res.url || res.data?.url;

      if (newImageUrl) {
        setAvatarUrl(newImageUrl);
        message.success("Tải ảnh xong! Nhấn 'Lưu thay đổi' để cập nhật.");
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

  // 3. Xử lý Lưu thay đổi (Dùng ProfileApi.updateProfile)
  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      // Chuẩn bị payload đúng format backend yêu cầu
      const payload = {
        full_name: values.fullName, // Backend cần 'full_name'
        phone: values.phone,
        avatar: avatarUrl,
      };

      console.log("Payload gửi đi:", payload);

      // Gọi API update profile của chính mình
      const updatedRawProfile = await ProfileApi.updateProfile(payload);

      message.success("Cập nhật hồ sơ thành công!");

      // Map lại dữ liệu backend trả về để update Redux
      const mappedUser = ProfileApi.mapProfileToUser(updatedRawProfile, currentUser);

      // Cập nhật Redux & LocalStorage
      dispatch(setUser(mappedUser));

    } catch (error) {
      console.error("Update Error:", error);
      const msg = error.response?.data?.message;
      if (Array.isArray(msg)) {
        message.error(msg.join(", "));
      } else {
        message.error(msg || "Lỗi khi lưu dữ liệu");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Spin size="large" tip="Đang tải thông tin..." />
      </div>
    );
  }

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
            <h3 style={{ marginTop: 16 }}>
              {form.getFieldValue("fullName") || currentUser?.name || "User"}
            </h3>
            <p style={{ color: "#888" }}>{currentUser?.email}</p>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card title="Thông tin cá nhân">
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