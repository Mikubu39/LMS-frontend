// ✅ src/pages/admin/CourseManager.jsx
import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Input, Select, List, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

import { CourseApi } from "@/services/api/courseApi.jsx";
import { SessionApi } from "@/services/api/sessionApi.jsx";

import "@/css/course-manager.css";

const { Option } = Select;

const LESSON_TYPES = [
  { key: "video", label: "Video" },
  { key: "reading", label: "Bài đọc" },
  { key: "quiz", label: "Bài kiểm tra" },
  { key: "flashcard", label: "Thẻ ghi nhớ" },
  { key: "pdf", label: "Tài liệu PDF" },
  { key: "audio", label: "Audio" },
];

export default function CourseManager() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionTitle, setSessionTitle] = useState("");
  const [requiredType, setRequiredType] = useState("none");
  const [saving, setSaving] = useState(false);

  // ===== LOAD COURSE =====
  const fetchCourse = useCallback(async () => {
    try {
      const data = await CourseApi.getCourseById(courseId);
      setCourse(data);
    } catch (err) {
      console.error("❌ Lỗi load course:", err);
      message.error("Không tải được thông tin khóa học");
    }
  }, [courseId]);

  // ===== LOAD SESSIONS THEO COURSE =====
  const fetchSessions = useCallback(async () => {
    try {
      let data = [];
      if (SessionApi.getSessionsByCourse) {
        data = await SessionApi.getSessionsByCourse(courseId);
      } else {
        const all = await SessionApi.getAllSessions();
        data =
          all?.filter(
            (s) => s.course?.id === courseId || s.courseId === courseId
          ) || [];
      }

      setSessions(data || []);

      if (data && data.length > 0) {
        const first = data[0];
        setSelectedSession(first);
        setSessionTitle(first.title || "");
        setRequiredType(first.requiredType || "none");
      } else {
        setSelectedSession(null);
        setSessionTitle("");
        setRequiredType("none");
      }
    } catch (err) {
      console.error("❌ Lỗi load sessions:", err);
      message.error("Không tải được danh sách chương");
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
    fetchSessions();
  }, [fetchCourse, fetchSessions]);

  const handleSelectSession = (session) => {
    setSelectedSession(session);
    setSessionTitle(session.title || "");
    setRequiredType(session.requiredType || "none");
  };

  // ===== CẬP NHẬT SESSION HIỆN TẠI =====
  const handleUpdateSession = async () => {
    if (!selectedSession) return;
    try {
      setSaving(true);
      await SessionApi.updateSession(selectedSession.id, {
        title: sessionTitle,
        requiredType,
      });
      message.success("Cập nhật chương thành công");
      fetchSessions();
    } catch (err) {
      console.error("❌ Lỗi cập nhật chương:", err);
      const backendMsg = err?.response?.data?.message;
      const msg = Array.isArray(backendMsg)
        ? backendMsg.join(", ")
        : backendMsg || err?.message || "Cập nhật chương thất bại";
      message.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ===== XOÁ SESSION HIỆN TẠI =====
  const handleDeleteSession = async () => {
    if (!selectedSession) return;
    try {
      await SessionApi.deleteSession(selectedSession.id);
      message.success("Xoá chương thành công");
      setSelectedSession(null);
      setSessionTitle("");
      setRequiredType("none");
      fetchSessions();
    } catch (err) {
      console.error("❌ Lỗi xoá chương:", err);
      const backendMsg = err?.response?.data?.message;
      const msg = Array.isArray(backendMsg)
        ? backendMsg.join(", ")
        : backendMsg || "Xoá chương thất bại";
      message.error(msg);
    }
  };

  // ===== TẠO CHƯƠNG MỚI =====
  const handleCreateSession = async () => {
    try {
      const title = `Chương mới ${sessions.length + 1}`;
      const body = {
        title,
        order: sessions.length + 1,
        courseId, // tuỳ DTO backend
      };
      await SessionApi.createSession(body);
      message.success("Tạo chương mới thành công");
      fetchSessions();
    } catch (err) {
      console.error("❌ Lỗi tạo chương:", err);
      const backendMsg = err?.response?.data?.message;
      const msg = Array.isArray(backendMsg)
        ? backendMsg.join(", ")
        : backendMsg || "Tạo chương thất bại";
      message.error(msg);
    }
  };

  // (Hiện tại chỉ UI, chưa gắn API cho từng loại bài giảng)
  const handleAddLessonType = (typeKey) => {
    if (!selectedSession) {
      message.info("Hãy chọn một chương trước khi thêm bài giảng");
      return;
    }
    message.info(`(Demo) Thêm bài giảng loại: ${typeKey} cho chương hiện tại`);
  };

  return (
    <div className="course-manager-page">
      {/* Thanh trên cùng (màu xanh) */}
      <div className="cm-topbar">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/admin/courses")}
          className="cm-topbar-back"
        >
          Khóa học
        </Button>

        <div className="cm-topbar-center">
          <span>Website khởi tạo từ</span>
          <strong>RikaSoft</strong>
        </div>

        <div className="cm-topbar-right">
          <Button type="link">Xem trước</Button>
        </div>
      </div>

      <div className="cm-main">
        {/* CỘT TRÁI: DANH SÁCH CHƯƠNG + KHU BÀI GIẢNG */}
        <div className="cm-left">
          <div className="cm-left-header">
            <span>{course?.title || "Các chương"}</span>
          </div>

          <div className="cm-session-list">
            <List
              dataSource={sessions}
              locale={{ emptyText: "Chưa có chương nào" }}
              renderItem={(s, index) => (
                <div
                  className={
                    "cm-session-item" +
                    (selectedSession?.id === s.id
                      ? " cm-session-item--active"
                      : "")
                  }
                  onClick={() => handleSelectSession(s)}
                >
                  <span className="cm-session-index">
                    Bài {s.order ?? index + 1}:
                  </span>
                  <span className="cm-session-title">{s.title}</span>
                </div>
              )}
            />
          </div>

          {/* Thanh nhỏ: Thêm bài giảng + Lưu */}
          <div className="cm-lesson-toolbar">
            <Button type="primary" size="small">
              + Thêm bài giảng
            </Button>
            <Button size="small">Lưu</Button>
          </div>

          {/* Grid các loại bài giảng */}
          <div className="cm-lesson-types">
            {LESSON_TYPES.map((lt) => (
              <div
                key={lt.key}
                className="cm-lesson-type-card"
                onClick={() => handleAddLessonType(lt.key)}
              >
                <div className="cm-lesson-type-label">{lt.label}</div>
              </div>
            ))}
          </div>

          <Button
            type="primary"
            block
            className="cm-add-session-btn"
            onClick={handleCreateSession}
          >
            + Thêm chương
          </Button>
        </div>

        {/* CỘT PHẢI: FORM CHỈNH SỬA CHƯƠNG */}
        <div className="cm-right">
          <Card className="cm-session-card">
            <h3 className="cm-section-title">
              Tiêu đề: {selectedSession?.title || "Chọn một chương bên trái"}
            </h3>

            <div className="cm-form-row">
              <div className="cm-form-label">* Tiêu đề của chương:</div>
              <div className="cm-form-field">
                <Input
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  disabled={!selectedSession}
                  placeholder="Nhập tiêu đề chương"
                />
              </div>
            </div>

            <div className="cm-form-row">
              <div className="cm-form-label">* Bắt buộc làm:</div>
              <div className="cm-form-field">
                <Select
                  value={requiredType}
                  onChange={setRequiredType}
                  disabled={!selectedSession}
                  style={{ width: 220 }}
                >
                  <Option value="none">Không bắt buộc</Option>
                  <Option value="required">Bắt buộc</Option>
                </Select>
              </div>
            </div>

            <div className="cm-actions">
              <Button
                danger
                onClick={handleDeleteSession}
                disabled={!selectedSession}
              >
                Xoá chương
              </Button>
              <Button
                type="primary"
                onClick={handleUpdateSession}
                disabled={!selectedSession}
                loading={saving}
              >
                Cập nhật
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
