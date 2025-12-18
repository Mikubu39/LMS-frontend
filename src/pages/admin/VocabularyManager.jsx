import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Button, Breadcrumb, Input, Form, Modal, Space, Popconfirm, message } from "antd";
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";

// Giả lập dữ liệu (Thực tế bạn sẽ gọi API getTopicDetail(id))
const MOCK_DATA_SOURCE = {
  1: { id: 1, title: "Thông dụng", vocabs: [
      { id: 1, kanji: "時間", hiragana: "じかん", meaning: "Thời gian" },
      { id: 2, kanji: "友達", hiragana: "ともだち", meaning: "Bạn bè" },
      { id: 3, kanji: "学校", hiragana: "がっこう", meaning: "Trường học" }
  ]},
  2: { id: 2, title: "Gia đình", vocabs: [] },
  3: { id: 3, title: "Số đếm", vocabs: [] }
};

export default function VocabularyManager() {
  const { topicId } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [topicData, setTopicData] = useState(null);
  const [vocabs, setVocabs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVocab, setEditingVocab] = useState(null);

  // Giả lập fetch data khi vào trang
  useEffect(() => {
    // Trong thực tế: const data = await api.getTopicById(topicId);
    const data = MOCK_DATA_SOURCE[topicId];
    if (data) {
      setTopicData(data);
      setVocabs(data.vocabs);
    }
  }, [topicId]);

  // Thêm hoặc Sửa từ vựng
  const handleSaveVocab = (values) => {
    if (editingVocab) {
      // Sửa
      const updated = vocabs.map(v => v.id === editingVocab.id ? { ...v, ...values } : v);
      setVocabs(updated);
      message.success("Cập nhật từ vựng thành công!");
    } else {
      // Thêm
      const newVocab = { id: Date.now(), ...values };
      setVocabs([...vocabs, newVocab]);
      message.success("Thêm từ vựng thành công!");
    }
    setIsModalOpen(false);
    form.resetFields();
    setEditingVocab(null);
  };

  const handleDeleteVocab = (id) => {
    setVocabs(vocabs.filter(v => v.id !== id));
    message.success("Đã xóa từ vựng");
  };

  const openModal = (vocab = null) => {
    setEditingVocab(vocab);
    if (vocab) form.setFieldsValue(vocab);
    else form.resetFields();
    setIsModalOpen(true);
  };

  const columns = [
    { title: "Kanji", dataIndex: "kanji", key: "kanji", render: t => <b style={{ fontSize: 18 }}>{t}</b> },
    { title: "Hiragana", dataIndex: "hiragana", key: "hiragana" },
    { title: "Nghĩa", dataIndex: "meaning", key: "meaning" },
    {
      title: "Hành động", key: "action", width: 150,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openModal(record)} />
          <Popconfirm title="Xóa từ này?" onConfirm={() => handleDeleteVocab(record.id)}>
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      )
    }
  ];

  if (!topicData) return <div style={{ padding: 20 }}>Đang tải hoặc không tìm thấy chủ đề...</div>;

  return (
    <div style={{ padding: 24 }}>
      {/* Breadcrumb điều hướng */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
           <a onClick={() => navigate("/admin/topics")}>Quản lý chủ đề</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{topicData.title}</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/topics")}>Quay lại</Button>
            <h2>Từ vựng: {topicData.title}</h2>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Thêm từ vựng</Button>
      </div>

      <Table 
        dataSource={vocabs} 
        columns={columns} 
        rowKey="id" 
        pagination={{ pageSize: 8 }} 
        bordered
      />

      <Modal
        title={editingVocab ? "Sửa từ vựng" : "Thêm từ vựng mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveVocab}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="kanji" label="Kanji" rules={[{ required: true }]}>
               <Input placeholder="Ví dụ: 学校" />
            </Form.Item>
            <Form.Item name="hiragana" label="Hiragana" rules={[{ required: true }]}>
               <Input placeholder="Ví dụ: がっこう" />
            </Form.Item>
          </div>
          <Form.Item name="meaning" label="Nghĩa tiếng Việt" rules={[{ required: true }]}>
             <Input placeholder="Ví dụ: Trường học" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}