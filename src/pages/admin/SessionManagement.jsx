// ✅ src/pages/admin/SessionManagement.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
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

import { SessionApi } from "@/services/api/sessionApi";

import { CourseApi } from "@/services/api/courseApi.jsx";

const { Option } = Select;

export default function SessionManagement() {
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("all");

  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form] = Form.useForm();

  // 🔹 Load danh sách khóa học (để chọn + filter)
  const fetchCourses = useCallback(async () => {
    try {
      setLoadingCourses(true);

      const res = await CourseApi.getCourses({ page: 1, limit: 100 });

      // Hỗ trợ cả 2 dạng: { courses, meta } hoặc mảng đơn giản
      const courseList = Array.isArray(res)
        ? res
        : res?.courses || res?.data || [];

      const mapped =
        (courseList || []).map((c) => ({
          id: c.id,
          title: c.title,
        })) ?? [];

      setCourses(mapped);
      console.log("📚 [SessionManagement] courses:", mapped);
    } catch (error) {
      console.error("❌ Lỗi khi load courses:", error);
      message.error("Không tải được danh sách khóa học");
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  // 🔹 Load danh sách session
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);

      const list = await SessionApi.getSessions(); // GET /sessions

      const mapped =
        (list || []).map((s, index) => ({
          key: s.id || index,
          id: s.id,
          title: s.title,
          order: s.order ?? index + 1,
          courseId: s.course?.id || s.course_id || s.courseId,
          courseTitle: s.course?.title || s.courseTitle || "—",
          createdAt: s.createdAt,
          raw: s,
        })) ?? [];

      setSessions(mapped);
      console.log("🧩 [SessionManagement] sessions:", mapped);
    } catch (error) {
      console.error("❌ Lỗi khi load sessions:", error);
      message.error("Không tải được danh sách session");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
    fetchSessions();
  }, [fetchCourses, fetchSessions]);

  // 🔹 Lọc session theo khóa học được chọn
  const filteredSessions = useMemo(() => {
    if (!selectedCourseId || selectedCourseId === "all") return sessions;
    return sessions.filter((s) => s.courseId === selectedCourseId);
  }, [sessions, selectedCourseId]);

  // 🔹 Mở modal thêm mới
  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    form.resetFields();

    const initial = { order: 1 };
    if (selectedCourseId && selectedCourseId !== "all") {
      initial.courseId = selectedCourseId;
    }

    form.setFieldsValue(initial);
    setModalVisible(true);
  };

  // 🔹 Mở modal sửa
  const openEditModal = (record) => {
    const s = record.raw;
    setIsEditing(true);
    setEditingId(s.id);

    form.setFieldsValue({
      title: s.title,
      order: s.order ?? 1,
      courseId: s.course?.id || s.course_id || s.courseId,
    });

    setModalVisible(true);
  };

  // 🔹 Submit form (thêm / sửa)
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const body = {
        title: values.title,
        // đảm bảo order là số, đúng DTO @IsNumber()
        order:
          values.order !== undefined && values.order !== null
            ? Number(values.order)
            : undefined,
        courseId: values.courseId,
      };

      if (isEditing && editingId) {
        await SessionApi.updateSession(editingId, body);
        message.success("Cập nhật session thành công");
      } else {
        await SessionApi.createSession(body);
        message.success("Tạo session thành công");
      }

      setModalVisible(false);
      setEditingId(null);
      form.resetFields();
      fetchSessions();
    } catch (error) {
      // lỗi validate của antd
      if (error?.errorFields) return;

      console.error("❌ Lỗi khi lưu session:", error);
      const backendMsg = error?.response?.data?.message;
      const msg =
        (Array.isArray(backendMsg) ? backendMsg.join(", ") : backendMsg) ||
        error?.message ||
        "Lưu session thất bại";
      message.error(msg);
    }
  };

  // 🔹 Xóa session
  const handleDelete = async (id) => {
    try {
      await SessionApi.deleteSession(id);
      message.success("Xóa session thành công");
      fetchSessions();
    } catch (error) {
      console.error("❌ Lỗi khi xóa session:", error);
      const backendMsg = error?.response?.data?.message;
      const msg =
        (Array.isArray(backendMsg) ? backendMsg.join(", ") : backendMsg) ||
        error?.message ||
        "Xóa session thất bại";
      message.error(msg);
    }
  };

  const columns = [
    {
      title: "Thứ tự",
      dataIndex: "order",
      key: "order",
      width: 80,
    },
    {
      title: "Tên session",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Khóa học",
      dataIndex: "courseTitle",
      key: "courseTitle",
      render: (text) => <Tag>{text || "—"}</Tag>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value) =>
        value ? new Date(value).toLocaleString("vi-VN") : "—",
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
            title="Bạn chắc chắn muốn xóa session này?"
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

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <h2 style={{ marginBottom: 0 }}>Quản lý session</h2>

          {/* Filter theo khóa học */}
          <Select
            value={selectedCourseId}
            onChange={setSelectedCourseId}
            style={{ minWidth: 260 }}
            loading={loadingCourses}
          >
            <Option value="all">Tất cả khóa học</Option>
            {courses.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.title}
              </Option>
            ))}
          </Select>
        </div>

        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          Thêm session
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredSessions}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={isEditing ? "Cập nhật session" : "Thêm session mới"}
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
            label="Tiêu đề session"
            name="title"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input placeholder="VD: Chương 1: Bắt đầu với NestJS" />
          </Form.Item>

          <Form.Item
            label="Thứ tự hiển thị"
            name="order"
            rules={[{ required: true, message: "Vui lòng nhập thứ tự" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Thuộc khóa học"
            name="courseId"
            rules={[{ required: true, message: "Vui lòng chọn khóa học" }]}
          >
            <Select
              placeholder="Chọn khóa học"
              loading={loadingCourses}
              optionFilterProp="children"
              showSearch
            >
              {courses.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
