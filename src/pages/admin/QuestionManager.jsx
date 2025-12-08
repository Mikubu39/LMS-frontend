// ✅ src/pages/admin/QuestionManager.jsx
import { useEffect, useState, useMemo } from "react";
import { 
  Button, Input, Table, Tag, message, 
  Popconfirm, Upload, Modal, Form, Select, Checkbox, Space, Alert, Dropdown, Menu 
} from "antd";
import { 
  PlusOutlined, DeleteOutlined, EditOutlined, 
  FileExcelOutlined, DownloadOutlined, MinusCircleOutlined, DownOutlined,
  SearchOutlined, TagOutlined 
} from "@ant-design/icons";

import { QuestionApi } from "@/services/api/questionApi";
import { QUESTION_TYPES, QUESTION_TYPE_LABELS } from "@/constant"; 
import CkEditorField from "@/components/form/CkEditorField"; 
import "@/css/question-manager.css";

const { Option } = Select;

export default function QuestionManager() {
  // --- STATE ---
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State lọc & Tìm kiếm
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [searchTag, setSearchTag] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null); 
  const [form] = Form.useForm();
  const [modalLoading, setModalLoading] = useState(false);
  const [currentType, setCurrentType] = useState(QUESTION_TYPES.MULTIPLE_CHOICE);
  const [blankAnswers, setBlankAnswers] = useState({});
  const [detectedBlanks, setDetectedBlanks] = useState(0);

  // Helper xóa HTML tag để search text thuần
  const stripHtml = (html) => {
     const doc = new DOMParser().parseFromString(html, 'text/html');
     return doc.body.textContent || "";
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await QuestionApi.getAll();
      setQuestions(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (error) { 
      message.error("Lỗi tải dữ liệu"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchQuestions(); }, []);

  // --- LOGIC LỌC DỮ LIỆU ---
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
        // 1. Lọc theo Tab (Loại câu hỏi)
        const matchType = activeFilter === "ALL" || q.type === activeFilter;

        // 2. Lọc theo nội dung (Bỏ qua HTML tag)
        const plainText = stripHtml(q.question_text || "").toLowerCase();
        const matchText = !searchText || plainText.includes(searchText.toLowerCase());

        // 3. Lọc theo Tag
        const matchTag = !searchTag || (q.category || "").toLowerCase().includes(searchTag.toLowerCase());

        return matchType && matchText && matchTag;
    });
  }, [questions, activeFilter, searchText, searchTag]);

  const handleDelete = async (id) => {
    try { 
      await QuestionApi.delete(id); 
      message.success("Đã xóa câu hỏi"); 
      fetchQuestions(); 
    } catch (err) { 
      message.error("Lỗi xóa câu hỏi"); 
    }
  };

  const handleImport = async (file) => {
    try {
      const res = await QuestionApi.importExcel(file);
      message.success(`Đã import: ${res.imported} thành công. Lỗi: ${res.errors.length}`); 
      if (res.errors && res.errors.length > 0) {
        Modal.warning({
            title: 'Import có cảnh báo',
            content: (
                <div style={{maxHeight: 300, overflow: 'auto'}}>
                    <p>Đã import được {res.imported} câu.</p>
                    <p>Các dòng lỗi:</p>
                    <ul>{res.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
                </div>
            )
        });
      }
      fetchQuestions();
    } catch (err) { 
      message.error("Lỗi import file. Vui lòng kiểm tra lại định dạng."); 
    }
    return false; 
  };

  const handleDownloadTemplate = (type) => {
    let headers = [];
    let sampleRow = [];
    let fileName = "";

    if (type === 'MC') {
        headers = ["type", "question_text", "option_a", "option_b", "option_c", "option_d", "correct_answer", "category"];
        sampleRow = ["MULTIPLE_CHOICE", "Thủ đô của Việt Nam là gì?", "Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "b", "Địa lý"];
        fileName = "Mau_Trac_Nghiem.csv";
    } else {
        headers = ["type", "question_text", "correct_answers", "category"];
        sampleRow = ["FILL_IN_THE_BLANK", "Con mèo trèo cây __ để bắt __", "cau;chuột", "Sinh học"];
        fileName = "Mau_Dien_Tu.csv";
    }

    // Thêm BOM \uFEFF để Excel hiển thị đúng tiếng Việt
    const csvContent = "\uFEFF" + [headers, sampleRow]
      .map(e => e.map(item => `"${item}"`).join(",")) 
      .join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const templateMenu = (
    <Menu items={[
        { key: '1', label: 'Mẫu Trắc Nghiệm', onClick: () => handleDownloadTemplate('MC') },
        { key: '2', label: 'Mẫu Điền Từ', onClick: () => handleDownloadTemplate('FB') },
    ]} />
  );

  const openCreateModal = () => {
    setEditingQuestion(null);
    form.resetFields();
    setBlankAnswers({});
    setDetectedBlanks(0);
    setCurrentType(QUESTION_TYPES.MULTIPLE_CHOICE);
    form.setFieldsValue({
        type: QUESTION_TYPES.MULTIPLE_CHOICE,
        answers: [{ answer: '', isCorrect: true }, { answer: '', isCorrect: false }]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingQuestion(record);
    setCurrentType(record.type);

    if (record.type === QUESTION_TYPES.FILL_IN_THE_BLANK) {
        const answers = record.answers || [];
        const sortedAnswers = [...answers].sort((a, b) => a.index - b.index);
        const answerMap = {};
        sortedAnswers.forEach((ans, i) => { answerMap[i] = ans.answer; });
        setBlankAnswers(answerMap);
        const matches = (record.question_text || "").match(/__+/g);
        setDetectedBlanks(matches ? matches.length : 0);
    } else {
        setBlankAnswers({});
        setDetectedBlanks(0);
    }
    
    form.setFieldsValue({
      question_text: record.question_text,
      category: record.category,
      type: record.type,
      answers: record.answers || [] 
    });
    setIsModalOpen(true);
  };

  const handleQuestionTextChange = (data) => {
      form.setFieldsValue({ question_text: data });
      const matches = data.match(/__+/g);
      const count = matches ? matches.length : 0;
      setDetectedBlanks(count);
  };

  const handleBlankAnswerChange = (index, value) => {
      setBlankAnswers(prev => ({ ...prev, [index]: value }));
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setModalLoading(true);
      let finalPayload = { ...values };

      if (values.type === QUESTION_TYPES.FILL_IN_THE_BLANK) {
          const htmlContent = values.question_text || "";
          const plainText = stripHtml(htmlContent);
          const words = plainText.split(/\s+/);
          const generatedAnswers = [];
          let blankCounter = 0;

          words.forEach((word, wordIndex) => {
              if (word.includes('__')) {
                  const ansText = blankAnswers[blankCounter];
                  if (ansText && ansText.trim() !== "") {
                      generatedAnswers.push({ index: wordIndex, answer: ansText.trim(), isCorrect: true });
                  }
                  blankCounter++;
              }
          });

          if (generatedAnswers.length === 0) {
              message.error("Vui lòng nhập đáp án cho các ô trống!");
              setModalLoading(false);
              return;
          }
          if (generatedAnswers.length < detectedBlanks) {
             message.warning("Bạn chưa điền đủ đáp án!");
             setModalLoading(false);
             return;
          }
          finalPayload.answers = generatedAnswers;
      }

      if (editingQuestion) {
        await QuestionApi.update(editingQuestion.question_id, finalPayload);
        message.success("Cập nhật thành công");
      } else {
        await QuestionApi.create(finalPayload);
        message.success("Tạo thành công");
      }
      setIsModalOpen(false); 
      fetchQuestions();
    } catch (err) {
      console.error(err);
    } finally { 
      setModalLoading(false); 
    }
  };

  const columns = [
    {
      title: 'Câu hỏi', 
      dataIndex: 'question_text', 
      key: 'question_text', 
      width: '45%',
      render: (text, record) => (
        <div>
           <div style={{fontWeight: 500, maxHeight: 60, overflow: 'hidden', textOverflow: 'ellipsis'}} dangerouslySetInnerHTML={{ __html: text }} />
           <Tag color={record.type === QUESTION_TYPES.MULTIPLE_CHOICE ? 'geekblue' : 'purple'} style={{marginTop:4, fontSize:10}}>
              {QUESTION_TYPE_LABELS[record.type]}
           </Tag>
        </div>
      ),
    },
    { title: 'Tag', dataIndex: 'category', align: 'center', render: cat => <Tag>{cat || 'Chung'}</Tag> },
    {
      title: 'Hành động', key: 'action', align: 'center',
      render: (_, r) => (
        <div className="qm-action-group" style={{justifyContent:'center'}}>
          <Button className="qm-action-btn edit" icon={<EditOutlined />} onClick={() => openEditModal(r)} />
          <Popconfirm title="Xóa câu hỏi này?" onConfirm={() => handleDelete(r.question_id)}>
            <Button className="qm-action-btn delete" icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="qm-page-container">
      {/* --- TOOLBAR RESPONSIVE --- */}
      <div 
        className="qm-top-toolbar" 
        style={{
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 16, 
            background: '#fff',
            padding: '16px 24px',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            flexWrap: 'wrap', // Responsive: Xuống dòng khi màn hình nhỏ
            gap: 16
        }}
      >
         {/* Nhóm bộ lọc */}
         <div style={{display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', flex: 1}}>
             <span style={{fontWeight: 600, color: '#595959', whiteSpace: 'nowrap'}}>Tìm kiếm:</span>
             
             {/* 1. Ô tìm kiếm Nội dung */}
             <Input 
                placeholder="Nhập nội dung câu hỏi..." 
                prefix={<SearchOutlined style={{color: '#bfbfbf'}} />} 
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ width: '100%', maxWidth: 300, minWidth: 200 }} 
             />
             
             {/* 2. Ô tìm kiếm Tag */}
             <Input 
                placeholder="Theo Tag..." 
                prefix={<TagOutlined style={{color: '#bfbfbf'}} />} 
                value={searchTag}
                onChange={(e) => setSearchTag(e.target.value)}
                allowClear
                style={{ width: '100%', maxWidth: 200, minWidth: 150 }}
             />
         </div>

         {/* Nhóm hành động */}
         <Dropdown overlay={templateMenu} trigger={['click']}>
            <Button icon={<DownloadOutlined />}>
               Tải Template <DownOutlined />
            </Button>
         </Dropdown>
      </div>

      <div className="qm-body-layout">
         <aside className="qm-sidebar-filter">
            <div className="qm-filter-title">Bộ lọc</div>
            <Button type="primary" className="qm-sidebar-btn-primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              Thêm câu hỏi
            </Button>
            
            <Upload beforeUpload={handleImport} showUploadList={false} accept=".xlsx,.xls,.csv">
              <Button block className="qm-sidebar-btn-excel" icon={<FileExcelOutlined style={{color: 'green'}} />}>
                Import Excel
              </Button>
            </Upload>
            
            <div className="qm-filter-divider"></div>
            
            <div className={`qm-filter-item ${activeFilter==='ALL'?'active':''}`} onClick={()=>setActiveFilter('ALL')}>Tất cả</div>
            <div className={`qm-filter-item ${activeFilter===QUESTION_TYPES.FILL_IN_THE_BLANK?'active':''}`} onClick={()=>setActiveFilter(QUESTION_TYPES.FILL_IN_THE_BLANK)}>Điền từ</div>
            <div className={`qm-filter-item ${activeFilter===QUESTION_TYPES.MULTIPLE_CHOICE?'active':''}`} onClick={()=>setActiveFilter(QUESTION_TYPES.MULTIPLE_CHOICE)}>Trắc nghiệm</div>
         </aside>

         <main className="qm-content-area">
            <div className="qm-content-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10}}>
                <span style={{fontSize: 16, fontWeight: 600}}>Danh sách câu hỏi</span>
                
                {(searchText || searchTag) && (
                    <Tag color="blue" closable onClose={() => {setSearchText(''); setSearchTag('')}} style={{maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        Đang lọc: {searchText} {searchTag ? `+ [${searchTag}]` : ''}
                    </Tag>
                )}
            </div>
            
            <Table 
                columns={columns} 
                dataSource={filteredQuestions} 
                rowKey="question_id" 
                loading={loading} 
                pagination={{ pageSize: 6 }} 
                style={{background: '#fff', borderRadius: 8}}
                // 👇 QUAN TRỌNG: Thêm scroll ngang cho Mobile
                scroll={{ x: 800 }} 
            />
         </main>
      </div>

      {/* --- MODAL FORM --- */}
      <Modal
        title={editingQuestion ? "Sửa câu hỏi" : "Tạo câu hỏi"}
        open={isModalOpen}
        onOk={handleModalSubmit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={modalLoading}
        width={900} 
        style={{top: 20, maxWidth: '100%'}}
      >
        <Form form={form} layout="vertical" style={{marginTop: 20}}>
           <div style={{display: 'flex', gap: 16, flexWrap: 'wrap'}}>
              <Form.Item name="category" label="Tag / Danh mục" style={{flex: 1, minWidth: 200}}>
                <Input placeholder="Ví dụ: Toán, Lý, ReactJS..." />
              </Form.Item>
              <Form.Item name="type" label="Loại câu hỏi" style={{width: 200, minWidth: 200}} rules={[{required: true}]}>
                 <Select onChange={(val) => {
                     setCurrentType(val);
                     if(val !== QUESTION_TYPES.FILL_IN_THE_BLANK) {
                         setDetectedBlanks(0);
                         setBlankAnswers({});
                     }
                 }}>
                    <Option value={QUESTION_TYPES.MULTIPLE_CHOICE}>Trắc nghiệm</Option>
                    <Option value={QUESTION_TYPES.FILL_IN_THE_BLANK}>Điền từ</Option>
                 </Select>
              </Form.Item>
           </div>
           
           {currentType === QUESTION_TYPES.MULTIPLE_CHOICE && (
             <>
                <Form.Item name="question_text" label="Nội dung câu hỏi" rules={[{required: true}]}>
                   <CkEditorField />
                </Form.Item>
                <div style={{background: '#f5f5f5', padding: 15, borderRadius: 8}}>
                  <Form.List name="answers">
                    {(fields, { add, remove }) => (
                      <>
                        <div style={{marginBottom:10, display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                           <b>Các lựa chọn:</b>
                           <Button size="small" type="dashed" onClick={() => add()} icon={<PlusOutlined />}>Thêm lựa chọn</Button>
                        </div>
                        {fields.map(({ key, name, ...restField }, index) => (
                          <Space key={key} style={{ display: 'flex', marginBottom: 8, flexWrap: 'wrap' }} align="baseline">
                            <Form.Item {...restField} name={[name, 'answer']} rules={[{ required: true, message: 'Nhập nội dung' }]} style={{width: 350, margin:0}}>
                              <Input placeholder={`Lựa chọn ${index + 1}`} />
                            </Form.Item>
                            <Form.Item {...restField} name={[name, 'isCorrect']} valuePropName="checked" style={{margin:0}}>
                              <Checkbox onChange={(e) => {
                                  if (e.target.checked) {
                                      const current = form.getFieldValue('answers') || [];
                                      const updated = current.map((item, i) => ({ ...item, isCorrect: i === index }));
                                      form.setFieldsValue({ answers: updated });
                                  }
                              }}>Đúng</Checkbox>
                            </Form.Item>
                            {fields.length > 2 && <MinusCircleOutlined onClick={() => remove(name)} style={{color: 'red'}} />}
                          </Space>
                        ))}
                      </>
                    )}
                  </Form.List>
                </div>
             </>
           )}

           {currentType === QUESTION_TYPES.FILL_IN_THE_BLANK && (
               <div style={{border:'1px solid #d9d9d9', padding: 16, borderRadius: 8, background:'#fafafa'}}>
                   <Alert message="Hướng dẫn Điền từ" description="Sử dụng ký tự '__' (hai dấu gạch dưới) để tạo ô trống." type="info" showIcon style={{marginBottom: 16}} />
                   <Form.Item name="question_text" label="Nội dung câu hỏi (chứa __)" rules={[{required: true}]}>
                      <CkEditorField onChange={handleQuestionTextChange} />
                   </Form.Item>
                   <div style={{marginTop: 16}}>
                       {detectedBlanks > 0 ? (
                           <>
                               <div style={{fontWeight:'bold', marginBottom: 10, color: '#1890ff'}}>Nhập đáp án cho {detectedBlanks} ô trống:</div>
                               {Array.from({ length: detectedBlanks }).map((_, index) => (
                                   <div key={index} style={{marginBottom: 12, display:'flex', alignItems:'center', gap: 10}}>
                                       <Tag color="orange" style={{minWidth: 90, textAlign:'center'}}>Ô trống #{index + 1}</Tag>
                                       <Input style={{flex: 1}} placeholder={`Đáp án đúng...`} value={blankAnswers[index] || ''} onChange={(e) => handleBlankAnswerChange(index, e.target.value)} />
                                   </div>
                               ))}
                           </>
                       ) : <div style={{color: '#999', fontStyle: 'italic', textAlign:'center', padding: 20}}>Chưa phát hiện ô trống nào.</div>}
                   </div>
               </div>
           )}
        </Form>
      </Modal>
    </div>
  );
}