// src/pages/admin/KanjiManager.jsx
import React, { useState, useEffect } from "react";
import { 
  Table, Card, Button, Input, Tag, Space, 
  Typography, Breadcrumb, Modal, Form, 
  Select, message, Tooltip, Upload, Row, Col 
} from "antd";
import { 
  SearchOutlined, PlusOutlined, DeleteOutlined, 
  EditOutlined, HomeOutlined, UploadOutlined, 
  DownloadOutlined, ExclamationCircleOutlined 
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

// IMPORT API
import { KanjiApi } from "../../services/api/kanjiApi";

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

export default function KanjiManager() {
  const navigate = useNavigate();

  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [kanjis, setKanjis] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState({ search: "", jlpt: "" });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKanji, setEditingKanji] = useState(null);
  const [form] = Form.useForm();

  // State chọn nhiều
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // --- INITIAL LOAD ---
  useEffect(() => {
    fetchData(1);
  }, []);

  // --- API CALLS ---
  const fetchData = async (page = 1, currentFilters = filters) => {
    setLoading(true);
    try {
      const res = await KanjiApi.getAll({
        page: page,
        limit: pagination.pageSize,
        search: currentFilters.search,
        jlpt: currentFilters.jlpt
      });
      
      setKanjis(res.data || []);
      setPagination({
        current: page,
        pageSize: pagination.pageSize,
        total: res.total || 0
      });
      setSelectedRowKeys([]);
    } catch (error) {
      console.error(error);
      message.error("Lỗi tải danh sách Kanji");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values) => {
    try {
      if (editingKanji) {
        await KanjiApi.update(editingKanji.id, values);
        message.success("Cập nhật thành công!");
      } else {
        await KanjiApi.create(values);
        message.success("Thêm mới thành công!");
      }
      setIsModalOpen(false);
      fetchData(pagination.current);
    } catch (error) {
      message.error("Có lỗi xảy ra!");
    }
  };

  const openModal = (record = null) => {
    setEditingKanji(record);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleBulkDelete = () => {
    confirm({
      title: `Xóa ${selectedRowKeys.length} chữ Kanji đã chọn?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa ngay',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        setLoading(true);
        try {
          await Promise.all(selectedRowKeys.map(id => KanjiApi.delete(id)));
          message.success("Đã xóa thành công!");
          setSelectedRowKeys([]);
          fetchData(pagination.current);
        } catch (error) {
          message.error("Xóa thất bại!");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      { 
        "Kanji": "日", 
        "Âm On": "NICHI, JITSU", 
        "Âm Kun": "hi, -bi", 
        "Nghĩa": "Ngày, Mặt trời", 
        "Mẹo nhớ": "Hình chữ nhật tượng trưng mặt trời",
        "Level": "N5"
      },
      { 
        "Kanji": "月", 
        "Âm On": "GETSU", 
        "Âm Kun": "tsuki", 
        "Nghĩa": "Tháng, Mặt trăng", 
        "Mẹo nhớ": "",
        "Level": "N5"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MauNhapKanji");
    XLSX.writeFile(wb, "Mau_Kanji.xlsx");
  };

  // 🟢 FIX 413: CHIA NHỎ MẢNG DỮ LIỆU (BATCHING)
  const handleImportExcel = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        if (jsonData.length === 0) {
            message.warning("File rỗng!");
            return;
        }

        const formattedData = jsonData.map(item => ({
            kanji: item["Kanji"] || item["kanji"],
            onyomi: item["Âm On"] || item["onyomi"] || "",
            kunyomi: item["Âm Kun"] || item["kunyomi"] || "",
            meanings: (item["Nghĩa"] || item["meanings"] || "").split(/,|;/).map(s => s.trim()).filter(s => s),
            mnemonic: item["Mẹo nhớ"] || item["mnemonic"] || "",
            jlpt: item["Level"] || item["jlpt"] || "N5"
        }));

        const validData = formattedData.filter(i => i.kanji);
        
        // --- LOGIC CHIA NHỎ (BATCHING) ---
        setLoading(true);
        const BATCH_SIZE = 50; // Mỗi lần gửi 50 dòng
        const totalBatches = Math.ceil(validData.length / BATCH_SIZE);
        
        message.loading({ content: `Đang xử lý 0/${totalBatches} gói dữ liệu...`, key: 'importProcess' });

        for (let i = 0; i < validData.length; i += BATCH_SIZE) {
            const batch = validData.slice(i, i + BATCH_SIZE);
            await KanjiApi.importBulk(batch);
            
            // Cập nhật tiến độ
            const currentBatch = Math.floor(i / BATCH_SIZE) + 1;
            message.loading({ content: `Đang xử lý ${currentBatch}/${totalBatches} gói dữ liệu...`, key: 'importProcess' });
        }

        message.success({ content: `Hoàn tất! Đã thêm ${validData.length} chữ Kanji.`, key: 'importProcess' });
        fetchData(1);

      } catch (error) {
        console.error(error);
        message.error({ content: "Lỗi khi import! Có thể dữ liệu sai định dạng.", key: 'importProcess' });
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  const columns = [
    {
      title: "Kanji",
      dataIndex: "kanji",
      key: "kanji",
      width: 80,
      align: 'center',
      render: (text) => <span style={{ fontSize: 24, fontWeight: 'bold', color: '#1677ff' }}>{text}</span>,
    },
    {
      title: "Cấp độ",
      dataIndex: "jlpt",
      key: "jlpt",
      width: 80,
      align: 'center',
      render: (text) => <Tag color={text === 'N5' ? 'green' : 'blue'}>{text}</Tag>,
    },
    {
      title: "Âm On / Kun",
      key: "reading",
      width: 200,
      render: (_, record) => (
        <div style={{ fontSize: 13 }}>
          <div><Text type="secondary">On:</Text> {record.onyomi || "--"}</div>
          <div><Text type="secondary">Kun:</Text> {record.kunyomi || "--"}</div>
        </div>
      )
    },
    {
      title: "Ý nghĩa",
      dataIndex: "meanings",
      key: "meanings",
      render: (meanings) => (
        <>
          {meanings && meanings.map((m, idx) => (
            <Tag key={idx} color="orange">{m}</Tag>
          ))}
        </>
      )
    },
    {
      title: "Mẹo nhớ",
      dataIndex: "mnemonic",
      key: "mnemonic",
      ellipsis: true,
      render: (text) => <Tooltip title={text}>{text}</Tooltip>
    },
    {
      title: "Hành động",
      key: "action",
      width: 100,
      align: 'right',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => {
             confirm({
                title: 'Xóa Kanji này?',
                okType: 'danger',
                onOk: async () => {
                    await KanjiApi.delete(record.id);
                    fetchData(pagination.current);
                }
             })
          }} />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Breadcrumb items={[{ href: '/admin', title: <HomeOutlined /> }, { title: 'Quản lý Kanji' }]} style={{ marginBottom: 16 }} />

      <Card bordered={false} style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <Title level={3} style={{ margin: 0 }}>Từ điển Kanji</Title>
            
            <Space wrap>
                <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
                    Tải mẫu Excel
                </Button>
                <Upload 
                    accept=".xlsx, .xls" 
                    showUploadList={false} 
                    beforeUpload={handleImportExcel}
                >
                    <Button icon={<UploadOutlined />}>Nhập từ Excel</Button>
                </Upload>

                <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
                    Thêm Kanji
                </Button>
            </Space>
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
             <Select 
                placeholder="Lọc Level" 
                style={{ width: 120 }}
                allowClear
                onChange={(val) => {
                    setFilters({ ...filters, jlpt: val });
                    fetchData(1, { ...filters, jlpt: val });
                }}
             >
                <Option value="N5">N5</Option>
                <Option value="N4">N4</Option>
                <Option value="N3">N3</Option>
                <Option value="N2">N2</Option>
                <Option value="N1">N1</Option>
             </Select>

             <Input 
                placeholder="Tìm Kanji, âm đọc, nghĩa..." 
                prefix={<SearchOutlined />} 
                style={{ width: 300 }}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onPressEnter={() => fetchData(1)}
             />
             <Button onClick={() => fetchData(1)}>Tìm</Button>
        </div>

        {selectedRowKeys.length > 0 && (
            <div style={{ marginTop: 16, padding: '8px 16px', background: '#fff1f0', border: '1px solid #ffa39e', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 16 }}>
                <Text type="danger">Đang chọn {selectedRowKeys.length} chữ Kanji</Text>
                <Button type="primary" danger size="small" onClick={handleBulkDelete}>
                    Xóa tất cả mục đã chọn
                </Button>
                <Button size="small" onClick={() => setSelectedRowKeys([])}>Bỏ chọn</Button>
            </div>
         )}
      </Card>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={kanjis}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page) => fetchData(page)
        }}
      />

      <Modal
        title={editingKanji ? "Cập nhật Kanji" : "Thêm Kanji mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
           <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Kanji" name="kanji" rules={[{ required: true }]}>
                    <Input placeholder="Ví dụ: 日" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Level" name="jlpt" initialValue="N5">
                    <Select>
                        <Option value="N5">N5</Option>
                        <Option value="N4">N4</Option>
                        <Option value="N3">N3</Option>
                        <Option value="N2">N2</Option>
                        <Option value="N1">N1</Option>
                    </Select>
                </Form.Item>
              </Col>
           </Row>
           
           <Row gutter={16}>
              <Col span={12}>
                  <Form.Item label="Âm Onyomi" name="onyomi">
                     <Input placeholder="Ví dụ: NICHI, JITSU" />
                  </Form.Item>
              </Col>
              <Col span={12}>
                  <Form.Item label="Âm Kunyomi" name="kunyomi">
                     <Input placeholder="Ví dụ: hi, -bi" />
                  </Form.Item>
              </Col>
           </Row>

           <Form.Item label="Ý nghĩa (Nhấn Enter để thêm)" name="meanings">
              <Select mode="tags" placeholder="Ví dụ: Mặt trời, Ngày" tokenSeparators={[',', ';']} />
           </Form.Item>

           <Form.Item label="Mẹo nhớ" name="mnemonic">
              <Input.TextArea rows={3} placeholder="Câu chuyện gợi nhớ..." />
           </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}