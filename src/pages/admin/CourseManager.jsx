// ✅ src/pages/admin/CourseManager.jsx
import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Button, Input, Tree, Modal, Form, message, 
  Popconfirm, Spin, Typography, Empty, Alert, Breadcrumb, Select 
} from "antd";
import { 
  ArrowLeftOutlined, PlusOutlined, DeleteOutlined, 
  FolderOpenOutlined, FileOutlined, VideoCameraFilled, 
  ReadOutlined, ExperimentOutlined, SaveOutlined, 
  AppstoreOutlined, EditOutlined, RightOutlined, SearchOutlined // 👈 Import SearchOutlined
} from "@ant-design/icons";

// Import API
import { CourseApi } from "@/services/api/courseApi.jsx";
import { SessionApi } from "@/services/api/sessionApi.jsx";
import { LessonApi } from "@/services/api/lessonApi.jsx";
import { QuizApi } from "@/services/api/quizApi.jsx";

import "@/css/course-manager.css";

const { TextArea } = Input;
const { Title } = Typography;
const { Option } = Select;

const ICONS = {
  SESSION: <FolderOpenOutlined style={{ color: '#f59e0b', fontSize: 16 }} />, 
  LESSON: <FileOutlined style={{ color: '#6b7280' }} />,    
  VIDEO: <VideoCameraFilled style={{ color: '#ef4444' }} />, 
  TEXT: <ReadOutlined style={{ color: '#3b82f6' }} />,
  QUIZ: <ExperimentOutlined style={{ color: '#10b981' }} />,
  ESSAY: <EditOutlined style={{ color: '#8b5cf6' }} />,
};

