// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Spin, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import {
  TeamOutlined,
  UserOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ApartmentOutlined,
  BookOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  DatabaseOutlined
} from "@ant-design/icons";

import { UserApi } from "@/services/api/userApi";
import { ClassApi } from "@/services/api/classApi";
import { CourseApi } from "@/services/api/courseApi";
import { PostApi } from "@/services/api/postApi";
import { QuizApi } from "@/services/api/quizApi";
import { QuestionApi } from "@/services/api/questionApi";

const { Title, Text } = Typography;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    studentCount: 0,
    teacherCount: 0,
    classCount: 0,
    courseCount: 0,
    postCount: 0,
    quizCount: 0,
    questionCount: 0,
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    console.log("🚀 Dashboard: Bắt đầu tải dữ liệu...");

    try {
      const results = await Promise.allSettled([
        // 👇 SỬA LỖI: Giảm limit từ 2000 xuống 10 (Server sẽ không báo lỗi 400 nữa)
        // Vì ta đã sửa UserApi trả về meta.total, nên chỉ cần lấy 10 bản ghi là biết tổng số rồi.
        UserApi.getAll({ role: 'student', limit: 10 }), 
        UserApi.getAll({ role: 'teacher', limit: 10 }), 
        
        ClassApi.getAll(),                                
        CourseApi.getCourses({ limit: 10 }),            
        PostApi.getPosts({ limit: 10 }),                
        QuizApi.getAll(),                                 
        QuestionApi.getAll(),                             
      ]);

      // --- Helper Safe Count (Đếm thông minh) ---
      const safeCount = (res, label) => {
        if (res.status === 'rejected') {
            console.error(`❌ Lỗi API ${label}:`, res.reason);
            // In chi tiết lỗi từ Backend nếu có
            if (res.reason?.response?.data) {
                console.log(`⚠️ Chi tiết backend ${label}:`, res.reason.response.data);
            }
            return 0;
        }
        
        const val = res.value;

        // Ưu tiên 1: Lấy từ meta.total (Chuẩn nhất)
        if (val?.meta?.total !== undefined) return val.meta.total;
        if (val?.pagination?.total !== undefined) return val.pagination.total;

        // Ưu tiên 2: Nếu trả về object bọc mảng { data: [...] }
        if (Array.isArray(val?.data)) return val.data.length;
        if (Array.isArray(val?.items)) return val.items.length;
        if (Array.isArray(val?.results)) return val.results.length;

        // Ưu tiên 3: Nếu trả về mảng trực tiếp
        if (Array.isArray(val)) return val.length;

        return 0;
      };

      setStats({
        studentCount: safeCount(results[0], "Student"),
        teacherCount: safeCount(results[1], "Teacher"),
        classCount: safeCount(results[2], "Class"),
        courseCount: safeCount(results[3], "Course"),
        postCount: safeCount(results[4], "Post"),
        quizCount: safeCount(results[5], "Quiz"),
        questionCount: safeCount(results[6], "Question"),
      });

    } catch (error) {
      console.error("🔥 Lỗi Dashboard Fatal:", error);
      message.error("Có lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const cardItems = [
    {
      title: "Tổng Học viên",
      value: stats.studentCount,
      icon: <TeamOutlined style={{ fontSize: 24, color: "#1890ff" }} />,
      color: "#e6f7ff",
      link: "/admin/students",
      desc: "Học viên hệ thống"
    },
    {
      title: "Tổng Giảng viên",
      value: stats.teacherCount,
      icon: <UserOutlined style={{ fontSize: 24, color: "#722ed1" }} />,
      color: "#f9f0ff",
      link: "/admin/teachers",
      desc: "Giảng viên chuyên môn"
    },
    {
      title: "Tổng Khóa học",
      value: stats.courseCount,
      icon: <BookOutlined style={{ fontSize: 24, color: "#52c41a" }} />,
      color: "#f6ffed",
      link: "/admin/courses",
      desc: "Khóa học đang mở"
    },
    {
      title: "Tổng Lớp học",
      value: stats.classCount,
      icon: <ApartmentOutlined style={{ fontSize: 24, color: "#fa8c16" }} />,
      color: "#fff7e6",
      link: "/admin/classes",
      desc: "Lớp học hoạt động"
    },
    {
      title: "Tổng Bài viết",
      value: stats.postCount,
      icon: <FileTextOutlined style={{ fontSize: 24, color: "#eb2f96" }} />,
      color: "#fff0f6",
      link: "/admin/posts",
      desc: "Tin tức & Blog"
    },
    {
      title: "Tổng Quiz",
      value: stats.quizCount,
      icon: <QuestionCircleOutlined style={{ fontSize: 24, color: "#13c2c2" }} />,
      color: "#e6fffb",
      link: "/admin/question-banks",
      desc: "Bộ đề kiểm tra"
    },
    {
      title: "Ngân hàng Câu hỏi",
      value: stats.questionCount,
      icon: <DatabaseOutlined style={{ fontSize: 24, color: "#fa541c" }} />,
      color: "#fff2e8",
      link: "/admin/questions",
      desc: "Câu hỏi trắc nghiệm"
    },
  ];

  return (
    <div className="admin-page" style={{ padding: 20 }}>
      {/* Header */}
      <div className="admin-page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <Title level={2} style={{ margin: 0 }}>Admin Dashboard</Title>
            <Text type="secondary">Tổng quan số liệu hệ thống</Text>
        </div>
        <ReloadOutlined 
            onClick={fetchDashboardData} 
            spin={loading} 
            style={{ fontSize: 20, cursor: 'pointer', color: '#1890ff' }} 
            title="Làm mới dữ liệu"
        />
      </div>

      <Spin spinning={loading} tip="Đang tải dữ liệu...">
          <Row gutter={[24, 24]}>
            {cardItems.map((item, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card
                  hoverable
                  bordered={false}
                  onClick={() => navigate(item.link)}
                  style={{ 
                    borderRadius: 12, 
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    height: '100%' 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 14 }}>{item.title}</Text>
                      <div style={{ marginTop: 4, marginBottom: 4 }}>
                         <Statistic 
                            value={item.value} 
                            valueStyle={{ fontSize: 28, fontWeight: 'bold' }} 
                            formatter={(value) => value.toLocaleString()} 
                         />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                        <ArrowUpOutlined style={{ color: '#52c41a' }} />
                        <span style={{ color: '#8c8c8c' }}>{item.desc}</span>
                      </div>
                    </div>
                    
                    <div style={{ 
                        width: 56, 
                        height: 56, 
                        borderRadius: '50%', 
                        backgroundColor: item.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                      {item.icon}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
      </Spin>
    </div>
  );
}