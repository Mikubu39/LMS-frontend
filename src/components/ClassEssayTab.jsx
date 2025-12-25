import { useEffect, useState, useMemo } from "react";
import { 
  List, Typography, Table, Tag, Space, Button, Tooltip, Empty, Spin, message, Modal, Form, Select, InputNumber, Input 
} from "antd";
import { 
  EditOutlined, ReadOutlined, FormOutlined, CheckCircleOutlined 
} from "@ant-design/icons";
import { ClassApi } from "@/services/api/classApi";

const { Text, Title } = Typography;
const { TextArea } = Input;

// 👇 Đã thêm prop classId vào đây
export default function ClassEssayTab({ courseId, classId, students }) {
  const [syllabus, setSyllabus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEssay, setSelectedEssay] = useState(null);
  
  const [submissionsMap, setSubmissionsMap] = useState({});
  const [loadingSubs, setLoadingSubs] = useState(false);

  // State chấm điểm
  const [isGrading, setIsGrading] = useState(false);
  const [currentSub, setCurrentSub] = useState(null);
  const [submittingGrade, setSubmittingGrade] = useState(false);
  const [form] = Form.useForm();

  // 1. Load cấu trúc
  useEffect(() => {
    if (courseId) {
      setLoading(true);
      ClassApi.getCourseStructure(courseId)
        .then(data => setSyllabus(data || []))
        .catch(() => message.error("Lỗi tải cấu trúc"))
        .finally(() => setLoading(false));
    }
  }, [courseId]);

  // 2. Lọc Essay
  const essayList = useMemo(() => {
    const list = [];
    syllabus.forEach(session => {
      const essays = session.lessons?.flatMap(l => l.items || [])
        .filter(item => item.type === 'Essay');
      
      if (essays.length > 0) {
        list.push({ sessionTitle: session.title, items: essays });
      }
    });
    return list;
  }, [syllabus]);

  // 3. Chọn Essay -> Load bài nộp
  const handleSelectEssay = async (item) => {
    setSelectedEssay(item);
    setLoadingSubs(true);
    try {
      // 👇 SỬA ĐÚNG 1 DÒNG NÀY: Truyền thêm classId
      const res = await ClassApi.getSubmissionsByLessonItem(item.id, classId);
      
      const map = {};
      if (res?.data) {
          res.data.forEach(sub => {
              map[sub.studentId] = sub;
          });
      }
      setSubmissionsMap(map);
    } catch (error) { 
        console.error(error);
        message.error("Lỗi tải bài nộp"); 
    } 
    finally { setLoadingSubs(false); }
  };

  const openGrading = (sub) => {
    setCurrentSub(sub);
    form.setFieldsValue({
      score: sub.score,
      status: sub.status,
      feedback: sub.feedback
    });
    setIsGrading(true);
  };

  const handleGrade = async () => {
    try {
        const values = await form.validateFields();
        setSubmittingGrade(true);
        const payload = {
          ...values,
          score: values.score !== null && values.score !== undefined ? Number(values.score) : 0
        };
        const updated = await ClassApi.gradeSubmission(currentSub.id, payload);
        setSubmissionsMap(prev => ({...prev, [updated.studentId]: updated}));
        message.success("Đã chấm điểm");
        setIsGrading(false);
    } catch(e) { 
        console.error(e);
        message.error("Lỗi chấm điểm: " + (e.response?.data?.message || "Không rõ nguyên nhân")); 
    }
    finally { setSubmittingGrade(false); }
  };

  const columns = [
     { title: 'Học viên', dataIndex: 'full_name', key: 'name' },
     { title: 'Email', dataIndex: 'email', key: 'email', render: t => <Text type="secondary" style={{fontSize: 12}}>{t}</Text> },
     { 
       title: 'Trạng thái', 
       key: 'status', 
       align: 'center',
       render: (_, s) => {
         const sub = submissionsMap[s.student_id];
         if(!sub) return <Tag>Chưa nộp</Tag>;
         if (sub.status === 'approved') return <Tag color="success">Đã duyệt ({sub.score}đ)</Tag>;
         if (sub.status === 'rejected') return <Tag color="error">Cần làm lại</Tag>;
         return <Tag color="processing">Chờ chấm</Tag>;
       }
     },
     { 
       title: 'Thao tác', 
       key: 'action', 
       align: 'right',
       render: (_, s) => {
         const sub = submissionsMap[s.student_id];
         if (!sub) return <Text disabled>--</Text>;
         return (
           <Space>
             <Tooltip title="Mở link bài làm">
                <Button size="small" icon={<ReadOutlined />} onClick={() => window.open(sub.gitLink, '_blank')} />
             </Tooltip>
             <Button type="primary" size="small" icon={<FormOutlined />} onClick={() => openGrading(sub)}>
               Chấm
             </Button>
           </Space>
         );
       }
     }
  ];

  if (loading) return <Spin style={{display:'block', margin:'40px auto'}} />;
  if (essayList.length === 0) return <Empty description="Khóa học này không có bài Tự luận nào" />;

  return (
    <div style={{ display: 'flex', height: '600px', border: '1px solid #f0f0f0', borderRadius: 8 }}>
      <div style={{ width: 300, borderRight: '1px solid #f0f0f0', overflowY: 'auto', background: '#fafafa' }}>
        <div style={{ padding: '16px 16px 8px', fontWeight: 600, color: '#666', borderBottom:'1px solid #eee' }}>DANH SÁCH BÀI TẬP</div>
        {essayList.map((group, idx) => (
          <div key={idx}>
            <div style={{ padding: '8px 16px', background: '#f5f5f5', fontSize: 12, fontWeight: 700, color: '#999' }}>{group.sessionTitle.toUpperCase()}</div>
            <List dataSource={group.items} renderItem={item => (
                <div onClick={() => handleSelectEssay(item)} style={{ padding: '12px 16px', cursor: 'pointer', background: selectedEssay?.id === item.id ? '#f6ffed' : 'transparent', borderRight: selectedEssay?.id === item.id ? '3px solid #52c41a' : 'none', transition: 'all 0.2s' }}>
                  <EditOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                  <Text strong={selectedEssay?.id === item.id}>{item.title}</Text>
                </div>
              )}
            />
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: 24, overflowY: 'auto', background: '#fff' }}>
        {!selectedEssay ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
            <CheckCircleOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <div>Chọn bài tập để bắt đầu chấm điểm</div>
          </div>
        ) : (
          <div>
            <Title level={4} style={{marginTop: 0, marginBottom: 24}}><EditOutlined style={{color: '#52c41a', marginRight: 10}}/>Chấm bài: {selectedEssay.title}</Title>
            <Table dataSource={students} columns={columns} rowKey="student_id" loading={loadingSubs} pagination={false} bordered />
          </div>
        )}
      </div>
      <Modal title="Chấm điểm bài làm" open={isGrading} onOk={handleGrade} onCancel={() => setIsGrading(false)} confirmLoading={submittingGrade}>
        <Form form={form} layout="vertical">
            <Form.Item name="status" label="Kết quả" rules={[{required: true}]}><Select><Select.Option value="approved">Đạt (Approved)</Select.Option><Select.Option value="rejected">Chưa đạt (Rejected)</Select.Option></Select></Form.Item>
            <Form.Item name="score" label="Điểm số (0-10)" rules={[{required: true}]}><InputNumber min={0} max={10} step={0.5} style={{width:'100%'}}/></Form.Item>
            <Form.Item name="feedback" label="Nhận xét"><TextArea rows={4} placeholder="Góp ý cho học viên..."/></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}