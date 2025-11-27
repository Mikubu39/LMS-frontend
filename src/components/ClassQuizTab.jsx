import { useEffect, useState, useMemo } from "react";
import { 
  List, Card, Typography, Table, Tag, Empty, Spin, message, Badge 
} from "antd";
import { QuestionCircleOutlined, TrophyOutlined } from "@ant-design/icons";
import { ClassApi } from "@/services/api/classApi";

const { Text, Title } = Typography;

export default function ClassQuizTab({ courseId, students }) {
  const [syllabus, setSyllabus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizResults, setQuizResults] = useState({});
  const [loadingResults, setLoadingResults] = useState(false);

  // 1. Load cấu trúc khóa học
  useEffect(() => {
    if (courseId) {
      setLoading(true);
      ClassApi.getCourseStructure(courseId)
        .then(data => setSyllabus(data || []))
        .catch(() => message.error("Lỗi tải cấu trúc"))
        .finally(() => setLoading(false));
    }
  }, [courseId]);

  // 2. Lọc ra danh sách chỉ chứa Quiz
  const quizList = useMemo(() => {
    const list = [];
    syllabus.forEach(session => {
      const quizzes = session.lessons?.flatMap(l => l.items || [])
        .filter(item => item.type === 'Quiz');
      
      if (quizzes.length > 0) {
        list.push({ sessionTitle: session.title, items: quizzes });
      }
    });
    return list;
  }, [syllabus]);

  // 3. Khi chọn 1 Quiz -> Load điểm
  const handleSelectQuiz = async (item) => {
    setSelectedQuiz(item);
    if (!item.resource_quiz_id) return;

    setLoadingResults(true);
    try {
      const results = await ClassApi.getQuizResults(item.resource_quiz_id, item.id);
      // Map kết quả tốt nhất của từng user
      const map = {};
      if (results) {
        results.forEach(res => {
          const currentBest = map[res.user_id];
          if (!currentBest || Number(res.score) > Number(currentBest.score)) {
            map[res.user_id] = res;
          }
        });
      }
      setQuizResults(map);
    } catch (error) { message.error("Lỗi tải điểm"); } 
    finally { setLoadingResults(false); }
  };

  // 4. Columns cho bảng điểm
  const columns = [
    { title: 'Học viên', dataIndex: 'full_name', key: 'name' },
    { title: 'Email', dataIndex: 'email', render: t => <Text type="secondary" style={{fontSize: 12}}>{t}</Text> },
    { 
      title: 'Điểm số', 
      key: 'score', 
      align: 'center',
      render: (_, s) => {
        const res = quizResults[s.student_id];
        if (!res) return <Tag>Chưa làm</Tag>;
        const score = Number(res.score);
        return <Tag color={score >= 8 ? 'success' : score >= 5 ? 'warning' : 'error'} style={{fontWeight: 'bold', fontSize: 14}}>{score.toFixed(2)}</Tag>;
      }
    },
    {
      title: 'Thời gian nộp',
      key: 'time',
      render: (_, s) => {
        const res = quizResults[s.student_id];
        return res ? new Date(res.submitted_at).toLocaleString('vi-VN') : '-';
      }
    }
  ];

  if (loading) return <Spin style={{display:'block', margin:'40px auto'}} />;
  if (quizList.length === 0) return <Empty description="Khóa học này không có bài Quiz nào" />;

  return (
    <div style={{ display: 'flex', height: '600px', border: '1px solid #f0f0f0', borderRadius: 8 }}>
      
      {/* CỘT TRÁI: DANH SÁCH QUIZ */}
      <div style={{ width: 300, borderRight: '1px solid #f0f0f0', overflowY: 'auto', background: '#fafafa' }}>
        <div style={{ padding: '16px 16px 8px', fontWeight: 600, color: '#666', borderBottom:'1px solid #eee' }}>
            DANH SÁCH BÀI QUIZ
        </div>
        {quizList.map((group, idx) => (
          <div key={idx}>
            <div style={{ padding: '8px 16px', background: '#f5f5f5', fontSize: 12, fontWeight: 700, color: '#999' }}>
              {group.sessionTitle.toUpperCase()}
            </div>
            <List
              dataSource={group.items}
              renderItem={item => (
                <div 
                  onClick={() => handleSelectQuiz(item)}
                  style={{ 
                    padding: '12px 16px', 
                    cursor: 'pointer', 
                    background: selectedQuiz?.id === item.id ? '#e6f7ff' : 'transparent',
                    borderRight: selectedQuiz?.id === item.id ? '3px solid #1890ff' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <QuestionCircleOutlined style={{ marginRight: 8, color: '#faad14' }} />
                  <Text strong={selectedQuiz?.id === item.id}>{item.title}</Text>
                </div>
              )}
            />
          </div>
        ))}
      </div>

      {/* CỘT PHẢI: BẢNG ĐIỂM */}
      <div style={{ flex: 1, padding: 24, overflowY: 'auto', background: '#fff' }}>
        {!selectedQuiz ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
            <TrophyOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <div>Chọn một bài Quiz bên trái để xem kết quả</div>
          </div>
        ) : (
          <div>
            <Title level={4} style={{marginTop: 0, marginBottom: 24}}>
                <TrophyOutlined style={{color: '#faad14', marginRight: 10}}/>
                Kết quả: {selectedQuiz.title}
            </Title>
            <Table 
                dataSource={students} 
                columns={columns} 
                rowKey="student_id" 
                loading={loadingResults} 
                pagination={false}
                bordered
            />
          </div>
        )}
      </div>
    </div>
  );
}