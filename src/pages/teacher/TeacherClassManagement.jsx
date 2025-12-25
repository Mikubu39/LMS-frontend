// src/pages/teacher/TeacherClassManagement.jsx
import { useEffect, useState, useMemo } from "react";
import { 
  Table, Input, Card, Typography, 
  Row, Col, Tabs, Badge, Space, 
  Tag, Avatar, Tooltip, message 
} from "antd";
import { 
  SearchOutlined, TeamOutlined, 
  CalendarOutlined, UserOutlined, 
  ApartmentOutlined 
} from "@ant-design/icons";
import moment from "moment";
import { useNavigate } from "react-router-dom"; 

import { ClassApi } from "@/services/api/classApi";

const { Title, Text } = Typography;

export default function TeacherClassManagement() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State cho bộ lọc giao diện (giống Admin)
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // --- LOAD DATA ---
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // FIX LỖI API: Truyền params để tránh lỗi "skip is not a number"
      const params = { page: 1, limit: 1000 };
      const response = await ClassApi.getAll(params);

      // Xử lý dữ liệu an toàn
      const listData = Array.isArray(response) ? response : (response.data || []);
      setClasses(listData);
    } catch (error) { 
      console.error("Fetch Error:", error);
      message.error("Lỗi tải dữ liệu lớp học"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  // --- FILTER LOGIC (Giống Admin) ---
  const filteredData = useMemo(() => {
    let result = classes || [];

    // 1. Lọc theo Tab trạng thái
    if (statusFilter !== 'All') {
      result = result.filter(c => c.status === statusFilter);
    }

    // 2. Lọc theo ô tìm kiếm
    if (searchText) {
      const lower = searchText.toLowerCase();
      result = result.filter(c => 
        c.name?.toLowerCase().includes(lower) || 
        c.code?.toLowerCase().includes(lower)
      );
    }
    return result;
  }, [classes, statusFilter, searchText]);

  // --- COLUMNS (Giao diện giống Admin) ---
  const columns = [
    {
      title: 'Lớp học',
      dataIndex: 'name',
      key: 'name',
      width: 280,
      render: (text, record) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
           {/* Link điều hướng sang chi tiết lớp */}
           <a onClick={() => navigate(`/teacher/classes/${record.class_id}`)} style={{fontWeight: 600, fontSize: 15, color: '#1677ff'}}>
             {text}
           </a>
           <Space size={8} style={{marginTop: 4}}>
              <Tag color="geekblue">{record.code}</Tag>
              <Text type="secondary" style={{fontSize: 12}}>
                <TeamOutlined /> {record.total_students || record.students?.length || 0} HV
              </Text>
           </Space>
        </div>
      ),
    },
    {
      title: 'Giảng viên', // Hiển thị Avatar Group thay vì Tag đơn điệu
      key: 'teachers',
      width: 200,
      render: (_, r) => (
         <div style={{display:'flex', alignItems:'center', gap: 8}}>
            {Array.isArray(r.teachers) && r.teachers.length > 0 ? (
                <Avatar.Group maxCount={3} size="small">
                    {r.teachers.map(t => (
                        <Tooltip title={t.full_name} key={t.user_id}>
                            <Avatar 
                              src={t.avatar} 
                              style={{backgroundColor: '#87d068'}} 
                              icon={<UserOutlined />} 
                            />
                        </Tooltip>
                    ))}
                </Avatar.Group>
            ) : <span style={{color:'#999', fontSize: 12, fontStyle:'italic'}}>--</span>}
         </div>
      )
    },
    {
      title: 'Thời gian đào tạo',
      key: 'time',
      width: 220,
      render: (_, r) => (
        <div style={{fontSize: 13}}>
           <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4}}>
              <CalendarOutlined style={{color: '#1890ff'}}/> 
              <span>{r.start_date ? moment(r.start_date).format("DD/MM/YYYY") : '--'}</span>
           </div>
           <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
              <span style={{color: '#888', paddingLeft: 22}}>đến</span>
              <span>{r.end_date ? moment(r.end_date).format("DD/MM/YYYY") : '--'}</span>
           </div>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      align: 'center',
      width: 150,
      render: (status) => {
        // Dùng Badge thay vì Tag để giống Admin
        let color = status === 'Active' ? 'success' : status === 'Pending' ? 'warning' : 'default';
        let text = status === 'Active' ? 'Đang dạy' : status === 'Pending' ? 'Sắp mở' : 'Kết thúc';
        return <Badge status={color} text={text} />;
      }
    }
  ];

  // Các Tab trạng thái
  const tabItems = [
    { key: 'All', label: 'Tất cả' },
    { key: 'Active', label: 'Đang dạy' },
    { key: 'Pending', label: 'Sắp mở' },
    { key: 'Finished', label: 'Đã kết thúc' },
  ];

  return (
    <div style={{ padding: 24, background: '#f5f7fa', minHeight: '100vh' }}>
      
      {/* HEADER: Title & Subtitle */}
      <div style={{ marginBottom: 24 }}>
         <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ margin: 0 }}>
                <ApartmentOutlined style={{marginRight: 10}}/> 
                Lớp học của tôi
              </Title>
              <Text type="secondary">Danh sách các lớp bạn đang phụ trách giảng dạy</Text>
            </Col>
            {/* Không có nút "Tạo lớp" vì Teacher chỉ được xem */}
         </Row>
      </div>

      {/* MAIN CONTENT: Card + Tabs + Table */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        
        {/* Tabs lọc trạng thái */}
        <Tabs 
          activeKey={statusFilter} 
          onChange={setStatusFilter} 
          items={tabItems} 
          style={{ marginBottom: 16 }} 
        />

        {/* Thanh tìm kiếm */}
        <div style={{ marginBottom: 20 }}>
          <Input 
             prefix={<SearchOutlined style={{color:'#bfbfbf'}} />} 
             placeholder="Tìm kiếm theo Tên hoặc Mã lớp..." 
             size="large"
             allowClear
             style={{ maxWidth: 400 }}
             onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {/* Bảng dữ liệu */}
        <Table 
            columns={columns} 
            dataSource={filteredData} 
            rowKey="class_id" 
            loading={loading} 
            pagination={{ pageSize: 8, showTotal: (total) => `Tổng ${total} lớp` }} 
        />
      </Card>
    </div>
  );
}