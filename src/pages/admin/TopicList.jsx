import React, { useState } from "react";
import { 
  Table, Card, Button, Input, Tag, Space, 
  Avatar, Typography, Tooltip 
} from "antd";
import { 
  SearchOutlined, PlusOutlined, FolderOpenOutlined, 
  RightOutlined, UserOutlined 
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Title } = Typography;

// 🟢 MOCK DATA: Danh sách các chủ đề
const MOCK_TOPICS_LIST = [
  {
    id: "a5f6d228-aa76-455e-ac88-a3ac59736ccf",
    name: "Chào hỏi cơ bản",
    level: "N5",
    vocabCount: 15,
    icon: null, // Không có ảnh thì dùng icon mặc định
    updatedAt: "2025-12-22T17:12:21.600Z",
  },
  {
    id: "b123-456-789",
    name: "Gia đình & Người thân",
    level: "N4",
    vocabCount: 32,
    icon: "https://cdn-icons-png.flaticon.com/512/3069/3069172.png",
    updatedAt: "2025-12-20T10:00:00.000Z",
  },
  {
    id: "c987-654-321",
    name: "Phỏng vấn xin việc",
    level: "N3",
    vocabCount: 50,
    icon: "https://cdn-icons-png.flaticon.com/512/5660/5660558.png",
    updatedAt: "2025-12-18T08:30:00.000Z",
  },
];

export default function TopicList() {
  const navigate = useNavigate(); // Hook để chuyển trang
  const [searchText, setSearchText] = useState("");
  const [topics, setTopics] = useState(MOCK_TOPICS_LIST);

  // Xử lý tìm kiếm
  const filteredData = topics.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Hàm helper chọn màu cho Level
  const getLevelColor = (level) => {
    switch (level) {
      case "N1": return "red";
      case "N2": return "volcano";
      case "N3": return "gold";
      case "N4": return "blue";
      case "N5": return "green";
      default: return "default";
    }
  };

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
            <div style={{ fontWeight: 600, fontSize: 15 }}>{text}</div>
            <div style={{ fontSize: 12, color: '#888' }}>ID: {record.id.split('-')[0]}...</div>
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
      title: "Số từ vựng",
      dataIndex: "vocabCount",
      key: "vocabCount",
      width: 120,
      align: 'center',
      render: (count) => <b>{count}</b>,
    },
    {
      title: "Cập nhật cuối",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 150,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      align: 'right',
      render: (_, record) => (
        <Button 
          type="primary" 
          ghost
          icon={<FolderOpenOutlined />}
          // 🟢 QUAN TRỌNG: Chuyển hướng kèm theo ID của chủ đề
          onClick={() => navigate(`/admin/topics/${record.id}`)}
        >
          Quản lý
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Quản lý Chủ đề</Title>
        <Button type="primary" icon={<PlusOutlined />} size="large">
          Thêm chủ đề mới
        </Button>
      </div>

      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Input 
            placeholder="Tìm kiếm chủ đề..." 
            prefix={<SearchOutlined />} 
            style={{ width: 300 }}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 6 }}
        />
      </Card>
    </div>
  );
}