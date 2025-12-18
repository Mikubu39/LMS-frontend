// src/pages/teacher/TeacherDashboard.jsx
import { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Spin, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import {
  ReloadOutlined,
  ArrowUpOutlined,
  ApartmentOutlined,
  BookOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  DatabaseOutlined
} from "@ant-design/icons";

// Giả sử API vẫn dùng chung, nhưng Backend sẽ tự lọc theo quyền của Teacher nếu cần thiết.
// Ở đây ta chỉ lấy số lượng tổng quan để hiển thị Dashboard.
import { ClassApi } from "@/services/api/classApi";
import { CourseApi } from "@/services/api/courseApi";
import { PostApi } from "@/services/api/postApi";
import { QuizApi } from "@/services/api/quizApi";
import { QuestionApi } from "@/services/api/questionApi";

const { Title, Text } = Typography;

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    classCount: 0,
    courseCount: 0,
    postCount: 0,
    quizCount: 0,
    questionCount: 0,
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    console.log("🚀 Teacher Dashboard: Đang tải dữ liệu...");

    try {
      // Gọi song song các API để lấy số lượng
      // Lưu ý: Nếu muốn chính xác "Của tôi", Backend cần có API riêng hoặc filter.
      // Tạm thời ở Frontend ta gọi chung để lấy số liệu tổng quan hệ thống hoặc danh sách teacher có quyền xem.
      const results = await Promise.allSettled([
        ClassApi.getAll(), // Lấy danh sách lớp
        CourseApi.getCourses({ limit: 10 }), 
        PostApi.getPosts({ limit: 10 }), 
        QuizApi.getAll(), 
        QuestionApi.getAll(), 
      ]);

      // Helper Safe Count
      const safeCount = (res) => {
        if (res.status === 'rejected') return 0;
        const val = res.value;

        // Ưu tiên 1: Lấy từ meta.total
        if (val?.meta?.total !== undefined) return val.meta.total;
        if (val?.pagination?.total !== undefined) return val.pagination.total;

        // Ưu tiên 2: Đếm mảng
        if (Array.isArray(val?.data)) return val.data.length;
        if (Array.isArray(val?.items)) return val.items.length;
        if (Array.isArray(val)) return val.length;

        return 0;
      };

      setStats({
        classCount: safeCount(results[0]),
        courseCount: safeCount(results[1]),
        postCount: safeCount(results[2]),
        quizCount: safeCount(results[3]),
        questionCount: safeCount(results[4]),
      });

    } catch (error) {
      console.error("🔥 Lỗi Dashboard:", error);
      message.error("Có lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Danh sách các thẻ thống kê dành cho Teacher
  const cardItems = [
    {
      title: "Lớp học của tôi",
      value: stats.classCount,
      icon: <ApartmentOutlined style={{ fontSize: 24, color: "#fa8c16" }} />,
      color: "#fff7e6",
      link: "/teacher/classes",
      desc: "Lớp đang phụ trách"
    },
    {
      title: "Khóa học",
      value: stats.courseCount,
      icon: <BookOutlined style={{ fontSize: 24, color: "#52c41a" }} />,
      color: "#f6ffed",
      link: "/teacher/courses",
      desc: "Giáo trình giảng dạy"
    },
    {
      title: "Ngân hàng Câu hỏi",
      value: stats.questionCount,
      icon: <DatabaseOutlined style={{ fontSize: 24, color: "#fa541c" }} />,
      color: "#fff2e8",
      link: "/teacher/questions",
      desc: "Câu hỏi trắc nghiệm"
    },
    {
      title: "Bộ đề Quiz",
      value: stats.quizCount,
      icon: <QuestionCircleOutlined style={{ fontSize: 24, color: "#13c2c2" }} />,
      color: "#e6fffb",
      link: "/teacher/question-banks",
      desc: "Bài kiểm tra"
    },
    {
      title: "Bài viết",
      value: stats.postCount,
      icon: <FileTextOutlined style={{ fontSize: 24, color: "#eb2f96" }} />,
      color: "#fff0f6",
      link: "/teacher/posts",
      desc: "Tin tức & Blog"
    },
  ];

  return (
    <div className="admin-page" style={{ padding: 20 }}>
      {/* Header */}
      <div className="admin-page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <Title level={2} style={{ margin: 0 }}>Giảng viên Dashboard</Title>
            <Text type="secondary">Tổng quan công việc giảng dạy</Text>
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