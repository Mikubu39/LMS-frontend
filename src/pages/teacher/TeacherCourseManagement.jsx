// src/pages/teacher/TeacherCourseManagement.jsx

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Upload,
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { CourseApi } from "@/services/api/courseApi.jsx";
import { SessionApi } from "@/services/api/sessionApi.jsx";
import { uploadImage } from "@/services/api/uploadApi.jsx";

const { Option } = Select;

export default function TeacherCourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  // 👇 State cho việc upload ảnh
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [modalVisible, setModalVisible] = useState(false);
  // isEditing và editingId hiện tại chỉ dùng cho logic form (nếu sau này bạn muốn thêm nút Sửa ở chỗ khác)
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const navigate = useNavigate();

  // 🔹 Lấy danh sách khóa học
  const fetchCourses = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);

      const [courseRes, sessionData] = await Promise.all([
        CourseApi.getCourses({ page, limit }),
        SessionApi.getSessions(),
      ]);

      const { courses, meta } = courseRes;

      let allSessions = [];
      if (Array.isArray(sessionData)) allSessions = sessionData;
      else if (Array.isArray(sessionData?.data))
        allSessions = sessionData.data;

      const mapped = (courses || []).map((c, index) => {
        const count = allSessions.filter(
          (s) => (s.courseId === c.id) || (s.course && s.course.id === c.id)
        ).length;

        return {
          key: c.id || index,
          id: c.id,
          name: c.title,
          status: c.status || "Đang mở",
          sessionCount: count,
          raw: c,
        };
      });

      setCourses(mapped);
      setPagination({
        current: meta.page || page,
        pageSize: meta.limit || limit,
        total: meta.total || mapped.length,
      });
    } catch (error) {
      console.error("❌ Lỗi khi tải dữ liệu:", error);
      message.error("Không tải được danh sách khóa học");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses(1, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 👇 Xử lý logic Upload ảnh
  const handleUpload = async (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      message.error('Chỉ chấp nhận định dạng ảnh JPG, PNG hoặc WEBP!');
      return Upload.LIST_IGNORE;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Ảnh phải nhỏ hơn 5MB!');
      return Upload.LIST_IGNORE;
    }

    try {
      setUploading(true);
      const data = await uploadImage(file);
      
      const url = data.secure_url;
      setImageUrl(url);
      form.setFieldsValue({ thumbnail: url });
      message.success("Upload ảnh thành công!");
    } catch (error) {
      console.error("Upload error:", error);
      const backendMsg = error?.response?.data?.message;
      if (backendMsg) {
         const msgToShow = Array.isArray(backendMsg) ? backendMsg[0] : backendMsg;
         message.error(`Lỗi từ server: ${msgToShow}`);
      } else {
         message.error("Upload thất bại, vui lòng thử lại!");
      }
    } finally {
      setUploading(false);
    }
    
    return false;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const body = {
        title: values.title,
        description: values.description,
        price: values.price,
        thumbnail: values.thumbnail,
        level: values.level,
      };

      if (isEditing && editingId) {
        await CourseApi.updateCourse(editingId, body);
        message.success("Cập nhật khóa học thành công");
      } else {
        await CourseApi.createCourse(body);
        message.success("Tạo khóa học thành công");
      }

      setModalVisible(false);
      setEditingId(null);
      setImageUrl(null);
      form.resetFields();
      fetchCourses(pagination.current, pagination.pageSize);
    } catch (error) {
      if (error?.errorFields) return;

      console.error("❌ Lỗi khi lưu khóa học:", error);
      const backendMsg = error?.response?.data?.message;
      const msg =
        (Array.isArray(backendMsg) ? backendMsg.join(", ") : backendMsg) ||
        error?.message ||
        "Lưu khóa học thất bại";
      message.error(msg);
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setImageUrl(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 🟢 Hàm này hiện tại không được gọi từ bảng nữa vì đã bỏ nút Sửa
  // Giữ lại nếu sau này bạn muốn kích hoạt sửa từ nút khác
  const openEditModal = (record) => {
    const c = record.raw;
    setIsEditing(true);
    setEditingId(c.id);
    setImageUrl(c.thumbnail);
    form.setFieldsValue({
      title: c.title,
      description: c.description,
      price: parseFloat(c.price || 0),
      thumbnail: c.thumbnail,
      level: c.level || "Beginner",
    });
    setModalVisible(true);
  };

  const columns = [
    {
      title: "Tên khóa học",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          {record.raw.thumbnail && (
            <img 
              src={record.raw.thumbnail} 
              alt="thumb" 
              style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} 
            />
          )}
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color = status === "Đang mở" ? "green" : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Số session",
      dataIndex: "sessionCount",
      key: "sessionCount",
      align: "center",
    },
    {
      title: "Nội dung",
      key: "manage",
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          onClick={() => navigate(`/teacher/courses/${record.id}/manage`)}
        >
          Chi tiết
        </Button>
      ),
    },
    // ❌ ĐÃ XÓA CỘT HÀNH ĐỘNG
  ];

  const handleTableChange = (pager) => {
    fetchCourses(pager.current, pager.pageSize);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Khóa học của tôi</h2> 
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreateModal}
        >
          Thêm khóa học
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={courses}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      <Modal
        title={isEditing ? "Cập nhật khóa học" : "Thêm khóa học mới"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          setEditingId(null);
          setImageUrl(null);
          form.resetFields();
        }}
        okText={isEditing ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tiêu đề khóa học"
            name="title"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input placeholder="VD: Lập trình JS từ A đến Z" />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea rows={4} placeholder="Mô tả ngắn gọn về khóa học" />
          </Form.Item>

          <Form.Item
            label="Giá (VND)"
            name="price"
            rules={[{ required: true, message: "Vui lòng nhập giá" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              step={1000}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item
            label="Thumbnail"
            name="thumbnail"
            rules={[
              { required: true, message: "Vui lòng upload thumbnail" },
            ]}
          >
            <Input style={{ display: 'none' }} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div 
                style={{
                  width: '100%',
                  height: '200px',
                  border: '1px dashed #d9d9d9',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#fafafa',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="thumbnail-preview"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <span style={{ color: '#999' }}>Chưa có ảnh</span>
                )}
              </div>

              <Upload
                name="thumbnail_file"
                showUploadList={false}
                beforeUpload={handleUpload}
                accept="image/*"
              >
                <Button 
                  icon={<UploadOutlined />} 
                  loading={uploading}
                  style={{ width: '100%' }}
                >
                  {imageUrl ? "Đổi ảnh khác" : "Chọn ảnh Thumbnail"}
                </Button>
              </Upload>
            </div>
          </Form.Item>

          <Form.Item
            label="Trình độ"
            name="level"
            rules={[{ required: true, message: "Vui lòng chọn trình độ" }]}
            initialValue="Beginner"
          >
            <Select>
              <Option value="Beginner">Beginner</Option>
              <Option value="Intermediate">Intermediate</Option>
              <Option value="Advanced">Advanced</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}