import React, { useState, useEffect } from "react";
import { 
  Table, Card, Button, Input, Tag, Space, 
  Typography, Modal, Form, Select, message, 
  Tooltip, Row, Col 
} from "antd";
import { 
  SearchOutlined, PlusOutlined, EditOutlined, 
  DeleteOutlined, BookOutlined, SoundOutlined 
} from "@ant-design/icons";

// 🟢 IMPORT API (Hãy đảm bảo đường dẫn đúng với cấu trúc dự án của bạn)
import { KanjiApi } from "../../services/api/kanjiApi"; 

const { Title, Text } = Typography;
const { Option } = Select;

export default function KanjiManager() {
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]); 
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  
  // State cho bộ lọc
  const [searchText, setSearchText] = useState("");
  const [jlptFilter, setJlptFilter] = useState(undefined); // undefined để lấy tất cả
  
  // State cho Modal (Thêm/Sửa)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  // --- INITIAL LOAD ---
  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- API CALLS ---

  /**
   * Gọi API lấy danh sách Kanji
   * @param {number} page - Trang cần lấy
   * @param {string} search - Từ khóa tìm kiếm (nếu có)
   * @param {string} jlpt - Cấp độ JLPT (nếu có)
   */
  const fetchData = async (page = 1, search = searchText, jlpt = jlptFilter) => {
    setLoading(true);
    try {
      const res = await KanjiApi.getAll({
        page: page,
        limit: pagination.pageSize,
        search: search,
        jlpt: jlpt
      });

      // Cập nhật dữ liệu vào bảng
      setData(res.data);
      
      // Cập nhật phân trang
      setPagination({
        current: page, // Backend trả về res.page hoặc dùng page hiện tại
        pageSize: pagination.pageSize,
        total: res.total // Tổng số bản ghi từ DB
      });
    } catch (error) {
      console.error("Lỗi tải Kanji:", error);
      message.error("Không thể tải danh sách Kanji");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---

  // Xử lý khi nhấn nút tìm kiếm hoặc thay đổi filter
  const handleSearch = () => {
    fetchData(1, searchText, jlptFilter); // Reset về trang 1 khi tìm kiếm
  };

  const handleJlptChange = (value) => {
    setJlptFilter(value);
    fetchData(1, searchText, value); // Gọi API ngay khi chọn JLPT
  };

  // Mở Modal
  const openModal = (record = null) => {
    setEditingItem(record);
    if (record) {
      form.setFieldsValue(record); 
    } else {
      form.resetFields(); 
    }
    setIsModalOpen(true);
  };

  // Xử lý Submit Form (Thêm hoặc Sửa)
  const handleSave = async (values) => {
    try {
      if (editingItem) {
        // --- SỬA ---
        await KanjiApi.update(editingItem.id, values);
        message.success(`Đã cập nhật Kanji: ${values.kanji}`);
      } else {
        // --- THÊM MỚI ---
        await KanjiApi.create(values);
        message.success(`Đã thêm mới Kanji: ${values.kanji}`);
      }
      
      setIsModalOpen(false);
      fetchData(pagination.current); // Load lại dữ liệu trang hiện tại
    } catch (error) {
      console.error("Lỗi lưu Kanji:", error);
      message.error("Có lỗi xảy ra khi lưu dữ liệu!");
    }
  };

  // Xử lý Xóa
  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa Kanji này không?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await KanjiApi.delete(id);
          message.success("Đã xóa thành công");
          fetchData(pagination.current); // Load lại bảng
        } catch (error) {
          console.error("Lỗi xóa Kanji:", error);
          message.error("Xóa thất bại!");
        }
      }
    });
  };

  // Helper render màu JLPT
  const getJlptColor = (level) => {
    switch (level) {
      case "N1": return "red";
      case "N2": return "volcano";
      case "N3": return "gold";
      case "N4": return "blue";
      case "N5": return "green";
      default: return "default";
    }
  };

  // --- TABLE COLUMNS ---
  const columns = [
    {
      title: "Kanji",
      dataIndex: "kanji",
      key: "kanji",
      width: 80,
      align: 'center',
      render: (text) => (
        <div style={{ 
          fontSize: 32, fontWeight: 'bold', lineHeight: '1', 
          color: '#1677ff', background: '#f0f5ff', 
          padding: 8, borderRadius: 8, border: '1px solid #adc6ff' 
        }}>
          {text}
        </div>
      )
    },
    {
      title: "Âm đọc",
      key: "readings",
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text><SoundOutlined /> <b>On:</b> {record.onyomi}</Text>
          <Text type="secondary"><b>Kun:</b> {record.kunyomi}</Text>
        </Space>
      )
    },
    {
      title: "Ý nghĩa (Meanings)",
      dataIndex: "meanings",
      key: "meanings",
      render: (meanings) => (
        <>
          {Array.isArray(meanings) && meanings.map((m, index) => (
            <Tag key={index} color="cyan" style={{ marginBottom: 4 }}>
              {m}
            </Tag>
          ))}
        </>
      )
    },
    {
      title: "JLPT",
      dataIndex: "jlpt",
      key: "jlpt",
      width: 80,
      align: 'center',
      render: (jlpt) => <Tag color={getJlptColor(jlpt)}>{jlpt}</Tag>
    },
    {
      title: "Mẹo nhớ",
      dataIndex: "mnemonic",
      key: "mnemonic",
      ellipsis: {
        showTitle: false,
      },
      render: (mnemonic) => (
        <Tooltip placement="topLeft" title={mnemonic}>
          {mnemonic}
        </Tooltip>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined style={{ color: '#faad14' }} />} 
            onClick={() => openModal(record)} 
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)} 
          />
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* HEADER PAGE */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <BookOutlined /> Quản lý Kanji
        </Title>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => openModal()}>
          Thêm Kanji mới
        </Button>
      </div>

      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        {/* TOOLBAR */}
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={8}>
             <Input 
                placeholder="Tìm kiếm Kanji, nghĩa..." 
                prefix={<SearchOutlined />} 
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={handleSearch} // Tìm khi Enter
             />
          </Col>
          <Col span={4}>
            <Select 
              placeholder="Lọc theo JLPT" 
              allowClear 
              style={{ width: '100%' }}
              onChange={handleJlptChange} // Tìm khi chọn Select
            >
              <Option value="N5">N5</Option>
              <Option value="N4">N4</Option>
              <Option value="N3">N3</Option>
              <Option value="N2">N2</Option>
              <Option value="N1">N1</Option>
            </Select>
          </Col>
          <Col span={4}>
             <Button type="primary" ghost onClick={handleSearch}>Tìm kiếm</Button>
          </Col>
        </Row>

        {/* TABLE */}
        <Table 
          columns={columns}
          dataSource={data} // Dữ liệu từ API
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page) => fetchData(page, searchText, jlptFilter)
          }}
        />
      </Card>

      {/* MODAL ADD/EDIT */}
      <Modal
        title={editingItem ? "Cập nhật Kanji" : "Thêm Kanji mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={600}
        confirmLoading={loading} // Hiển thị loading ở nút OK khi đang lưu
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item 
                label="Kanji (Hán tự)" 
                name="kanji" 
                rules={[{ required: true, message: 'Nhập chữ Hán!' }]}
              >
                <Input style={{ fontSize: 24, textAlign: 'center' }} maxLength={1} placeholder="ví dụ: 木" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="JLPT Level" name="jlpt" rules={[{ required: true }]}>
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
              <Form.Item label="Onyomi (Âm On)" name="onyomi">
                <Input placeholder="ví dụ: MOKU, BOKU" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Kunyomi (Âm Kun)" name="kunyomi">
                <Input placeholder="ví dụ: ki" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            label="Ý nghĩa (Nhập rồi ấn Enter để thêm nhiều nghĩa)" 
            name="meanings" 
            rules={[{ required: true, message: 'Nhập ít nhất 1 nghĩa' }]}
          >
            <Select 
                mode="tags" 
                placeholder="Ví dụ: Cây, Gỗ... (Enter để tạo tag)" 
                tokenSeparators={[',']} 
                style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="Mẹo nhớ (Mnemonic)" name="mnemonic">
            <Input.TextArea rows={3} placeholder="Mẹo giúp ghi nhớ chữ này..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}