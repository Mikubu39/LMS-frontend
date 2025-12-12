// src/pages/EssayManagementPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Table, Tag, Card, Typography, Button, Empty, Tooltip, Space } from "antd";
import { 
  GithubOutlined, 
  CheckCircleOutlined, 
  SyncOutlined, 
  EyeOutlined,
  CommentOutlined,
  ReloadOutlined
} from "@ant-design/icons";

// Import API của bạn
import { SubmissionApi } from "@/services/api/submissionApi";

const { Title, Text } = Typography;

export default function EssayManagementPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  // Hàm lấy dữ liệu
  const fetchData = async () => {
    setLoading(true);
    try {
      // Gọi hàm getMySubmissions từ file API bạn cung cấp
      const res = await SubmissionApi.getMySubmissions();
      
      // Xử lý dữ liệu an toàn (tùy backend trả về mảng hay object)
      const list = Array.isArray(res) ? res : (res.data || []);
      
      // Sắp xếp bài mới nhất lên đầu (nếu backend chưa sort)
      const sortedList = list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setData(sortedList);
    } catch (error) {
      console.error("Lỗi tải bài nộp:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Cấu hình các cột của bảng
  const columns = [
    {
      title: 'Bài học',
      key: 'lessonTitle',
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Giả sử backend trả về thông tin bài học trong field lessonItem hoặc lesson */}
            <span style={{ fontWeight: 600, color: '#101828' }}>
              {record.lessonItem?.title || record.lessonTitle || "Bài tập Essay"}
            </span>
            <span style={{ fontSize: 12, color: '#667085' }}>
                {new Date(record.createdAt).toLocaleDateString('vi-VN')} • {new Date(record.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
            </span>
        </div>
      ),
    },
    {
      title: 'Link bài làm',
      dataIndex: 'gitLink',
      key: 'gitLink',
      render: (link) => (
        <a 
          href={link} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1677ff' }}
        >
          <GithubOutlined /> Mở Link
        </a>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        // Logic: Có điểm hoặc trạng thái GRADED là đã chấm
        const isGraded = record.status === 'GRADED' || (record.score !== null && record.score !== undefined);
        return isGraded ? (
          <Tag icon={<CheckCircleOutlined />} color="success" style={{ borderRadius: 10 }}>
            Đã chấm
          </Tag>
        ) : (
          <Tag icon={<SyncOutlined spin />} color="processing" style={{ borderRadius: 10 }}>
            Đang chờ chấm
          </Tag>
        );
      },
    },
    {
      title: 'Điểm số',
      dataIndex: 'score',
      key: 'score',
      align: 'center',
      render: (score) => {
        if (score === null || score === undefined) return <Text disabled>--</Text>;
        
        // Logic màu sắc: < 5 (Yếu - Đỏ), 5-7 (TB - Cam), >= 8 (Giỏi - Xanh)
        let color = '#D92D20'; // Đỏ
        if (score >= 8) color = '#039855'; // Xanh lá
        else if (score >= 5) color = '#F79009'; // Cam

        return (
          <span style={{ fontWeight: 800, fontSize: 16, color: color }}>
            {score}
          </span>
        );
      },
    },
    {
      title: 'Feedback GV',
      dataIndex: 'feedback', // hoặc 'teacherComment' tùy backend
      key: 'feedback',
      width: 300,
      render: (text) => {
        if (!text) return <Text type="secondary" style={{fontSize: 12}}>Chưa có nhận xét</Text>;
        
        // Dùng Tooltip để hiển thị feedback dài
        return (
          <Tooltip title={text} placement="topLeft" color="#101828">
             <div style={{ 
                 display: 'flex', 
                 alignItems: 'center', 
                 gap: 8, 
                 maxWidth: 250, 
                 cursor: 'pointer'
             }}>
                <CommentOutlined style={{ color: '#667085' }} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {text}
                </span>
             </div>
          </Tooltip>
        );
      }
    },
    {
      title: '',
      key: 'action',
      width: 100,
      render: (_, record) => {
        // Cần courseId và lessonId để quay lại trang học
        // Nếu record không có sẵn courseId, bạn cần backend trả về hoặc xử lý logic khác
        if (!record.courseId || !record.lessonId) return null;

        return (
            <Link to={`/course/${record.courseId}/lesson/${record.lessonId}`}>
                <Button size="small" icon={<EyeOutlined />}>
                    Chi tiết
                </Button>
            </Link>
        );
      },
    },
  ];

  return (
    <div className="essay-page-container" style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', padding: '40px 20px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
                <Title level={2} style={{ margin: 0, color: '#101828' }}>Quản lý bài tập</Title>
                <Text style={{ color: '#667085' }}>Danh sách các bài essay bạn đã nộp và kết quả.</Text>
            </div>
            <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
                Làm mới
            </Button>
        </div>

        {/* Table Section */}
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(16, 24, 40, 0.1)' }}>
            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 8, showSizeChanger: false }}
                locale={{
                    emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Bạn chưa nộp bài tập nào" />
                }}
            />
        </Card>
      </div>
    </div>
  );
}