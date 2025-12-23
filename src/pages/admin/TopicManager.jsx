import React, { useState, useEffect } from "react";
import { 
  Table, Card, Button, Input, Tag, Space, 
  Avatar, Typography, Breadcrumb, Modal, 
  Form, Select, message, Tooltip 
} from "antd";
import { 
  SearchOutlined, PlusOutlined, FolderOpenOutlined, 
  UserOutlined, HomeOutlined, EditOutlined, 
  DeleteOutlined 
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

// 🟢 Import API
import { TopicsApi } from "../../services/api/topicsApi";

const { Title } = Typography;
const { Option } = Select;

export default function TopicManager() {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchText, setSearchText] = useState("");

  // State cho Modal (Thêm/Sửa)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [form] = Form.useForm();

  // --- INITIAL LOAD ---
  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- API CALLS ---
  const fetchData = async (page = 1, search = searchText) => {
    setLoading(true);
    try {
      const res = await TopicsApi.getAll({
        page: page,
        limit: pagination.pageSize,
        search: search
      });
      
      // Giả sử API trả về { data: [], total: ..., page: ... }
      setTopics(res.data || []); 
      setPagination({
        current: page,
        pageSize: pagination.pageSize,
        total: res.total || 0
      });
    } catch (error) {
      console.error(error);
      message.error("Lỗi tải danh sách chủ đề");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---

  // Xử lý tìm kiếm
  const handleSearch = () => {
    fetchData(1, searchText);
  };

  // Mở Modal (Thêm hoặc Sửa)
  const openModal = (topic = null) => {
    setEditingTopic(topic);
    if (topic) {
      form.setFieldsValue(topic);
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  // Lưu (Thêm mới / Cập nhật)
  const handleSave = async (values) => {
    try {
      if (editingTopic) {
        // Update
        await TopicsApi.update(editingTopic.id, values);
        message.success("Cập nhật chủ đề thành công!");
      } else {
        // Create
        await TopicsApi.create(values);
        message.success("Tạo chủ đề mới thành công!");
      }
      setIsModalOpen(false);
      fetchData(pagination.current); // Reload lại trang hiện tại
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra khi lưu!");
    }
  };

  // Xóa chủ đề
  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xóa chủ đề?',
      content: 'Hành động này sẽ xóa chủ đề và có thể ảnh hưởng đến các từ vựng bên trong.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await TopicsApi.delete(id);
          message.success("Đã xóa chủ đề");
          fetchData(pagination.current);
        } catch (error) {
          message.error("Xóa thất bại!");
        }
      }
    });
  };

  const getLevelColor = (level) => {
    switch (level) {
      case "N5": return "green";
      case "N4": return "blue";
      case "N3": return "gold";
      case "N2": return "volcano";
      case "N1": return "red";
      default: return "default";
    }
  };

  // --- COLUMNS ---
  const columns = [
    {
      title: "Chủ đề",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <Avatar 
            shape="square" 
            size="large" 
            src={record.icon} 
            icon={<UserOutlined />} 
            style={{ backgroundColor: '#fde3cf', color: '#f56a00' }}
          />
          <div>
            <div style={{ fontWeight: 600 }}>{text}</div>
            <div style={{ fontSize: 12, color: '#888' }}>ID: {record.id.slice(0, 8)}...</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Trình độ",
      dataIndex: "level",
      key: "level",
      width: 100,
      align: 'center',
      render: (level) => <Tag color={getLevelColor(level)}>{level}</Tag>,
    },
    {
        title: "Mô tả",
        dataIndex: "description",
        key: "description",
        ellipsis: { showTitle: false },
        render: (desc) => (
            <Tooltip placement="topLeft" title={desc}>
                {desc || "--"}
            </Tooltip>
        )
    },
    // Nếu API trả về vocabCount thì hiển thị, không thì bỏ qua hoặc hiện 0
    {
      title: "Số từ vựng",
      dataIndex: "vocabCount", 
      width: 120,
      align: 'center',
      render: (count) => <b>{count !== undefined ? count : "--"}</b>,
    },
    {
      title: "Cập nhật",
      dataIndex: "updatedAt",
      width: 150,
      render: (date) => date ? dayjs(date).format("DD/MM/YYYY") : "--",
    },
    {
      title: "Hành động",
      key: "action",
      width: 250,
      align: 'right',
      render: (_, record) => (
        <Space>
            {/* Nút Điều hướng vào trang chi tiết từ vựng */}
            <Button 
                type="primary" 
                ghost
                icon={<FolderOpenOutlined />}
                onClick={() => navigate(`/admin/topics/${record.id}/vocab`)}
            >
                Vocab
            </Button>
            
            {/* Nút Sửa nhanh thông tin Topic */}
            <Button 
                icon={<EditOutlined />} 
                onClick={() => openModal(record)}
            />

            {/* Nút Xóa */}
            <Button 
                danger 
                icon={<DeleteOutlined />} 
                onClick={() => handleDelete(record.id)}
            />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Breadcrumb
        items={[
          { href: '/admin', title: <HomeOutlined /> },
          { title: 'Quản lý chủ đề' },
        ]}
        style={{ marginBottom: 16 }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Danh sách Chủ đề</Title>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => openModal()}>
          Thêm chủ đề
        </Button>
      </div>

      <Card bordered={false}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Space>
            <Input 
                placeholder="Tìm kiếm chủ đề..." 
                prefix={<SearchOutlined />} 
                style={{ width: 300 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={handleSearch}
            />
            <Button onClick={handleSearch}>Tìm</Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={topics}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page) => fetchData(page, searchText)
          }}
        />
      </Card>

      {/* --- MODAL THÊM / SỬA TOPIC --- */}
      <Modal
        title={editingTopic ? "Cập nhật Chủ đề" : "Thêm Chủ đề mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item 
                label="Tên chủ đề" 
                name="name" 
                rules={[{ required: true, message: "Vui lòng nhập tên chủ đề" }]}
            >
                <Input placeholder="Ví dụ: Đồ ăn, Gia đình..." />
            </Form.Item>

            <Form.Item 
                label="Trình độ (Level)" 
                name="level" 
                rules={[{ required: true, message: "Vui lòng chọn trình độ" }]}
            >
                <Select placeholder="Chọn level">
                    <Option value="N5">N5</Option>
                    <Option value="N4">N4</Option>
                    <Option value="N3">N3</Option>
                    <Option value="N2">N2</Option>
                    <Option value="N1">N1</Option>
                </Select>
            </Form.Item>

            <Form.Item label="Mô tả ngắn" name="description">
                <Input.TextArea rows={3} placeholder="Mô tả nội dung chủ đề..." />
            </Form.Item>
            
            {/* Nếu bạn có upload ảnh, thêm Form.Item Upload tại đây */}
        </Form>
      </Modal>
    </div>
  );
}