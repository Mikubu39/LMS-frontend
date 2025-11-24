// ✅ src/pages/admin/QuizManager.jsx
import { useEffect, useState, useMemo } from "react";
import { 
  Button, Table, Input, Modal, Form, message, 
  Popconfirm, Drawer, Tag, InputNumber, Tooltip, Empty, Checkbox 
} from "antd";
// Đảm bảo import đủ icon
import { 
  PlusOutlined, DeleteOutlined, EditOutlined, 
  SearchOutlined, ClockCircleOutlined, 
  FileTextOutlined, TrophyOutlined, CalculatorOutlined,
  DeleteFilled, DoubleRightOutlined
} from "@ant-design/icons";

import { QuizApi } from "@/services/api/quizApi";
import { QuestionApi } from "@/services/api/questionApi"; 
import "@/css/quiz-manager.css"; // ⚠️ Đảm bảo bạn ĐÃ TẠO file này

export default function QuizManager() {
  // --- STATE ---
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [form] = Form.useForm();

  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  
  // State chọn câu hỏi
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [checkedIds, setCheckedIds] = useState([]); // Checkbox bên trái
  
  const [questionSearch, setQuestionSearch] = useState("");

  // --- FETCH DATA (AN TOÀN) ---
  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const data = await QuizApi.getAll();
      // 🛡️ FIX LỖI: Kiểm tra data có phải mảng không trước khi sort
      if (Array.isArray(data)) {
        setQuizzes(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      } else {
        setQuizzes([]);
      }
    } catch (error) {
      console.error("Lỗi tải quiz:", error);
      message.error("Không thể tải danh sách bộ đề");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // --- HANDLERS ---
  const handleDelete = async (id) => {
    try {
      await QuizApi.delete(id);
      message.success("Đã xóa bộ đề");
      fetchQuizzes();
    } catch (err) {
      message.error("Không thể xóa");
    }
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingQuiz) {
        await QuizApi.update(editingQuiz.quiz_id, values);
        message.success("Cập nhật thành công");
      } else {
        // Nếu backend yêu cầu lesson_id, hãy thêm dummy id hoặc sửa backend
        await QuizApi.create(values); 
        message.success("Tạo bộ đề thành công");
      }
      setIsModalOpen(false);
      fetchQuizzes();
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi lưu dữ liệu");
    }
  };

  // --- ASSIGNMENT LOGIC ---
  const openAssignDrawer = async (quiz) => {
    setCurrentQuiz(quiz);
    setIsDrawerOpen(true);
    setQuestionSearch("");
    setCheckedIds([]); 
    try {
      const [quizDetail, questions] = await Promise.all([
        QuizApi.getById(quiz.quiz_id),
        QuestionApi.getAll()
      ]);
      
      // Safety check
      const currentIds = quizDetail.questions?.map(q => q.question_id) || [];
      const questionList = Array.isArray(questions) ? questions : [];

      setSelectedQuestionIds(currentIds);
      setAllQuestions(questionList);
    } catch (err) {
      console.error(err);
      message.error("Lỗi tải dữ liệu câu hỏi");
    }
  };

  const handleSaveAssignments = async () => {
    if (!currentQuiz) return;
    try {
      const assignments = selectedQuestionIds.map((id, index) => ({
        question_id: id,
        order_index: index + 1
      }));
      await QuizApi.assignQuestions(currentQuiz.quiz_id, assignments);
      message.success(`Đã lưu cấu trúc đề thi!`);
      setIsDrawerOpen(false);
      fetchQuizzes();
    } catch (err) {
      message.error("Lỗi khi lưu cấu trúc đề");
    }
  };

  // Logic Checkbox & Chuyển đổi
  const handleCheckSource = (id) => {
    if (checkedIds.includes(id)) {
      setCheckedIds(checkedIds.filter(cid => cid !== id));
    } else {
      setCheckedIds([...checkedIds, id]);
    }
  };

  const handleAddBatch = () => {
    if (checkedIds.length === 0) return;
    // Thêm các ID chưa có trong selectedQuestionIds
    const newIds = checkedIds.filter(id => !selectedQuestionIds.includes(id));
    setSelectedQuestionIds([...selectedQuestionIds, ...newIds]);
    setCheckedIds([]); 
  };

  const handleRemoveFromQuiz = (id) => {
    setSelectedQuestionIds(selectedQuestionIds.filter(qid => qid !== id));
  };

  // Filter & Search
  const filteredSourceQuestions = useMemo(() => {
    if (!Array.isArray(allQuestions)) return [];
    return allQuestions.filter(q => 
      !selectedQuestionIds.includes(q.question_id) && 
      (q.question_text || "").toLowerCase().includes(questionSearch.toLowerCase())
    );
  }, [allQuestions, selectedQuestionIds, questionSearch]);

  const selectedQuestionsObjects = useMemo(() => {
    if (!Array.isArray(allQuestions)) return [];
    return selectedQuestionIds
      .map(id => allQuestions.find(q => q.question_id === id))
      .filter(Boolean);
  }, [selectedQuestionIds, allQuestions]);


  // --- COLUMNS ---
  const columns = [
    {
      title: 'Tên Bộ Đề',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <div className="quiz-title-cell">{text}</div>
    },
    {
      title: 'Thời gian',
      dataIndex: 'duration',
      key: 'duration',
      align: 'center',
      width: 150,
      render: (mins) => (
        <Tag icon={<ClockCircleOutlined />} color={mins > 45 ? "red" : "blue"} style={{borderRadius: 12, padding: '4px 10px'}}>
           {mins} phút
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <div style={{display:'flex', justifyContent:'flex-end', gap: 8}}>
          <Tooltip title="Soạn câu hỏi">
            <Button 
              type="default" 
              style={{color: '#1890ff', borderColor: '#1890ff'}}
              icon={<FileTextOutlined />} 
              onClick={() => openAssignDrawer(record)}
            >
              Soạn đề
            </Button>
          </Tooltip>
          <Button icon={<EditOutlined />} onClick={() => { setEditingQuiz(record); form.setFieldsValue(record); setIsModalOpen(true); }} />
          <Popconfirm title="Xóa?" onConfirm={() => handleDelete(record.quiz_id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div className="quiz-page-container" style={{ position: 'relative' }}> 
      {/* HEADER & STATS */}
      <div className="quiz-header-section">
         <div>
            <h2 style={{margin:0, fontSize: 24}}>Quản lý Bộ đề thi</h2>
            <div style={{color:'#666'}}>Tạo và quản lý các bài kiểm tra trắc nghiệm</div>
         </div>
         <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => { setEditingQuiz(null); form.resetFields(); setIsModalOpen(true); }}>
            Tạo Bộ Đề Mới
         </Button>
      </div>

      {/* Stats Cards */}
      <div className="quiz-stats-row">
          <div className="quiz-stat-card">
             <div className="stat-icon" style={{background: '#e6f7ff', color: '#1890ff'}}><TrophyOutlined /></div>
             <div className="stat-info"><h4>Tổng số bộ đề</h4><p>{quizzes.length}</p></div>
          </div>
          <div className="quiz-stat-card">
             <div className="stat-icon" style={{background: '#f6ffed', color: '#52c41a'}}><ClockCircleOutlined /></div>
             <div className="stat-info"><h4>Thời gian trung bình</h4><p>45m</p></div>
          </div>
          <div className="quiz-stat-card">
             <div className="stat-icon" style={{background: '#fff7e6', color: '#fa8c16'}}><CalculatorOutlined /></div>
             <div className="stat-info"><h4>Câu hỏi/đề (TB)</h4><p>~20</p></div>
          </div>
      </div>

      {/* MAIN TABLE */}
      <div className="quiz-table-wrapper">
         <div style={{marginBottom: 16, maxWidth: 400}}>
             <Input prefix={<SearchOutlined />} placeholder="Tìm kiếm bộ đề..." allowClear />
         </div>
         <Table columns={columns} dataSource={quizzes} rowKey="quiz_id" loading={loading} pagination={{ pageSize: 6 }} />
      </div>

      {/* MODAL CREATE/EDIT */}
      <Modal
        title={editingQuiz ? "Chỉnh sửa thông tin" : "Tạo bộ đề mới"}
        open={isModalOpen}
        onOk={handleModalSubmit}
        onCancel={() => setIsModalOpen(false)}
        width={500}
      >
        <Form form={form} layout="vertical" style={{marginTop: 20}}>
           <Form.Item name="title" label="Tên bộ đề" rules={[{required:true, message:'Vui lòng nhập tên'}]}>
              <Input size="large" placeholder="VD: Kiểm tra cuối khóa ReactJS" />
           </Form.Item>
           <div style={{display:'flex', gap: 16}}>
             <Form.Item name="duration" label="Thời gian (phút)" style={{flex:1}} rules={[{required:true}]}>
                <InputNumber min={1} size="large" style={{width: '100%'}} />
             </Form.Item>
           </div>
        </Form>
      </Modal>

      {/* DRAWER GÁN CÂU HỎI */}
      <Drawer
        title={
           <div style={{display:'flex', alignItems:'center', gap: 10}}>
              <span>Soạn đề: <b>{currentQuiz?.title}</b></span>
              <Tag color="blue">{selectedQuestionIds.length} câu đã chọn</Tag>
           </div>
        }
        // 🟢 Điều chỉnh chiều rộng động
        width="calc(100vw - 230px)" 
        style={{ top: 64 }}
        mask={false} 
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        bodyStyle={{ background: '#f0f2f5', padding: '16px' }} 
        extra={
           <Button type="primary" size="large" onClick={handleSaveAssignments}>
              Lưu cấu trúc đề
           </Button>
        }
      >
        <div className="assign-layout">
           {/* TRÁI: KHO CÂU HỎI */}
           <div className="assign-panel source-panel">
              <div className="assign-panel-header">
                 <div className="header-title">Ngân hàng câu hỏi</div>
                 <Input 
                    prefix={<SearchOutlined />} 
                    placeholder="Tìm kiếm..." 
                    style={{width: 180}} 
                    value={questionSearch}
                    onChange={e => setQuestionSearch(e.target.value)}
                 />
              </div>
              <div className="assign-list-area">
                 {filteredSourceQuestions.length === 0 ? <Empty description="Không tìm thấy" /> : 
                    filteredSourceQuestions.map(q => (
                       <div 
                          key={q.question_id} 
                          className={`q-item-card source ${checkedIds.includes(q.question_id) ? 'checked' : ''}`}
                          onClick={() => handleCheckSource(q.question_id)}
                       >
                          <div className="q-checkbox">
                             <Checkbox checked={checkedIds.includes(q.question_id)} />
                          </div>
                          <div className="q-content">
                             <div className="q-text">{q.question_text}</div>
                             <div className="q-tags">
                                <Tag color="default" style={{fontSize: 10}}>{q.category || 'Chung'}</Tag>
                             </div>
                          </div>
                       </div>
                    ))
                 }
              </div>
           </div>

           {/* GIỮA: NÚT CHUYỂN */}
           <div className="assign-actions-middle">
              <Button 
                type="primary" 
                icon={<DoubleRightOutlined />} 
                disabled={checkedIds.length === 0}
                onClick={handleAddBatch}
                shape="circle" 
                size="large"
                style={{height: 50, width: 50}} 
              />
              {checkedIds.length > 0 && <div style={{fontWeight:'bold', color:'#1890ff'}}>+{checkedIds.length}</div>}
           </div>

           {/* PHẢI: ĐỀ THI */}
           <div className="assign-panel selected-panel">
              <div className="assign-panel-header selected-header">
                 <div className="header-title selected-text">Đề thi ({selectedQuestionIds.length})</div>
                 <Button size="small" danger type="dashed" onClick={() => setSelectedQuestionIds([])}>Xóa tất cả</Button>
              </div>
              <div className="assign-list-area bg-white">
                 {selectedQuestionsObjects.length === 0 ? 
                    <div className="empty-placeholder">
                       <FileTextOutlined style={{fontSize: 48, opacity:0.2}} />
                       <p>Chưa có câu hỏi</p>
                    </div> 
                 : 
                    selectedQuestionsObjects.map((q, idx) => (
                       <div key={q.question_id} className="q-item-card in-quiz">
                          <div className="q-index">#{idx + 1}</div>
                          <div className="q-content">
                             <div className="q-text">{q.question_text}</div>
                          </div>
                          <div className="q-action-btn" onClick={() => handleRemoveFromQuiz(q.question_id)}>
                             <DeleteFilled style={{fontSize: 18, color: '#ff4d4f'}} />
                          </div>
                       </div>
                    ))
                 }
              </div>
           </div>
        </div>
      </Drawer>
    </div>
  );
}