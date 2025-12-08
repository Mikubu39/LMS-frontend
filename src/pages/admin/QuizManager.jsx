// ✅ src/pages/admin/QuizManager.jsx
import { useEffect, useState, useMemo } from "react";
import { 
  Button, Table, Input, Modal, Form, message, 
  Popconfirm, Drawer, Tag, InputNumber, Tooltip, Empty, Checkbox 
} from "antd";
import { 
  PlusOutlined, DeleteOutlined, EditOutlined, 
  SearchOutlined, ClockCircleOutlined, 
  FileTextOutlined, TrophyOutlined, CalculatorOutlined,
  DeleteFilled, DoubleRightOutlined, TagOutlined
} from "@ant-design/icons";

import { QuizApi } from "@/services/api/quizApi";
import { QuestionApi } from "@/services/api/questionApi"; 
import { QUESTION_TYPE_LABELS, QUESTION_TYPES } from "@/constant";
import "@/css/quiz-manager.css";

export default function QuizManager() {
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
  
  // Selection State
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [checkedIds, setCheckedIds] = useState([]); 
  
  // Filters
  const [questionSearch, setQuestionSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const data = await QuizApi.getAll();
      if (Array.isArray(data)) {
        setQuizzes(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      } else {
        setQuizzes([]);
      }
    } catch (error) { message.error("Không thể tải danh sách"); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchQuizzes(); }, []);

  // --- ACTIONS ---
  const handleDelete = async (id) => {
    try { await QuizApi.delete(id); message.success("Đã xóa"); fetchQuizzes(); } 
    catch (err) { message.error("Lỗi xóa"); }
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingQuiz) {
        await QuizApi.update(editingQuiz.quiz_id, values);
        message.success("Cập nhật thành công");
      } else {
        await QuizApi.create(values); 
        message.success("Tạo mới thành công");
      }
      setIsModalOpen(false); fetchQuizzes();
    } catch (err) { message.error("Lỗi lưu dữ liệu"); }
  };

  // --- DRAWER ASSIGNMENT ---
  const openAssignDrawer = async (quiz) => {
    setCurrentQuiz(quiz);
    setIsDrawerOpen(true);
    setQuestionSearch(""); setTagSearch(""); setCheckedIds([]); 
    try {
      const [quizDetail, questions] = await Promise.all([
        QuizApi.getById(quiz.quiz_id),
        QuestionApi.getAll()
      ]);
      const currentIds = quizDetail.questions?.map(q => q.question_id) || [];
      setSelectedQuestionIds(currentIds);
      setAllQuestions(Array.isArray(questions) ? questions : []);
    } catch (err) { message.error("Lỗi tải dữ liệu"); }
  };

  const handleSaveAssignments = async () => {
    if (!currentQuiz) return;
    try {
      const assignments = selectedQuestionIds.map((id, index) => ({
        question_id: id,
        order_index: index + 1
      }));
      await QuizApi.assignQuestions(currentQuiz.quiz_id, assignments);
      message.success(`Đã lưu cấu trúc đề!`);
      setIsDrawerOpen(false); fetchQuizzes();
    } catch (err) { message.error("Lỗi lưu cấu trúc"); }
  };

  const handleCheckSource = (id) => {
    if (checkedIds.includes(id)) setCheckedIds(checkedIds.filter(cid => cid !== id));
    else setCheckedIds([...checkedIds, id]);
  };

  const handleAddBatch = () => {
    if (checkedIds.length === 0) return;
    const newIds = checkedIds.filter(id => !selectedQuestionIds.includes(id));
    setSelectedQuestionIds([...selectedQuestionIds, ...newIds]);
    setCheckedIds([]); 
  };

  // --- FILTERS ---
  const filteredSourceQuestions = useMemo(() => {
    if (!Array.isArray(allQuestions)) return [];
    return allQuestions.filter(q => {
      if (selectedQuestionIds.includes(q.question_id)) return false;
      const matchText = (q.question_text || "").toLowerCase().includes(questionSearch.toLowerCase());
      const matchTag = !tagSearch || (q.category && q.category.toLowerCase().includes(tagSearch.toLowerCase()));
      return matchText && matchTag;
    });
  }, [allQuestions, selectedQuestionIds, questionSearch, tagSearch]);

  const selectedQuestionsObjects = useMemo(() => {
    if (!Array.isArray(allQuestions)) return [];
    return selectedQuestionIds.map(id => allQuestions.find(q => q.question_id === id)).filter(Boolean);
  }, [selectedQuestionIds, allQuestions]);

  const columns = [
    { title: 'Tên Bộ Đề', dataIndex: 'title', key: 'title', render: t => <b style={{color:'#1890ff'}}>{t}</b> },
    { title: 'Thời gian', dataIndex: 'duration', align: 'center', width: 120, render: m => <Tag icon={<ClockCircleOutlined />}>{m}p</Tag> },
    {
      title: 'Thao tác', key: 'action', align: 'right',
      render: (_, r) => (
        <div style={{display:'flex', justifyContent:'flex-end', gap: 8}}>
          <Tooltip title="Soạn câu hỏi">
            <Button type="default" icon={<FileTextOutlined />} onClick={() => openAssignDrawer(r)}>Soạn đề</Button>
          </Tooltip>
          <Button icon={<EditOutlined />} onClick={() => { setEditingQuiz(r); form.setFieldsValue(r); setIsModalOpen(true); }} />
          <Popconfirm title="Xóa?" onConfirm={() => handleDelete(r.quiz_id)}><Button danger icon={<DeleteOutlined />} /></Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div className="quiz-page-container"> 
      <div className="quiz-header-section">
         <div>
            <h2 style={{margin:0}}>Quản lý Bộ đề thi</h2>
            <div style={{color:'#666'}}>Quản lý danh sách và cấu trúc đề</div>
         </div>
         <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => { setEditingQuiz(null); form.resetFields(); setIsModalOpen(true); }}>Tạo Mới</Button>
      </div>

      <div className="quiz-stats-row">
          <div className="quiz-stat-card"><div className="stat-icon" style={{background:'#e6f7ff', color:'#1890ff'}}><TrophyOutlined /></div><div className="stat-info"><h4>Tổng số</h4><p>{quizzes.length}</p></div></div>
          <div className="quiz-stat-card"><div className="stat-icon" style={{background:'#f6ffed', color:'#52c41a'}}><ClockCircleOutlined /></div><div className="stat-info"><h4>Thời lượng TB</h4><p>45m</p></div></div>
          <div className="quiz-stat-card"><div className="stat-icon" style={{background:'#fff7e6', color:'#fa8c16'}}><CalculatorOutlined /></div><div className="stat-info"><h4>Câu hỏi/đề</h4><p>~{Math.round(allQuestions.length / (quizzes.length || 1))}</p></div></div>
      </div>

      <div className="quiz-table-wrapper">
         <Table columns={columns} dataSource={quizzes} rowKey="quiz_id" loading={loading} pagination={{ pageSize: 6 }} />
      </div>

      <Modal title={editingQuiz ? "Sửa" : "Tạo"} open={isModalOpen} onOk={handleModalSubmit} onCancel={() => setIsModalOpen(false)}>
        <Form form={form} layout="vertical">
           <Form.Item name="title" label="Tên bộ đề" rules={[{required:true}]}><Input /></Form.Item>
           <Form.Item name="duration" label="Phút" rules={[{required:true}]}><InputNumber min={1} style={{width:'100%'}}/></Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={<div>Soạn đề: <b>{currentQuiz?.title}</b> <Tag color="blue">{selectedQuestionIds.length} câu</Tag></div>}
        width="calc(100vw - 100px)" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}
        extra={<Button type="primary" onClick={handleSaveAssignments}>Lưu Cấu Trúc</Button>}
        bodyStyle={{background: '#f0f2f5', padding: 16}}
      >
        <div className="assign-layout">
           <div className="assign-panel source-panel">
              <div className="assign-panel-header">
                 <div className="header-title">Ngân hàng câu hỏi</div>
                 <div style={{display:'flex', gap: 5, marginTop: 5}}>
                     <Input prefix={<SearchOutlined />} placeholder="Tìm nội dung..." value={questionSearch} onChange={e => setQuestionSearch(e.target.value)} />
                     <Input prefix={<TagOutlined />} placeholder="Tag..." style={{width: 100}} value={tagSearch} onChange={e => setTagSearch(e.target.value)} />
                 </div>
              </div>
              <div className="assign-list-area">
                 {filteredSourceQuestions.map(q => (
                    <div key={q.question_id} className={`q-item-card source ${checkedIds.includes(q.question_id)?'checked':''}`} onClick={() => handleCheckSource(q.question_id)}>
                       <Checkbox checked={checkedIds.includes(q.question_id)} />
                       <div className="q-content">
                          <div className="q-text">{q.question_text}</div>
                          <div style={{display:'flex', gap: 4, marginTop: 4}}>
                             <Tag>{q.category || 'Chung'}</Tag>
                             <Tag color={q.type === QUESTION_TYPES.MULTIPLE_CHOICE ? 'blue' : 'purple'}>
                                {QUESTION_TYPE_LABELS[q.type]}
                             </Tag>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="assign-actions-middle">
              <Button type="primary" icon={<DoubleRightOutlined />} disabled={checkedIds.length===0} onClick={handleAddBatch} shape="circle" size="large" />
           </div>

           <div className="assign-panel selected-panel">
              <div className="assign-panel-header selected-header">
                 <div className="header-title selected-text">Đã chọn ({selectedQuestionIds.length})</div>
                 <Button size="small" danger type="dashed" onClick={() => setSelectedQuestionIds([])}>Xóa hết</Button>
              </div>
              <div className="assign-list-area bg-white">
                 {selectedQuestionsObjects.map((q, idx) => (
                    <div key={q.question_id} className="q-item-card in-quiz">
                       <div className="q-index">#{idx + 1}</div>
                       <div className="q-content">
                          <div className="q-text">{q.question_text}</div>
                          <div style={{fontSize: 11, color: '#888'}}>{QUESTION_TYPE_LABELS[q.type]}</div>
                       </div>
                       <DeleteFilled style={{color: '#ff4d4f', cursor:'pointer'}} onClick={() => setSelectedQuestionIds(prev => prev.filter(pid => pid !== q.question_id))} />
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </Drawer>
    </div>
  );
}