// src/pages/admin/LessonManagement.jsx
import { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import { LessonApi } from "@/services/api/lessonApi";
import { SessionApi } from "@/services/api/sessionApi";

const { Option } = Select;

// 👉 defaultType dùng cho route /admin/lessons/video | text | quiz
//    và phải trùng enum bên backend: "Video" | "Text" | "Quiz"
function LessonManagement({ defaultType = undefined }) {
  const [lessons, setLessons] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("all"); // lọc theo session

  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form] = Form.useForm();

  // ====== LOAD SESSIONS ======
  const fetchSessions = useCallback(async () => {
    try {
      const data = await SessionApi.getAllSessions(); // GET /sessions
      console.log("📚 [LessonManagement] sessions:", data);
      setSessions(data || []);
    } catch (error) {
      console.error("❌ Lỗi load sessions:", error);
      message.error("Không tải được danh sách session");
    }
  }, []);

  // ====== LOAD LESSONS ======
  const fetchLessons = useCallback(async () => {
    try {
      setLoading(true);
      const data = await LessonApi.getAllLessons(); // GET /lessons
      console.log("🧩 [LessonManagement] lessons:", data);
      setLessons(data || []);
    } catch (error) {
      console.error("❌ Lỗi load lessons:", error);
      message.error("Không tải được danh sách lesson");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    fetchLessons();
  }, [fetchSessions, fetchLessons]);

  // ====== MỞ MODAL THÊM ======
  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setModalVisible(true);

    // Đợi Form connect xong rồi mới setFieldsValue -> tránh warning useForm
    setTimeout(() => {
      form.setFieldsValue({
        title: "",
        duration: 15,
        order: 1,
        // ❗ type default phải là 1 trong: "Video" | "Text" | "Quiz"
        type: defaultType || "Video",
        sessionId:
          selectedSessionId && selectedSessionId !== "all"
            ? selectedSessionId
            : undefined,
      });
    }, 0);
  };

  // ====== MỞ MODAL SỬA ======
  const openEditModal = (record) => {
    setIsEditing(true);
    setEditingId(record.id);
    setModalVisible(true);

    setTimeout(() => {
      form.setFieldsValue({
        title: record.title,
        duration: record.duration ?? 15,
        order: record.order ?? 1,
        type: record.type || "Video",
        sessionId: record.session?.id || record.sessionId,
      });
    }, 0);
  };

  // ====== SUBMIT FORM (CREATE / UPDATE) ======
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const body = {
        title: values.title,
        duration:
          values.duration !== undefined && values.duration !== null
            ? Number(values.duration)
            : undefined,
        order:
          values.order !== undefined && values.order !== null
            ? Number(values.order)
            : undefined,
        // ❗ Gửi đúng enum BE: "Video" | "Text" | "Quiz"
        type: values.type,
        sessionId: values.sessionId, // đúng CreateLessonDto
      };

      console.log("📤 [Lesson] body gửi lên:", body);

      if (isEditing && editingId) {
        await LessonApi.updateLesson(editingId, body);
        message.success("Cập nhật lesson thành công");
      } else {
        await LessonApi.createLesson(body);
        message.success("Tạo lesson thành công");
      }

      setModalVisible(false);
      setEditingId(null);
      form.resetFields();
      fetchLessons();
    } catch (error) {
      if (error?.errorFields) return; // lỗi validate form

      console.error("❌ Lỗi lưu lesson:", error?.response?.data || error);

      const backendMsg = error?.response?.data?.message;
      const msg = Array.isArray(backendMsg)
        ? backendMsg.join(", ")
        : backendMsg || error?.message || "Lưu lesson thất bại";

      message.error(msg);
    }
  };

  // ====== XOÁ LESSON ======
  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Xoá lesson",
      content: "Bạn có chắc muốn xoá bài học này?",
      okText: "Xoá",
      okType: "danger",
      cancelText: "Hủy",
      async onOk() {
        try {
          await LessonApi.deleteLesson(id);
          message.success("Xoá lesson thành công");
          fetchLessons();
        } catch (error) {
          console.error("❌ Lỗi xoá lesson:", error);
          const backendMsg = error?.response?.data?.message;
          const msg = Array.isArray(backendMsg)
            ? backendMsg.join(", ")
            : backendMsg || "Xoá lesson thất bại";
          message.error(msg);
        }
      },
    });
  };

  // ====== CỘT TABLE ======
  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        let color = "blue";
        if (type === "Quiz") color = "volcano";
        if (type === "Text") color = "purple";
        if (type === "Video") color = "geekblue";
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: "Thời lượng (phút)",
      dataIndex: "duration",
      key: "duration",
      render: (d) => d ?? "-",
    },
    {
      title: "Thứ tự",
      dataIndex: "order",
      key: "order",
      render: (o) => o ?? "-",
    },
    {
      title: "Session",
      key: "sessionTitle",
      render: (_, record) => record.session?.title || "-",
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
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Xoá
          </Button>
        </Space>
      ),
    },
  ];

  // ====== FILTER LESSONS THEO defaultType + SESSION ======
  const filteredLessons = lessons.filter((l) => {
    // filter theo type nếu có defaultType (VD: /admin/lessons/video)
    if (defaultType && l.type !== defaultType) return false;

    // filter theo session nếu đã chọn
    if (selectedSessionId && selectedSessionId !== "all") {
      const sid = l.session?.id || l.sessionId;
      if (sid !== selectedSessionId) return false;
    }

    return true;
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <h2 style={{ marginBottom: 0 }}>Quản lý lesson</h2>

          {/* 🔹 Chọn session để lọc lesson */}
          <Select
            value={selectedSessionId}
            onChange={setSelectedSessionId}
            style={{ minWidth: 260 }}
            placeholder="Lọc theo session"
          >
            <Option value="all">Tất cả session</Option>
            {sessions.map((s) => (
              <Option key={s.id} value={s.id}>
                {s.title}
              </Option>
            ))}
          </Select>
        </div>

        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          Thêm lesson
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredLessons}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={isEditing ? "Cập nhật lesson" : "Thêm lesson mới"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          setEditingId(null);
          form.resetFields();
        }}
        okText={isEditing ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        forceRender // đảm bảo Form luôn connect với form instance
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input placeholder="Nhập tiêu đề bài học" />
          </Form.Item>

          <Form.Item label="Thời lượng (phút)" name="duration">
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              placeholder="Ví dụ: 15"
            />
          </Form.Item>

          <Form.Item label="Thứ tự" name="order">
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              placeholder="Ví dụ: 1"
            />
          </Form.Item>

          <Form.Item label="Loại bài học" name="type">
            <Select placeholder="Chọn loại bài học">
              {/* ✅ Khớp enum LessonType bên backend */}
              <Option value="Video">Video</Option>
              <Option value="Text">Text (nội dung / bài đọc)</Option>
              <Option value="Quiz">Quiz</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Thuộc session"
            name="sessionId"
            rules={[{ required: true, message: "Vui lòng chọn session" }]}
          >
            <Select placeholder="Chọn session">
              {sessions.map((s) => (
                <Option key={s.id} value={s.id}>
                  {s.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

LessonManagement.propTypes = {
  defaultType: PropTypes.string, // "Video" | "Text" | "Quiz"
};

export default LessonManagement;
