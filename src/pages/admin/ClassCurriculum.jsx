import { useEffect, useState } from "react";
import { 
  Collapse, List, Button, Tag, Space, Typography, 
  Modal, Table, Tooltip, Empty, Spin, message, Form, Input, Select, InputNumber 
} from "antd";
import { 
  YoutubeOutlined, ReadOutlined, 
  QuestionCircleOutlined, EditOutlined, 
  CheckCircleOutlined, SyncOutlined, CloseCircleOutlined,
  TrophyOutlined, FormOutlined 
} from "@ant-design/icons";
import { ClassApi } from "@/services/api/classApi"; 
import { useNavigate } from "react-router-dom";

const { Panel } = Collapse;
const { Text } = Typography;
const { TextArea } = Input;

const ITEM_ICONS = {
  Video: <YoutubeOutlined style={{ color: "red" }} />,
  Text: <ReadOutlined style={{ color: "blue" }} />,
  Quiz: <QuestionCircleOutlined style={{ color: "orange" }} />,
  Essay: <EditOutlined style={{ color: "green" }} />,
};

export default function ClassCurriculum({ classId, courseId, students }) {
  const navigate = useNavigate();
  const [syllabus, setSyllabus] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- STATE CHO ESSAY ---
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [submissionsMap, setSubmissionsMap] = useState({});
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // --- 🔥 MỚI: STATE CHO FORM CHẤM ĐIỂM (SUB-MODAL) ---
  const [isGradingFormOpen, setIsGradingFormOpen] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [gradingLoading, setGradingLoading] = useState(false);
  const [form] = Form.useForm(); // Antd Form Instance

  // --- STATE CHO QUIZ ---
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizResultsMap, setQuizResultsMap] = useState({});
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  
  const [currentItem, setCurrentItem] = useState(null);

  useEffect(() => {
    if (courseId) {
      setLoading(true);
      ClassApi.getCourseStructure(courseId)
        .then((data) => setSyllabus(data || []))
        .catch((err) => console.error("Lỗi load cấu trúc:", err))
        .finally(() => setLoading(false));
    }
  }, [courseId]);

  // --- HANDLER: CLICK ESSAY ---
  const handleOpenEssay = async (item) => {
    setCurrentItem(item);
    setIsGradeModalOpen(true);
    setLoadingSubmissions(true);
    try {
      const res = await ClassApi.getSubmissionsByLessonItem(item.id);
      const map = {};
      if (res?.data) res.data.forEach(sub => map[sub.studentId] = sub);
      setSubmissionsMap(map);
    } catch (error) { message.error("Lỗi tải bài nộp"); } 
    finally { setLoadingSubmissions(false); }
  };

  // --- HANDLER: CLICK QUIZ ---
  const handleOpenQuiz = async (item) => {
    if (!item.resource_quiz_id) return message.warning("Bài học này chưa liên kết Quiz");
    
    setCurrentItem(item);
    setIsQuizModalOpen(true);
    setLoadingQuiz(true);
    try {
      // Gọi API lấy kết quả kèm lessonItemId để lọc
      const results = await ClassApi.getQuizResults(item.resource_quiz_id, item.id);
      
      const map = {};
      if (results) {
        results.forEach(res => {
          const currentBest = map[res.user_id];
          // Logic: Lấy điểm cao nhất
          if (!currentBest || Number(res.score) > Number(currentBest.score)) {
            map[res.user_id] = res;
          }
        });
      }
      setQuizResultsMap(map);
    } catch (error) { 
      console.error(error); 
      message.error("Lỗi tải điểm Quiz"); 
    } 
    finally { setLoadingQuiz(false); }
  };

  // --- 🔥 MỚI: MỞ FORM CHẤM ĐIỂM ---
  const handleOpenGradingForm = (submission) => {
    setCurrentSubmission(submission);
    // Fill dữ liệu cũ vào form (nếu đã chấm rồi)
    form.setFieldsValue({
      score: submission.score,
      status: submission.status,
      feedback: submission.feedback
    });
    setIsGradingFormOpen(true);
  };

  // --- 🔥 MỚI: SUBMIT ĐIỂM SỐ ---
  const handleSubmitGrade = async () => {
    try {
      const values = await form.validateFields();
      setGradingLoading(true);

      // Gọi API chấm điểm
      const updatedSubmission = await ClassApi.gradeSubmission(currentSubmission.id, values);

      // Cập nhật lại danh sách local (submissionsMap) để UI tự đổi màu
      setSubmissionsMap(prev => ({
        ...prev,
        [updatedSubmission.studentId]: updatedSubmission
      }));

      message.success("Chấm điểm thành công!");
      setIsGradingFormOpen(false);
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra khi chấm điểm");
    } finally {
      setGradingLoading(false);
    }
  };

  // --- COLUMNS CHO QUIZ ---
  const quizColumns = [
    { title: 'Học viên', dataIndex: 'full_name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email', render: t => <Text type="secondary" style={{fontSize: 12}}>{t}</Text> },
    { 
      title: 'Điểm số', 
      key: 'score', 
      align: 'center',
      render: (_, student) => {
        const result = quizResultsMap[student.student_id];
        if (!result) return <Tag>Chưa làm</Tag>;
        let color = result.score >= 80 ? 'success' : result.score >= 50 ? 'warning' : 'error';
        return <Tag color={color} style={{fontWeight: 'bold'}}>{Number(result.score).toFixed(2)} / 100</Tag>;
      }
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_, student) => {
        const result = quizResultsMap[student.student_id];
        return result ? new Date(result.submitted_at).toLocaleString('vi-VN') : '-';
      }
    }
  ];

  // --- 🔥 CẬP NHẬT: COLUMNS CHO ESSAY (Thêm nút chấm điểm) ---
  const gradeColumns = [
     { title: 'Học viên', dataIndex: 'full_name', key: 'name' },
     { title: 'Email', dataIndex: 'email', key: 'email' },
     { 
       title: 'Trạng thái', 
       key: 'status', 
       render: (_, s) => {
         const sub = submissionsMap[s.student_id];
         if(!sub) return <Tag>Chưa nộp</Tag>;
         
         if (sub.status === 'approved') return <Tag color="success">Đã duyệt ({sub.score}đ)</Tag>;
         if (sub.status === 'rejected') return <Tag color="error">Từ chối</Tag>;
         return <Tag color="processing">Chờ chấm</Tag>;
       }
     },
     { 
       title: 'Thao tác', 
       key: 'action', 
       render: (_, s) => {
         const sub = submissionsMap[s.student_id];
         if (!sub) return <Text disabled>--</Text>;

         return (
           <Space>
             {/* Nút xem chi tiết (Link Git) */}
             <Tooltip title="Xem chi tiết bài nộp">
                <Button size="small" icon={<ReadOutlined />} onClick={() => window.open(sub.gitLink, '_blank')} />
             </Tooltip>
             
             {/* 🔥 Nút chấm điểm */}
             <Button 
               type="primary" 
               size="small" 
               icon={<FormOutlined />} 
               onClick={() => handleOpenGradingForm(sub)}
             >
               Chấm điểm
             </Button>
           </Space>
         );
       }
     }
  ];

  if (loading) return <div style={{textAlign: 'center', padding: 20}}><Spin /></div>;
  if (!syllabus || syllabus.length === 0) return <Empty description="Chưa có nội dung" />;

  return (
    <div style={{ padding: 24 }}>
      <Collapse defaultActiveKey={['0']} ghost>
        {syllabus.map((session, index) => (
          <Panel header={<b style={{fontSize: 16}}>{session.title}</b>} key={index}>
            <List
              itemLayout="horizontal"
              dataSource={session.lessons || []}
              renderItem={(lesson) => (
                <List.Item>
                  <List.Item.Meta
                    title={<span>{lesson.title}</span>}
                    description={
                      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                        {lesson.items?.map((item) => (
                          <Tooltip title={`${item.type}: ${item.title || 'Nội dung'}`} key={item.id}>
                            <Button 
                              size="small" 
                              icon={ITEM_ICONS[item.type]}
                              onClick={() => {
                                if (item.type === 'Essay') handleOpenEssay(item);
                                if (item.type === 'Quiz') handleOpenQuiz(item);
                              }}
                              type={item.type === 'Essay' || item.type === 'Quiz' ? 'default' : 'dashed'}
                              style={item.type === 'Quiz' ? { borderColor: '#faad14', color: '#faad14' } : 
                                     item.type === 'Essay' ? { borderColor: '#52c41a', color: '#52c41a' } : {}}
                            >
                              {item.title || item.type}
                            </Button>
                          </Tooltip>
                        ))}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Panel>
        ))}
      </Collapse>

      {/* MODAL 1: DANH SÁCH BÀI NỘP */}
      <Modal 
        title={`Bài tập Tự luận: ${currentItem?.title}`}
        open={isGradeModalOpen} 
        onCancel={() => setIsGradeModalOpen(false)}
        footer={null} 
        width={800}
      >
        <Table dataSource={students} columns={gradeColumns} rowKey="student_id" loading={loadingSubmissions} />
      </Modal>

      {/* MODAL 2: KẾT QUẢ QUIZ */}
      <Modal
        title={<span><TrophyOutlined style={{color:'orange', marginRight:8}}/> Kết quả Quiz: {currentItem?.title}</span>}
        open={isQuizModalOpen} 
        onCancel={() => setIsQuizModalOpen(false)}
        footer={null} 
        width={700}
      >
         <Table dataSource={students} columns={quizColumns} rowKey="student_id" loading={loadingQuiz} />
      </Modal>

      {/* 🔥 MODAL 3: FORM CHẤM ĐIỂM (HIỆN LÊN TRÊN MODAL 1) */}
      <Modal
        title="Chấm điểm & Nhận xét"
        open={isGradingFormOpen}
        onCancel={() => setIsGradingFormOpen(false)}
        onOk={handleSubmitGrade}
        confirmLoading={gradingLoading}
        zIndex={1002} // Đảm bảo nổi lên trên modal kia
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            name="status" 
            label="Trạng thái" 
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select>
              <Select.Option value="approved">Đạt (Approved)</Select.Option>
              <Select.Option value="rejected">Chưa đạt (Rejected)</Select.Option>
              <Select.Option value="pending">Chờ xem xét</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item 
            name="score" 
            label="Điểm số (0 - 10)" 
            rules={[{ required: true, message: 'Vui lòng nhập điểm' }]}
          >
            <InputNumber min={0} max={10} step={0.1} style={{width: '100%'}} />
          </Form.Item>

          <Form.Item name="feedback" label="Nhận xét / Góp ý">
            <TextArea rows={4} placeholder="Nhập nhận xét của giáo viên..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}