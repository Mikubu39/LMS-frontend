import React, { useState } from "react";
import { 
  Table, Button, Modal, Form, Input, Space, 
  Popconfirm, message, Upload, Tag 
} from "antd";
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  UnorderedListOutlined, SearchOutlined, LoadingOutlined 
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom"; // 🟢 Import hook điều hướng

/* --- HÀM HỖ TRỢ UPLOAD (Giữ nguyên) --- */
const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
};

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) message.error('Chỉ upload file JPG/PNG!');
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) message.error('Ảnh phải nhỏ hơn 2MB!');
  return isJpgOrPng && isLt2M;
};

// Dữ liệu mẫu (Lưu ý: Trong thực tế bạn nên gọi API để đồng bộ dữ liệu giữa các trang)
const INITIAL_TOPICS = [
  { id: 1, title: "Thông dụng", icon: "https://cdn-icons-png.flaticon.com/512/265/265674.png", vocabs: [] },
  { id: 2, title: "Gia đình", icon: "https://cdn-icons-png.flaticon.com/512/3069/3069172.png", vocabs: [] },
  { id: 3, title: "Số đếm", icon: "https://cdn-icons-png.flaticon.com/512/5660/5660558.png", vocabs: [] }
];

export default function TopicManager() {
  const [topics, setTopics] = useState(INITIAL_TOPICS);
  const [searchText, setSearchText] = useState("");
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [topicForm] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState();

  const navigate = useNavigate(); // 🟢 Hook điều hướng

  // ... (Giữ nguyên logic Upload và Modal Topic như cũ) ...
  const handleUploadChange = (info) => {
    if (info.file.status === 'uploading') { setLoading(true); return; }
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj, (url) => { setLoading(false); setImageUrl(url); });
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />} <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  const openTopicModal = (topic = null) => {
    setEditingTopic(topic);
    if (topic) {
      topicForm.setFieldsValue(topic);
      setImageUrl(topic.icon);
    } else {
      topicForm.resetFields();
      setImageUrl(null);
    }
    setIsTopicModalOpen(true);
  };

  const handleSaveTopic = (values) => {
    const finalData = { ...values, icon: imageUrl };
    if (editingTopic) {
      setTopics(topics.map(t => t.id === editingTopic.id ? { ...t, ...finalData } : t));
      message.success("Cập nhật thành công!");
    } else {
      setTopics([...topics, { id: Date.now(), vocabs: [], ...finalData }]);
      message.success("Thêm mới thành công!");
    }
    setIsTopicModalOpen(false);
  };

  const handleDeleteTopic = (id) => {
    setTopics(topics.filter(t => t.id !== id));
    message.success("Đã xóa chủ đề.");
  };

  const columns = [
    {
      title: "Icon", dataIndex: "icon", key: "icon", width: 100, align: "center",
      render: (src) => src ? <img src={src} alt="icon" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }} /> : null
    },
    { title: "Tên chủ đề", dataIndex: "title", key: "title", render: (text) => <b style={{ fontSize: 16 }}>{text}</b> },
    { title: "Số lượng từ", key: "count", render: (_, record) => <Tag color="blue">{record.vocabs?.length || 0} từ vựng</Tag> },
    {
      title: "Hành động", key: "action", width: 250,
      render: (_, record) => (
        <Space>
          {/* 🟢 Nút này giờ sẽ chuyển trang thay vì mở Drawer */}
          <Button 
            icon={<UnorderedListOutlined />} 
            onClick={() => navigate(`/admin/topics/${record.id}/vocab`)} 
          >
            Q.Lý Từ vựng
          </Button>
          <Button icon={<EditOutlined />} onClick={() => openTopicModal(record)} />
          <Popconfirm title="Xóa chủ đề?" onConfirm={() => handleDeleteTopic(record.id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <h2>Quản lý Chủ đề</h2>
        <Space>
          <Input placeholder="Tìm kiếm..." prefix={<SearchOutlined />} onChange={e => setSearchText(e.target.value)} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openTopicModal()}>Thêm chủ đề</Button>
        </Space>
      </div>

      <Table 
        columns={columns} 
        dataSource={topics.filter(t => t.title.toLowerCase().includes(searchText.toLowerCase()))} 
        rowKey="id" 
        pagination={{ pageSize: 6 }} 
        bordered 
      />

      <Modal
        title={editingTopic ? "Sửa chủ đề" : "Thêm chủ đề"}
        open={isTopicModalOpen}
        onCancel={() => setIsTopicModalOpen(false)}
        onOk={() => topicForm.submit()}
      >
        <Form form={topicForm} layout="vertical" onFinish={handleSaveTopic}>
          <Form.Item name="title" label="Tên chủ đề" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Icon">
            <Upload listType="picture-card" showUploadList={false} beforeUpload={beforeUpload} onChange={handleUploadChange}>
              {imageUrl ? <img src={imageUrl} alt="icon" style={{ width: '100%' }} /> : uploadButton}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}