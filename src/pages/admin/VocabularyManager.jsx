// src/pages/admin/VocabularyManager.jsx
import React, { useState, useEffect } from "react";
import { 
  Card, Button, Table, Breadcrumb, Space, 
  Typography, Form, Input, Select, message, 
  Modal, Upload, Tooltip 
} from "antd";
import { 
  EditOutlined, PlusOutlined, DeleteOutlined, 
  AudioOutlined, UploadOutlined, DownloadOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import * as XLSX from "xlsx"; // 🟢 Thư viện xử lý Excel

// IMPORT API
import { VocabularyApi } from "../../services/api/vocabularyApi";
import { TopicsApi } from "../../services/api/topicsApi";
import { KanjiApi } from "../../services/api/kanjiApi";

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

export default function VocabularyManager() {
  const navigate = useNavigate();
  const { topicId } = useParams(); 
  
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState(null);
  const [vocabList, setVocabList] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // State Modal & Form
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [editingVocab, setEditingVocab] = useState(null);
  const [vocabForm] = Form.useForm();
  const [kanjiOptions, setKanjiOptions] = useState([]); 

  // State chọn nhiều (Bulk Action)
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // --- INITIAL LOAD ---
  useEffect(() => {
    if (topicId) {
      fetchTopicDetail();
      fetchVocabList(1);
    }
  }, [topicId]);

  // Load Kanji khi mở modal
  useEffect(() => {
    if (isVocabModalOpen) {
      fetchKanjiOptions();
    }
  }, [isVocabModalOpen]);

  // --- API FUNCTIONS ---
  const fetchTopicDetail = async () => {
    try {
      const res = await TopicsApi.getById(topicId);
      setTopic(res);
    } catch (error) {
      message.error("Không thể tải thông tin chủ đề");
    }
  };

  const fetchVocabList = async (page = 1) => {
    setLoading(true);
    try {
      const res = await VocabularyApi.getAll({
        page: page,
        limit: pagination.pageSize,
        topic_id: topicId 
      });
      setVocabList(res.data);
      setPagination({
        current: page,
        pageSize: pagination.pageSize,
        total: res.total
      });
      setSelectedRowKeys([]); // Reset selection khi chuyển trang
    } catch (error) {
      message.error("Lỗi tải danh sách từ vựng");
    } finally {
      setLoading(false);
    }
  };

  const fetchKanjiOptions = async (search = "") => {
    try {
      const res = await KanjiApi.getAll({ page: 1, limit: 20, search });
      setKanjiOptions(res.data);
    } catch (error) {
      console.error("Lỗi tải Kanji options");
    }
  };

  // --- HANDLERS (Thêm / Sửa / Xóa) ---

  const handleSaveVocab = async (values) => {
    try {
      const payload = { ...values, topic_id: topicId };
      if (editingVocab) {
        await VocabularyApi.update(editingVocab.id, payload);
        message.success("Cập nhật thành công!");
      } else {
        await VocabularyApi.create(payload);
        message.success("Thêm mới thành công!");
      }
      setIsVocabModalOpen(false);
      fetchVocabList(pagination.current);
    } catch (error) {
      message.error("Có lỗi xảy ra!");
    }
  };

  const openVocabModal = (record = null) => {
    setEditingVocab(record);
    if (record) {
      const kanjiIds = record.kanjiList?.map(k => k.id) || [];
      vocabForm.setFieldsValue({ ...record, kanji_ids: kanjiIds });
    } else {
      vocabForm.resetFields();
    }
    setIsVocabModalOpen(true);
  };

  // 🟢 CHỨC NĂNG XÓA NHIỀU (BULK DELETE)
  const handleBulkDelete = () => {
    confirm({
      title: `Bạn có chắc muốn xóa ${selectedRowKeys.length} từ vựng đã chọn?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa ngay',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        setLoading(true);
        try {
          // Gọi API xóa từng cái một (Promise.all) vì chưa có API bulk delete
          // Đây là cách xử lý ở Frontend khi Backend chưa hỗ trợ xóa mảng ID
          await Promise.all(selectedRowKeys.map(id => VocabularyApi.delete(id)));
          
          message.success("Đã xóa các từ vựng đã chọn!");
          setSelectedRowKeys([]); // Reset chọn
          fetchVocabList(pagination.current);
        } catch (error) {
          message.error("Xóa thất bại, vui lòng thử lại!");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 🟢 CHỨC NĂNG TẢI FILE MẪU EXCEL
  const handleDownloadTemplate = () => {
    // Dữ liệu mẫu
    const templateData = [
      { "Từ vựng": "先生", "Cách đọc": "せんせい", "Nghĩa": "Giáo viên" },
      { "Từ vựng": "学生", "Cách đọc": "がくせい", "Nghĩa": "Học sinh" },
    ];

    // Tạo workbook
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TuVungMau");

    // Tải xuống
    XLSX.writeFile(wb, "Mau_Nhap_Tu_Vung.xlsx");
  };

  // 🟢 CHỨC NĂNG IMPORT EXCEL
  const handleImportExcel = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        
        // Lấy sheet đầu tiên
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Chuyển đổi sang JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Map dữ liệu từ tiếng Việt sang tiếng Anh cho Backend
        const formattedData = jsonData.map(item => ({
            word: item["Từ vựng"] || item["word"],
            reading: item["Cách đọc"] || item["reading"],
            meaning: item["Nghĩa"] || item["meaning"],
            topicId: topicId,
            kanjiIds: [] // Mặc định rỗng, backend sẽ tự động detect
        }));

        // Lọc bỏ những dòng trống
        const validData = formattedData.filter(i => i.word && i.meaning);

        if (validData.length === 0) {
            message.warning("File không có dữ liệu hợp lệ!");
            return;
        }

        setLoading(true);
        await VocabularyApi.importBulk(topicId, validData);
        message.success(`Đã thêm thành công ${validData.length} từ vựng!`);
        fetchVocabList(1);

      } catch (error) {
        console.error(error);
        message.error("Lỗi đọc file Excel! Hãy dùng file mẫu.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
    return false; // Chặn Antd upload
  };

  // Cấu hình bảng
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
  };

  const columns = [
    {
      title: "Từ vựng",
      dataIndex: "word",
      width: 150,
      render: (text) => <Text strong style={{ color: '#1677ff', fontSize: 16 }}>{text}</Text>
    },
    {
      title: "Cách đọc",
      dataIndex: "reading",
      width: 150,
    },
    {
      title: "Nghĩa",
      dataIndex: "meaning",
    },
    {
      title: "Hành động",
      width: 100,
      align: 'right',
      render: (_, record) => (
         <Space>
            <Button size="small" icon={<EditOutlined />} onClick={() => openVocabModal(record)} />
            <Button size="small" danger icon={<DeleteOutlined />} onClick={() => {
                confirm({
                    title: 'Xóa từ này?',
                    okType: 'danger',
                    onOk: async () => {
                        await VocabularyApi.delete(record.id);
                        fetchVocabList(pagination.current);
                    }
                })
            }} />
         </Space>
      )
    }
  ];

  if (!topic) return <div style={{ padding: 24 }}>Đang tải...</div>;

  return (
    <div style={{ padding: 24 }}>
      <Breadcrumb
        items={[
          { title: <a onClick={() => navigate("/admin/topics")}>Quản lý chủ đề</a> },
          { title: topic.name },
        ]}
        style={{ marginBottom: 16 }}
      />

      {/* HEADER & CÁC NÚT CHỨC NĂNG */}
      <Card bordered={false} style={{ marginBottom: 24 }}>
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div>
                <Title level={3} style={{ margin: 0 }}>{topic.name}</Title>
                <Text type="secondary">{topic.description}</Text>
            </div>

            <Space wrap>
                {/* Nút tải mẫu */}
                <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
                    Tải file mẫu Excel
                </Button>

                {/* Nút Import Excel */}
                <Upload 
                    accept=".xlsx, .xls" 
                    showUploadList={false} 
                    beforeUpload={handleImportExcel}
                >
                    <Button icon={<UploadOutlined />}>Nhập từ Excel</Button>
                </Upload>

                {/* Nút Thêm thủ công */}
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openVocabModal()}>
                    Thêm từ vựng
                </Button>
            </Space>
         </div>

         {/* Nút Bulk Action (Chỉ hiện khi có chọn dòng) */}
         {selectedRowKeys.length > 0 && (
            <div style={{ marginTop: 16, padding: '8px 16px', background: '#fff1f0', border: '1px solid #ffa39e', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 16 }}>
                <Text type="danger">Đang chọn {selectedRowKeys.length} từ vựng</Text>
                <Button type="primary" danger size="small" onClick={handleBulkDelete}>
                    Xóa tất cả mục đã chọn
                </Button>
                <Button size="small" onClick={() => setSelectedRowKeys([])}>Bỏ chọn</Button>
            </div>
         )}
      </Card>

      {/* BẢNG DỮ LIỆU */}
      <Table 
        rowSelection={rowSelection} // 🟢 Kích hoạt checkbox
        columns={columns} 
        dataSource={vocabList} 
        rowKey="id"
        loading={loading}
        pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page) => fetchVocabList(page)
        }}
      />

      {/* MODAL THÊM/SỬA (Giữ nguyên form nhập) */}
      <Modal
        title={editingVocab ? "Cập nhật Từ vựng" : "Thêm Từ vựng mới"}
        open={isVocabModalOpen}
        onCancel={() => setIsVocabModalOpen(false)}
        onOk={() => vocabForm.submit()}
      >
        <Form form={vocabForm} layout="vertical" onFinish={handleSaveVocab}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Form.Item label="Từ vựng" name="word" rules={[{ required: true }]}>
                    <Input placeholder="Ví dụ: 先生" />
                </Form.Item>
                <Form.Item label="Cách đọc" name="reading" rules={[{ required: true }]}>
                    <Input placeholder="Ví dụ: せんせい" />
                </Form.Item>
            </div>
            <Form.Item label="Nghĩa" name="meaning" rules={[{ required: true }]}>
                <Input placeholder="Ví dụ: Giáo viên" />
            </Form.Item>
            <Form.Item label="Kanji liên quan" name="kanji_ids">
                <Select 
                    mode="multiple" 
                    placeholder="Tìm và chọn Kanji..."
                    filterOption={false}
                    onSearch={fetchKanjiOptions}
                    showSearch
                >
                    {kanjiOptions.map(k => (
                        <Option key={k.id} value={k.id}>{k.kanji} - {k.meanings?.[0]}</Option>
                    ))}
                </Select>
            </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}