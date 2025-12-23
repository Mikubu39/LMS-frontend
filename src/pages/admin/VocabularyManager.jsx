import React, { useState, useEffect } from "react";
import { 
  Card, Descriptions, Tag, Button, Table, 
  Breadcrumb, Space, Typography, Form, 
  Input, Select, message, Divider, Modal 
} from "antd";
import { 
  EditOutlined, SaveOutlined, CloseOutlined, 
  PlusOutlined, DeleteOutlined, AudioOutlined 
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";

// 🟢 IMPORT API
import { VocabularyApi } from "../../services/api/vocabularyApi";
import { TopicsApi } from "../../services/api/topicsApi";
import { KanjiApi } from "../../services/api/kanjiApi";

const { Title, Text } = Typography;
const { Option } = Select;

export default function VocabularyManager() {
  const navigate = useNavigate();
  const { topicId } = useParams(); // Lấy topicId từ URL
  
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState(null); // Thông tin Topic cha
  const [vocabList, setVocabList] = useState([]); // Danh sách từ vựng
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // State sửa thông tin Topic
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [topicForm] = Form.useForm();

  // State Modal Từ vựng (Thêm/Sửa)
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [editingVocab, setEditingVocab] = useState(null);
  const [vocabForm] = Form.useForm();
  
  // State Select Kanji (Load list Kanji để chọn)
  const [kanjiOptions, setKanjiOptions] = useState([]); 

  // --- INITIAL LOAD ---
  useEffect(() => {
    if (topicId) {
      fetchTopicDetail();
      fetchVocabList(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  // Load danh sách Kanji khi mở Modal thêm/sửa từ vựng
  useEffect(() => {
    if (isVocabModalOpen) {
      fetchKanjiOptions();
    }
  }, [isVocabModalOpen]);

  // --- API CALLS ---

  // 1. Lấy thông tin Topic
  const fetchTopicDetail = async () => {
    try {
      const res = await TopicsApi.getById(topicId);
      setTopic(res);
      // Fill form sửa topic sẵn
      topicForm.setFieldsValue({
        name: res.name,
        description: res.description,
        level: res.level
      });
    } catch (error) {
      message.error("Không thể tải thông tin chủ đề");
    }
  };

  // 2. Lấy danh sách từ vựng của Topic
  const fetchVocabList = async (page = 1) => {
    setLoading(true);
    try {
      const res = await VocabularyApi.getAll({
        page: page,
        limit: pagination.pageSize,
        topic_id: topicId // 🟢 Filter theo topicId
      });
      setVocabList(res.data);
      setPagination({
        current: page,
        pageSize: pagination.pageSize,
        total: res.total
      });
    } catch (error) {
      message.error("Lỗi tải danh sách từ vựng");
    } finally {
      setLoading(false);
    }
  };

  // 3. Lấy danh sách Kanji để chọn trong Select
  const fetchKanjiOptions = async (search = "") => {
    try {
      const res = await KanjiApi.getAll({ page: 1, limit: 50, search });
      setKanjiOptions(res.data);
    } catch (error) {
      console.error("Lỗi tải Kanji options");
    }
  };

  // --- HANDLERS FOR TOPIC ---

  const handleSaveTopicInfo = async (values) => {
    try {
      await TopicsApi.update(topicId, values);
      message.success("Cập nhật thông tin chủ đề thành công!");
      setIsEditingTopic(false);
      fetchTopicDetail(); // Refresh data
    } catch (error) {
      message.error("Cập nhật thất bại!");
    }
  };

  // --- HANDLERS FOR VOCABULARY ---

  const openVocabModal = (record = null) => {
    setEditingVocab(record);
    if (record) {
      // Map dữ liệu vào form
      // Lưu ý: kanjiList từ API trả về là mảng object [{id: 1, kanji: 'Nhật'}...]
      // Cần map về mảng ID [1, 2...] cho Select Antd
      const kanjiIds = record.kanjiList?.map(k => k.id) || [];
      vocabForm.setFieldsValue({
        ...record,
        kanji_ids: kanjiIds
      });
    } else {
      vocabForm.resetFields();
    }
    setIsVocabModalOpen(true);
  };

  const handleSaveVocab = async (values) => {
    try {
      const payload = { 
          ...values, 
          topic_id: topicId // Luôn gắn vocab vào topic hiện tại
      };

      if (editingVocab) {
        // Update
        await VocabularyApi.update(editingVocab.id, payload);
        message.success("Cập nhật từ vựng thành công!");
      } else {
        // Create
        await VocabularyApi.create(payload);
        message.success("Thêm từ vựng mới thành công!");
      }
      setIsVocabModalOpen(false);
      fetchVocabList(pagination.current);
    } catch (error) {
      message.error("Có lỗi xảy ra khi lưu!");
    }
  };

  const handleDeleteVocab = (id) => {
    Modal.confirm({
      title: 'Xóa từ vựng?',
      content: 'Bạn có chắc chắn muốn xóa từ vựng này không?',
      okText: 'Xóa',
      okType: 'danger',
      onOk: async () => {
        try {
          await VocabularyApi.delete(id);
          message.success("Đã xóa từ vựng");
          fetchVocabList(pagination.current);
        } catch (error) {
          message.error("Xóa thất bại!");
        }
      }
    });
  };

  // --- COLUMNS ---
  const vocabColumns = [
    {
      title: "Từ vựng (Word)",
      dataIndex: "word",
      key: "word",
      render: (text) => <Text strong style={{ color: '#1677ff', fontSize: 16 }}>{text}</Text>
    },
    {
      title: "Nghĩa (Meaning)",
      dataIndex: "meaning",
      key: "meaning",
    },
    {
        title: "Kanji liên quan",
        dataIndex: "kanjiList",
        key: "kanjiList",
        render: (kanjiList) => (
            <>
                {kanjiList && kanjiList.map(k => (
                    <Tag key={k.id} color="purple">{k.kanji}</Tag>
                ))}
            </>
        )
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      align: 'right',
      render: (_, record) => (
        <Space>
           <Button type="text" icon={<EditOutlined style={{ color: '#faad14' }} />} onClick={() => openVocabModal(record)} />
           <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDeleteVocab(record.id)} />
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

      {/* --- HEADER: THÔNG TIN TOPIC --- */}
      <Card bordered={false} style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Space direction="vertical" size={0}>
            <Title level={3} style={{ margin: 0 }}>
              {isEditingTopic ? "Chỉnh sửa thông tin chủ đề" : topic.name}
            </Title>
            <Text type="secondary">ID: {topicId}</Text>
          </Space>
          
          <Space>
            {isEditingTopic ? (
              <>
                <Button icon={<CloseOutlined />} onClick={() => setIsEditingTopic(false)}>Hủy</Button>
                <Button type="primary" icon={<SaveOutlined />} onClick={() => topicForm.submit()}>Lưu</Button>
              </>
            ) : (
              <Button icon={<EditOutlined />} onClick={() => setIsEditingTopic(true)}>Sửa thông tin</Button>
            )}
          </Space>
        </div>

        <Divider />

        {isEditingTopic ? (
          <Form form={topicForm} layout="vertical" onFinish={handleSaveTopicInfo}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
              <Form.Item label="Tên chủ đề" name="name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Trình độ" name="level" rules={[{ required: true }]}>
                <Select>
                  <Option value="N5">N5</Option>
                  <Option value="N4">N4</Option>
                  <Option value="N3">N3</Option>
                  <Option value="N2">N2</Option>
                  <Option value="N1">N1</Option>
                </Select>
              </Form.Item>
            </div>
            <Form.Item label="Mô tả" name="description">
              <Input.TextArea rows={2} />
            </Form.Item>
          </Form>
        ) : (
          <Descriptions column={2}>
            <Descriptions.Item label="Trình độ"><Tag color="green">{topic.level}</Tag></Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">{dayjs(topic.createdAt).format("DD/MM/YYYY")}</Descriptions.Item>
            <Descriptions.Item label="Mô tả">{topic.description}</Descriptions.Item>
          </Descriptions>
        )}
      </Card>

      {/* --- BODY: DANH SÁCH TỪ VỰNG --- */}
      <Card 
        title={<Space><AudioOutlined /> Danh sách từ vựng ({pagination.total})</Space>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openVocabModal()}>Thêm từ mới</Button>}
      >
        <Table 
          columns={vocabColumns} 
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
      </Card>

      {/* --- MODAL THÊM / SỬA TỪ VỰNG --- */}
      <Modal
        title={editingVocab ? "Cập nhật Từ vựng" : "Thêm Từ vựng mới"}
        open={isVocabModalOpen}
        onCancel={() => setIsVocabModalOpen(false)}
        onOk={() => vocabForm.submit()}
        width={600}
      >
        <Form form={vocabForm} layout="vertical" onFinish={handleSaveVocab}>
            <Form.Item 
                label="Từ vựng (Word)" 
                name="word" 
                rules={[{ required: true, message: "Vui lòng nhập từ vựng" }]}
            >
                <Input placeholder="Ví dụ: 日本" size="large" />
            </Form.Item>

            <Form.Item 
                label="Nghĩa (Meaning)" 
                name="meaning" 
                rules={[{ required: true, message: "Vui lòng nhập nghĩa" }]}
            >
                <Input placeholder="Ví dụ: Nhật Bản" />
            </Form.Item>

            <Form.Item 
                label="Kanji liên quan" 
                name="kanji_ids"
                tooltip="Chọn các chữ Kanji cấu thành nên từ này (nếu có)"
            >
                <Select 
                    mode="multiple" 
                    placeholder="Tìm và chọn Kanji..."
                    filterOption={false}
                    onSearch={fetchKanjiOptions} // Tìm kiếm server-side khi gõ
                    showSearch
                    style={{ width: '100%' }}
                >
                    {kanjiOptions.map(k => (
                        <Option key={k.id} value={k.id}>
                            {k.kanji} - {k.meanings?.[0]}
                        </Option>
                    ))}
                </Select>
            </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}