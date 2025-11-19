// ✅ src/pages/admin/CourseManagement.jsx
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
  Popconfirm,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { CourseApi } from "@/services/api/courseApi.jsx";

const { Option } = Select;

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // 🔹 Lấy danh sách khóa học từ API
  const fetchCourses = useCallback(
    async (page = 1, limit = 10) => {
      try {
        setLoading(true);
        const { courses, meta } = await CourseApi.getCourses({ page, limit });

        // Map dữ liệu về format table
        const mapped = (courses || []).map((c, index) => ({
          key: c.id || index,
          id: c.id,
          code: c.code || (c.id ? c.id.slice(0, 8).toUpperCase() : `C${index+1}`),
          name: c.title,
          teacher:
            c.instructor?.full_name ||
            c.instructor?.name ||
            c.instructorName ||
            "—",
          status: c.status || "Đang mở", // tạm fix, backend sau này có trường status thì map lại
          sessionCount:
            c.sessions?.length ??
            c.sessionCount ??
            0,
          raw: c,
        }));

        setCourses(mapped);
        setPagination({
          current: meta.page || page,
          pageSize: meta.limit || limit,
          total: meta.total || mapped.length,
        });
      } catch (error) {
        console.error("❌ Lỗi khi tải danh sách khóa học:", error);
        message.error("Không tải được danh sách khóa học");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchCourses(1, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔹 Submit form thêm / sửa
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
        // Update
        await CourseApi.updateCourse(editingId, body);
        message.success("Cập nhật khóa học thành công");
      } else {
        // Create
        await CourseApi.createCourse(body);
        message.success("Tạo khóa học thành công");
      }

      setModalVisible(false);
      setEditingId(null);
      form.resetFields();
      fetchCourses(pagination.current, pagination.pageSize);
    } catch (error) {
      // Nếu error từ validateFields thì bỏ qua
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

  // 🔹 Xóa khóa học
  const handleDelete = async (id) => {
    try {
      await CourseApi.deleteCourse(id);
      message.success("Xóa khóa học thành công");
      fetchCourses(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("❌ Lỗi khi xóa khóa học:", error);
      const backendMsg = error?.response?.data?.message;
      const msg =
        (Array.isArray(backendMsg) ? backendMsg.join(", ") : backendMsg) ||
        error?.message ||
        "Xóa khóa học thất bại";
      message.error(msg);
    }
  };

  // 🔹 Mở modal thêm mới
  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 🔹 Mở modal sửa
  const openEditModal = (record) => {
    const c = record.raw;
    setIsEditing(true);
    setEditingId(c.id);
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
      title: "Mã khóa học",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Tên khóa học",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Giảng viên",
      dataIndex: "teacher",
      key: "teacher",
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
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn chắc chắn muốn xóa khóa học này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleTableChange = (pager) => {
    fetchCourses(pager.current, pager.pageSize);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Quản lý khóa học</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
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
          form.resetFields();
        }}
        okText={isEditing ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        destroyOnClose
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
            label="Thumbnail URL"
            name="thumbnail"
            rules={[{ required: true, message: "Vui lòng nhập URL thumbnail" }]}
          >
            <Input placeholder="https://example.com/thumbnail.jpg" />
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