export default function CourseManager() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [course, setCourse] = useState(null);
  const [treeData, setTreeData] = useState([]); 
  const [rawData, setRawData] = useState([]);   
  const [loading, setLoading] = useState(false);

  // State danh sách Quiz
  const [quizList, setQuizList] = useState([]); 

  const [selectedKeys, setSelectedKeys] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null); 
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState(""); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null); 
  const [addItemType, setAddItemType] = useState(null); 

  // --- BUILD TREE ---
  const buildTree = (sessions) => {
    return sessions.map((session, index) => ({
      title: <span style={{ fontWeight: 600, color: '#1f2937' }}>Chương {index + 1}: {session.title}</span>,
      key: `session-${session.id}`,
      icon: ICONS.SESSION,
      data: { ...session, type: 'session' }, 
      children: (session.lessons || []).map((lesson, lIdx) => ({
        title: <span style={{ color: '#4b5563' }}>{lIdx + 1}. {lesson.title}</span>,
        key: `lesson-${lesson.id}`,
        icon: ICONS.LESSON,
        data: { ...lesson, type: 'lesson' },
        children: (lesson.items || []).map(item => ({
          title: item.title || item.type, 
          key: `item-${item.id}`,
          icon: ICONS[item.type?.toUpperCase()] || ICONS.TEXT,
          isLeaf: true,
          data: { ...item, type: 'item', itemType: item.type, parentLessonId: lesson.id },
        }))
      }))
    }));
  };

  // --- FETCH DATA ---
  const fetchFullData = useCallback(async () => {
    setLoading(true);
    try {
      const [courseRes, sessionRes, quizzes] = await Promise.all([
        CourseApi.getCourseById(courseId),
        SessionApi.getSessionsByCourse(courseId),
        QuizApi.getAll()
      ]);

      setCourse(courseRes);
      setQuizList(quizzes || []);

      const sortedData = sessionRes.map(session => {
        const sortedLessons = (session.lessons || []).sort((a, b) => (a.order || 0) - (b.order || 0));
        sortedLessons.forEach(lesson => {
           if (lesson.items) lesson.items.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
        });
        return { ...session, lessons: sortedLessons };
      });
      sortedData.sort((a, b) => (a.order || 0) - (b.order || 0));

      setRawData(sortedData);
      setTreeData(buildTree(sortedData)); 

    } catch (err) {
      console.error(err);
      message.error("Không thể tải dữ liệu khoá học");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchFullData();
  }, [fetchFullData]);

  // --- HANDLERS ---
  const handleSelect = (keys, info) => {
    if (keys.length > 0) {
      const node = info.node;
      setSelectedKeys(keys);
      setSelectedNode(node.data); 
      setEditTitle(node.data.title || "");
      setEditContent(""); 
      
      if (node.data.type === 'item') {
        const type = node.data.itemType;
        if (type === 'Video') setEditContent(node.data.videoUrl || "");
        else if (type === 'Text' || type === 'Essay') setEditContent(node.data.textContent || "");
        else if (type === 'Quiz') setEditContent(node.data.resource_quiz_id || "");
      }
    }
  };

  const openModal = (action, type = null) => {
    setModalAction(action);
    setAddItemType(type);
    form.resetFields();
    if (action === 'ADD_SESSION') form.setFieldsValue({ title: `Chương mới` });
    if (action === 'ADD_LESSON') form.setFieldsValue({ title: `Bài học mới` });
    if (action === 'ADD_ITEM') form.setFieldsValue({ title: `${type} mới` });
    setIsModalOpen(true);
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (modalAction === 'ADD_SESSION') {
        await SessionApi.createSession({ title: values.title, courseId, order: rawData.length + 1 });
        message.success("Thêm chương thành công");
      } 
      else if (modalAction === 'ADD_LESSON') {
        let sessionId = selectedNode?.type === 'session' ? selectedNode.id : selectedNode?.sessionId;
        await LessonApi.createLesson({ title: values.title, sessionId: sessionId, order: 99 });
        message.success("Thêm bài học thành công");
      } 
      else if (modalAction === 'ADD_ITEM') {
        let lessonId = selectedNode?.type === 'lesson' ? selectedNode.id : null;
        const payload = { type: addItemType, title: values.title };
        
        if (addItemType === 'Video') payload.videoUrl = values.content;
        else if (addItemType === 'Text' || addItemType === 'Essay') payload.textContent = values.content;
        else if (addItemType === 'Quiz') payload.quizId = values.content; 

        await LessonApi.addLessonItem(lessonId, payload);
        message.success(`Thêm ${addItemType} thành công`);
      }
      setIsModalOpen(false);
      fetchFullData();
    } catch (err) { message.error("Có lỗi xảy ra"); }
  };

  const handleSave = async () => {
    if (!selectedNode) return;
    try {
      if (selectedNode.type === 'session') await SessionApi.updateSession(selectedNode.id, { title: editTitle });
      else if (selectedNode.type === 'lesson') await LessonApi.updateLesson(selectedNode.id, { title: editTitle });
      else if (selectedNode.type === 'item') {
        const payload = { title: editTitle };
        const type = selectedNode.itemType;
        if (type === 'Video') payload.videoUrl = editContent;
        else if (type === 'Text' || type === 'Essay') payload.textContent = editContent;
        else if (type === 'Quiz') payload.quizId = editContent;
        
        await LessonApi.updateLessonItem(selectedNode.id, payload);
      }
      message.success("Đã lưu thay đổi");
      fetchFullData();
    } catch (err) { message.error("Lỗi khi lưu"); }
  };

  const handleDelete = async () => {
    if (!selectedNode) return;
    try {
      if (selectedNode.type === 'session') await SessionApi.deleteSession(selectedNode.id);
      else if (selectedNode.type === 'lesson') await LessonApi.deleteLesson(selectedNode.id);
      else if (selectedNode.type === 'item') await LessonApi.deleteLessonItem(selectedNode.id);
      message.success("Đã xoá thành công");
      setSelectedNode(null);
      setSelectedKeys([]);
      fetchFullData();
    } catch (err) { message.error("Lỗi khi xoá"); }
  };

  return (
    <div className="course-manager-container">
      <header className="cm-header">
        <div style={{display:'flex', alignItems:'center'}}>
           <Button type="text" icon={<ArrowLeftOutlined style={{fontSize: 18}}/>} onClick={() => navigate(-1)} />
           <div className="cm-header-title">{course?.title || "Quản lý nội dung"}</div>
        </div>
        <div><Button>Xem trước khoá học</Button></div>
      </header>

      <div className="cm-body">
        {/* SIDEBAR */}
        <aside className="cm-sidebar">
           <div className="cm-sidebar-toolbar">
              <Button type="primary" block icon={<PlusOutlined />} onClick={() => openModal('ADD_SESSION')}>
                Tạo Chương Mới
              </Button>
           </div>
           <div className="cm-sidebar-content">
             {loading ? <div style={{textAlign:'center', marginTop: 40}}><Spin /></div> : (
               <Tree
                 showIcon
                 blockNode
                 defaultExpandAll
                 selectedKeys={selectedKeys}
                 onSelect={handleSelect}
                 treeData={treeData}
                 className="cm-tree"
               />
             )}
           </div>
        </aside>

        {/* EDITOR PANEL */}
        <main className="cm-content">
          {!selectedNode ? (
             <div className="cm-empty-state">
               <AppstoreOutlined style={{fontSize: 64, color: '#e5e7eb', marginBottom: 20}} />
               <Title level={4} style={{color: '#9ca3af', fontWeight: 500}}>Chọn nội dung để chỉnh sửa</Title>
               <p style={{color: '#9ca3af'}}>Chọn chương hoặc bài học từ danh sách bên trái để bắt đầu.</p>
             </div>
          ) : (
            <div className="cm-editor-panel">
               <Breadcrumb separator={<RightOutlined size="small" style={{fontSize: 10}}/>} style={{marginBottom: 20, color: '#6b7280'}}>
                  <Breadcrumb.Item>{course?.title}</Breadcrumb.Item>
                  <Breadcrumb.Item>{selectedNode.title}</Breadcrumb.Item>
               </Breadcrumb>

               <div className="cm-editor-header">
                  <div>
                    <span className="cm-node-tag" style={{
                        background: selectedNode.type === 'session' ? '#fff7ed' : '#eff6ff', 
                        color: selectedNode.type === 'session' ? '#c2410c' : '#2563eb',
                        border: selectedNode.type === 'session' ? '1px solid #fed7aa' : '1px solid #bfdbfe'
                    }}>
                        {selectedNode.type === 'item' ? selectedNode.itemType : selectedNode.type}
                    </span>
                    <Title level={3} style={{margin: '12px 0 0 0', fontWeight: 700}}>
                        {selectedNode.type === 'item' ? 'Chi tiết nội dung' : 'Thông tin chung'}
                    </Title>
                  </div>
                  <div className="cm-header-actions">
                    <Popconfirm title="Bạn có chắc chắn muốn xoá mục này?" okText="Xoá" cancelText="Hủy" onConfirm={handleDelete}>
                       <Button danger type="text" icon={<DeleteOutlined />}>Xoá</Button>
                    </Popconfirm>
                    <Button type="primary" size="large" icon={<SaveOutlined />} onClick={handleSave} style={{padding: '0 30px'}}>
                        Lưu thay đổi
                    </Button>
                  </div>
               </div>

               <div className="cm-editor-form">
                   <div className="cm-form-section">
                     <label>Tiêu đề hiển thị</label>
                     <Input size="large" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                   </div>

                   {selectedNode.type === 'session' && (
                     <Alert 
                        message="Quản lý Chương học" 
                        description="Đây là thư mục chứa các bài học. Bấm vào nút bên dưới để thêm bài học mới." 
                        type="info" showIcon 
                        action={<Button size="small" type="primary" onClick={() => openModal('ADD_LESSON')}>+ Thêm Bài Học</Button>}
                     />
                   )}

                   {selectedNode.type === 'lesson' && (
                     <div className="cm-lesson-actions">
                        <Title level={5} style={{marginTop: 0, color: '#333'}}>Thêm nội dung vào bài học này</Title>
                        <div className="cm-action-grid">
                          <Button size="large" icon={<VideoCameraFilled style={{color: '#ef4444'}}/>} onClick={() => openModal('ADD_ITEM', 'Video')}>Video</Button>
                          <Button size="large" icon={<ReadOutlined style={{color: '#3b82f6'}}/>} onClick={() => openModal('ADD_ITEM', 'Text')}>Bài đọc</Button>
                          <Button size="large" icon={<EditOutlined style={{color: '#8b5cf6'}}/>} onClick={() => openModal('ADD_ITEM', 'Essay')}>Tự luận</Button>
                          <Button size="large" icon={<ExperimentOutlined style={{color: '#10b981'}}/>} onClick={() => openModal('ADD_ITEM', 'Quiz')}>Quiz</Button>
                        </div>
                     </div>
                   )}

                   {selectedNode.type === 'item' && (
                      <div className="cm-form-section">
                         {/* VIDEO */}
                         {selectedNode.itemType === 'Video' && (
                           <>
                             <label>YouTube Video URL</label>
                             <Input size="large" prefix={<VideoCameraFilled style={{color:'#ccc'}}/>} value={editContent} onChange={(e) => setEditContent(e.target.value)} placeholder="https://youtube.com/..." />
                             {editContent && <div style={{marginTop: 20, borderRadius: 12, overflow: 'hidden', height: 300}}><iframe width="100%" height="100%" src={editContent.replace("watch?v=", "embed/")} frameBorder="0" allowFullScreen /></div>}
                           </>
                         )}

                         {/* TEXT / ESSAY */}
                         {(selectedNode.itemType === 'Text' || selectedNode.itemType === 'Essay') && (
                           <>
                             <label>{selectedNode.itemType === 'Essay' ? 'Đề bài luận (Câu hỏi)' : 'Nội dung bài học'}</label>
                             <TextArea rows={18} value={editContent} onChange={(e) => setEditContent(e.target.value)} placeholder="Nhập nội dung..." />
                           </>
                         )}

                         {/* QUIZ SELECT NÂNG CẤP */}
                         {selectedNode.itemType === 'Quiz' && (
                           <>
                             <label>Chọn Bộ đề (Quiz)</label>
                             <Select
                                showSearch
                                allowClear
                                size="large"
                                style={{ width: '100%' }}
                                placeholder="Tìm kiếm tên bộ đề..."
                                value={editContent} // Binding ID quiz
                                onChange={setEditContent}
                                suffixIcon={<SearchOutlined />} // 👈 Thêm icon kính lúp
                                filterOption={(input, option) => 
                                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={quizList.map(q => ({
                                   value: q.quiz_id,
                                   label: `${q.title} (${q.duration} phút)`
                                }))}
                                notFoundContent={<Empty description="Không tìm thấy Quiz nào" />}
                             />
                             <div style={{marginTop: 15, padding: 15, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, color: '#166534'}}>
                                <ExperimentOutlined style={{marginRight: 8}} />
                                <strong>Thông tin:</strong> Học viên sẽ làm bài trắc nghiệm dựa trên bộ đề này.
                             </div>
                           </>
                         )}
                      </div>
                   )}
               </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL CREATE */}
      <Modal
        title={<span style={{fontSize: 18, fontWeight: 600}}>
            {modalAction === 'ADD_SESSION' ? "Thêm Chương Mới" : 
             modalAction === 'ADD_LESSON' ? "Thêm Bài Học Mới" : 
             `Thêm ${addItemType}`}
        </span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleModalSubmit}
        centered
        width={500}
      >
        <Form form={form} layout="vertical" style={{marginTop: 24}}>
          <Form.Item name="title" label="Tiêu đề" rules={[{required:true, message: "Vui lòng nhập tiêu đề"}]}>
            <Input size="large" placeholder="Nhập tiêu đề..." />
          </Form.Item>
          
          {modalAction === 'ADD_ITEM' && (
             <Form.Item 
                name="content" 
                label={addItemType === 'Video' ? 'Link Video' : addItemType === 'Quiz' ? 'Chọn Quiz' : 'Nội dung'}
                rules={[{ required: addItemType !== 'Quiz' }]}
             >
                {/* LOGIC SELECT TRONG MODAL */}
                {addItemType === 'Quiz' ? (
                   <Select
                      showSearch
                      allowClear
                      size="large"
                      placeholder="Gõ tên để tìm kiếm bộ đề..."
                      suffixIcon={<SearchOutlined />}
                      filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                      options={quizList.map(q => ({
                         value: q.quiz_id,
                         label: `${q.title} (${q.duration} phút)`
                      }))}
                      notFoundContent={<Empty description="Chưa có Quiz nào" />}
                   />
                ) : addItemType === 'Text' || addItemType === 'Essay' ? (
                    <TextArea rows={6} placeholder="Nhập nội dung..." />
                ) : (
                    <Input size="large" placeholder="Nhập link..." />
                )}
             </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}