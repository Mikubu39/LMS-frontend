// ✅ src/pages/admin/QuestionManager.jsx
import { useEffect, useState, useMemo } from "react";
import { 
  Button, Input, Table, Tag, message, 
  Popconfirm, Upload, Modal, Form, Radio 
} from "antd";
import { 
  PlusOutlined, DeleteOutlined, EditOutlined, 
  FileExcelOutlined, DownloadOutlined
} from "@ant-design/icons";

import { QuestionApi } from "@/services/api/questionApi";
import "@/css/question-manager.css";

const { TextArea } = Input;

// Danh sách bộ lọc bên trái
const FILTER_TYPES = [
  "Mặc định", "Trắc nghiệm", "Sắp xếp câu", "Ghép đôi", 
  "Điền từ", "Chọn đáp án", "Bài nộp file"
];

export default function QuestionManager() {
  // --- STATE ---
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filter & Search State
  const [activeFilter, setActiveFilter] = useState("Mặc định");
  const [searchText, setSearchText] = useState("");
  const [searchTag, setSearchTag] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Modal State (Thêm / Sửa)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null); // null = create mode
  const [form] = Form.useForm();
  const [modalLoading, setModalLoading] = useState(false);

  // --- 1. FETCH DATA ---
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await QuestionApi.getAll();
      // Sắp xếp: Mới nhất lên đầu
      const sorted = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setQuestions(sorted);
    } catch (error) {
      console.error(error);
      message.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // --- 2. LOGIC LỌC & TÌM KIẾM (Frontend Filter) ---
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // 1. Lọc theo text tìm kiếm
      const matchText = !searchText || q.question_text.toLowerCase().includes(searchText.toLowerCase());
      
      // 2. Lọc theo Tag input
      const matchTagInput = !searchTag || (q.category && q.category.toLowerCase().includes(searchTag.toLowerCase()));

      // 3. Lọc theo Sidebar (Giả định: Lọc theo Category, nếu "Mặc định" thì lấy hết)
      // Nếu entity của bạn không có field 'type', ta tạm dùng field 'category' để lọc tương đối
      let matchFilter = true;
      if (activeFilter !== "Mặc định") {
        // Logic: Nếu chọn filter bên trái, chỉ hiện câu nào có category chứa tên filter đó
        matchFilter = q.category && q.category.toLowerCase().includes(activeFilter.toLowerCase());
      }

      return matchText && matchTagInput && matchFilter;
    });
  }, [questions, searchText, searchTag, activeFilter]);

  // --- 3. HANDLERS CHỨC NĂNG ---

  // Xóa câu hỏi
  const handleDelete = async (id) => {
    try {
      await QuestionApi.delete(id);
      message.success("Đã xóa câu hỏi");
      fetchQuestions();
    } catch (err) {
      message.error("Lỗi khi xóa");
    }
  };

  // Import Excel
  const handleImport = async (file) => {
    try {
      const res = await QuestionApi.importExcel(file);
      message.success(`Đã import ${res.imported} câu hỏi!`);
      fetchQuestions();
    } catch (err) {
      message.error("Lỗi import file");
    }
    return false; // Prevent auto upload
  };

  // Tải file mẫu (Tạo file CSV ảo)
  const handleDownloadTemplate = () => {
    const header = "question_text,category,option_a,option_b,option_c,option_d,correct_answer";
    const row = "Câu hỏi mẫu?,Kiến thức chung,Đáp án A,Đáp án B,Đáp án C,Đáp án D,a";
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + header + "\n" + row;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "mau_nhap_cau_hoi.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mở Modal Thêm
  const openCreateModal = () => {
    setEditingQuestion(null);
    form.resetFields();
    form.setFieldsValue({ correct_answer: 'a' }); // Default select A
    setIsModalOpen(true);
  };

  // Mở Modal Sửa
  const openEditModal = (record) => {
    setEditingQuestion(record);
    form.setFieldsValue({
      question_text: record.question_text,
      category: record.category,
      option_a: record.option_a,
      option_b: record.option_b,
      option_c: record.option_c,
      option_d: record.option_d,
      correct_answer: record.correct_answer,
    });
    setIsModalOpen(true);
  };

  // Submit Form (Thêm hoặc Sửa)
  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setModalLoading(true);

      if (editingQuestion) {
        // Update
        await QuestionApi.update(editingQuestion.question_id, values);
        message.success("Cập nhật thành công");
      } else {
        // Create
        await QuestionApi.create(values);
        message.success("Tạo câu hỏi thành công");
      }

      setIsModalOpen(false);
      fetchQuestions();
    } catch (err) {
      console.error(err);
      message.error("Có lỗi xảy ra, vui lòng kiểm tra lại");
    } finally {
      setModalLoading(false);
    }
  };

  // --- TABLE COLUMNS CONFIG ---
  const columns = [
    {
      title: 'Câu hỏi',
      dataIndex: 'question_text',
      key: 'question_text',
      width: '55%',
      render: (text) => (
        <div className="qm-question-box">
          {text}
        </div>
      ),
    },
    {
      title: 'Tag',
      dataIndex: 'category',
      key: 'category',
      align: 'center',
      width: '20%',
      render: (cat) => (
        <Tag color="blue">{cat || 'Chung'}</Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      width: '15%',
      render: (_, record) => (
        <div className="qm-action-group" style={{justifyContent:'center'}}>
          <Button 
            className="qm-action-btn edit" 
            icon={<EditOutlined />} 
            onClick={() => openEditModal(record)} 
          />
          <Popconfirm title="Xóa?" onConfirm={() => handleDelete(record.question_id)}>
            <Button className="qm-action-btn delete" icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="qm-page-container">
      {/* 1. Top Toolbar */}
      <div className="qm-top-toolbar" style={{justifyContent:'flex-end', marginBottom: 10}}>
         <div style={{display:'flex', gap: 10}}>
             <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
                Tải file mẫu
             </Button>
         </div>
      </div>

      {/* 2. Main Body */}
      <div className="qm-body-layout">
         
         {/* --- LEFT SIDEBAR FILTER --- */}
         <aside className="qm-sidebar-filter">
            <div className="qm-filter-title">Lọc câu hỏi</div>
            
            <Button type="primary" className="qm-sidebar-btn-primary" icon={<PlusOutlined />} onClick={openCreateModal}>
               Thêm câu hỏi
            </Button>
            
            <Upload beforeUpload={handleImport} showUploadList={false} accept=".xlsx,.xls,.csv">
                    {/* 👇 Thêm thuộc tính block vào Button */}
                    <Button block className="qm-sidebar-btn-excel" icon={<FileExcelOutlined style={{color: 'green'}} />}>
                    Tải danh sách
                    </Button>
                </Upload>

            <div className="qm-filter-divider"></div>

            <div className="qm-filter-list">
               {FILTER_TYPES.map(type => (
                 <div 
                    key={type} 
                    className={`qm-filter-item ${activeFilter === type ? 'active' : ''}`}
                    onClick={() => setActiveFilter(type)}
                 >
                    {type}
                 </div>
               ))}
            </div>
         </aside>

         {/* --- RIGHT CONTENT TABLE --- */}
         <main className="qm-content-area">
            <div className="qm-content-header">Danh sách câu hỏi ({filteredQuestions.length})</div>

            {/* Search Bars */}
            <div className="qm-search-row">
               <Input 
                  placeholder="Tìm kiếm nội dung câu hỏi..." 
                  className="qm-search-input" 
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
               />
               <Input 
                  placeholder="Tìm kiếm tag (category)..." 
                  className="qm-search-input" 
                  value={searchTag}
                  onChange={(e) => setSearchTag(e.target.value)}
               />
            </div>

            {/* Table */}
            <Table
               rowSelection={{
                 selectedRowKeys,
                 onChange: setSelectedRowKeys
               }}
               columns={columns}
               dataSource={filteredQuestions}
               rowKey="question_id"
               loading={loading}
               pagination={{ pageSize: 8 }}
               bordered={false}
            />
         </main>
      </div>

      {/* --- MODAL THÊM / SỬA --- */}
      <Modal
        title={editingQuestion ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
        open={isModalOpen}
        onOk={handleModalSubmit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={modalLoading}
        width={700}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" style={{marginTop: 20}}>
           <div style={{display: 'flex', gap: 16}}>
              <Form.Item name="category" label="Tag / Danh mục" style={{flex: 1}}>
                 <Input placeholder="Ví dụ: ReactJS, Trắc nghiệm..." />
              </Form.Item>
           </div>
           
           <Form.Item 
              name="question_text" 
              label="Nội dung câu hỏi" 
              rules={[{required: true, message: 'Vui lòng nhập câu hỏi'}]}
           >
              <TextArea rows={3} placeholder="Nhập câu hỏi..." />
           </Form.Item>

           <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16}}>
              <Form.Item name="option_a" label="Đáp án A" rules={[{required: true}]}>
                 <Input />
              </Form.Item>
              <Form.Item name="option_b" label="Đáp án B" rules={[{required: true}]}>
                 <Input />
              </Form.Item>
              <Form.Item name="option_c" label="Đáp án C" rules={[{required: true}]}>
                 <Input />
              </Form.Item>
              <Form.Item name="option_d" label="Đáp án D" rules={[{required: true}]}>
                 <Input />
              </Form.Item>
           </div>

           <Form.Item name="correct_answer" label="Đáp án đúng" rules={[{required: true}]}>
              <Radio.Group buttonStyle="solid">
                 <Radio.Button value="a">A</Radio.Button>
                 <Radio.Button value="b">B</Radio.Button>
                 <Radio.Button value="c">C</Radio.Button>
                 <Radio.Button value="d">D</Radio.Button>
              </Radio.Group>
           </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}