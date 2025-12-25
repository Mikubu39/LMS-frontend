// src/pages/admin/ClassManagement.jsx
import { useEffect, useState, useMemo } from "react";
import { 
  Table, Button, Input, Modal, Form, Select, 
  Tag, message, Popconfirm, DatePicker, Card, 
  Avatar, Tooltip, Typography, Space, Row, Col, Tabs, Badge 
} from "antd";
import { 
  PlusOutlined, SearchOutlined, EditOutlined, 
  DeleteOutlined, CalendarOutlined, TeamOutlined, 
  UserOutlined
} from "@ant-design/icons";
import moment from "moment";
import { useNavigate } from "react-router-dom"; 
// Import đúng các API service
import { ClassApi } from "@/services/api/classApi";
import { UserApi } from "@/services/api/userApi"; // [FIX] Import UserApi

const { Option } = Select;
const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

export default function ClassManagement() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]); // State lưu danh sách giáo viên
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [form] = Form.useForm();

  // --- LOAD DATA ---
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const res = await ClassApi.getAll({ page: 1, limit: 1000 });
      // [FIX] Xử lý an toàn: API có thể trả về { data: [] } hoặc []
      const dataList = res.data || res.items || (Array.isArray(res) ? res : []);
      setClasses(dataList);
    } catch (error) { 
      console.error("Fetch Error:", error);
      message.error("Lỗi tải dữ liệu lớp học"); 
    } finally { 
      setLoading(false); 
    }
  };

  // Hàm tải danh sách giáo viên
  const fetchTeachers = async () => {
    try {
        // [FIX] Dùng UserApi.getAll để gọi đúng /users/admin
        const res = await UserApi.getAll({ role: 'teacher', limit: 100 });
        
        // [FIX] Kiểm tra cấu trúc dữ liệu trả về (Backend thường trả về {data: [...], meta: ...})
        const teacherList = res.data || res || [];
        
        if (Array.isArray(teacherList)) {
            setTeachers(teacherList);
        } else {
            console.warn("API Teacher trả về không phải mảng:", res);
            setTeachers([]);
        }
    } catch (error) {
        console.error("Lỗi tải giáo viên:", error);
    }
  };

  useEffect(() => { 
      fetchAllData(); 
      fetchTeachers(); 
  }, []);

  // --- HANDLERS ---
  const handleCreate = () => {
    setEditingClass(null);
    form.resetFields();
    form.setFieldsValue({ status: 'Pending' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingClass(record);
    form.setFieldsValue({
      ...record,
      dateRange: [
        record.start_date ? moment(record.start_date) : null,
        record.end_date ? moment(record.end_date) : null,
      ],
      // [FIX] Map danh sách object teachers thành mảng các ID để hiển thị trong Select
      teacherIds: record.teachers?.map(t => t.user_id) || [],
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const [start, end] = values.dateRange || [];
      
      const payload = {
        code: values.code,
        name: values.name,
        status: values.status,
        courseIds: [], 
        // [FIX] Lấy teacherIds từ form values gửi lên server
        teacherIds: values.teacherIds || [], 
        start_date: start ? start.format("YYYY-MM-DD") : null,
        end_date: end ? end.format("YYYY-MM-DD") : null,
      };

      if (editingClass) {
        await ClassApi.update(editingClass.class_id, payload);
        message.success("Cập nhật thành công");
      } else {
        await ClassApi.create(payload);
        message.success("Tạo lớp thành công");
      }
      setIsModalOpen(false);
      fetchAllData();
    } catch (error) { 
        console.error("Save Error:", error);
        message.error("Lưu thất bại");
    }
  };
  
  const handleDelete = async (id) => {
    try {
      await ClassApi.delete(id);
      message.success("Đã xóa lớp");
      fetchAllData();
    } catch (error) { message.error("Lỗi xóa lớp"); }
  };

  // --- FILTER LOGIC ---
  const filteredData = useMemo(() => {
    let result = classes || [];

    if (statusFilter !== 'All') {
      result = result.filter(c => c.status === statusFilter);
    }

    if (searchText) {
      const lower = searchText.toLowerCase();
      result = result.filter(c => 
        c.name?.toLowerCase().includes(lower) || 
        c.code?.toLowerCase().includes(lower)
      );
    }
    return result;
  }, [classes, statusFilter, searchText]);

  // --- COLUMNS ---
  const columns = [
    {
      title: 'Lớp học',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text, record) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
           <a onClick={() => navigate(`/admin/classes/${record.class_id}`)} style={{fontWeight: 600, fontSize: 15, color: '#1677ff'}}>
             {text}
           </a>
           <Space size={8} style={{marginTop: 4}}>
              <Tag color="geekblue">{record.code}</Tag>
              {/* [FIX] Sử dụng total_students thay vì students.length */}
              <Text type="secondary" style={{fontSize: 12}}>
                <TeamOutlined /> {record.total_students || 0} HV
              </Text>
           </Space>
        </div>
      ),
    },
    {
      title: 'Giảng viên',
      key: 'info',
      width: 200,
      render: (_, r) => (
         <div style={{display:'flex', alignItems:'center', gap: 8}}>
            {/* [FIX] Kiểm tra mảng teachers an toàn hơn */}
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
            ) : <span style={{color:'#999', fontSize: 12, fontStyle:'italic'}}>Chưa gán GV</span>}
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
      width: 120,
      render: (status) => {
        let color = status === 'Active' ? 'success' : status === 'Pending' ? 'warning' : 'default';
        let text = status === 'Active' ? 'Đang học' : status === 'Pending' ? 'Sắp mở' : 'Kết thúc';
        return <Badge status={color} text={text} />;
      }
    },
    {
      title: '',
      key: 'action',
      align: 'right',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa thông tin">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm title="Xóa lớp này?" description="Hành động không thể hoàn tác" onConfirm={() => handleDelete(record.class_id)} okType="danger">
            <Tooltip title="Xóa lớp">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const tabItems = [
    { key: 'All', label: 'Tất cả' },
    { key: 'Active', label: 'Đang hoạt động' },
    { key: 'Pending', label: 'Sắp mở' },
    { key: 'Finished', label: 'Đã kết thúc' },
  ];

  return (
    <div style={{ padding: 24, background: '#f5f7fa', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
         <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ margin: 0 }}>Quản lý Lớp học</Title>
              <Text type="secondary">Danh sách các lớp học và tiến độ đào tạo</Text>
            </Col>
            <Col>
               <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleCreate}>
                  Mở lớp mới
               </Button>
            </Col>
         </Row>
      </div>

      {/* Main Content */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Tabs activeKey={statusFilter} onChange={setStatusFilter} items={tabItems} style={{ marginBottom: 16 }} />

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

        <Table 
          columns={columns} 
          dataSource={filteredData} 
          rowKey="class_id" 
          loading={loading} 
          pagination={{ pageSize: 8, showSizeChanger: true, showTotal: (total) => `Tổng ${total} lớp` }} 
        />
      </Card>

      {/* Modal Form */}
      <Modal
        title={editingClass ? "Cập nhật thông tin lớp" : "Mở lớp học mới"}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        maskClosable={false}
        width={700}
        centered
        okText={editingClass ? "Lưu thay đổi" : "Tạo lớp"}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
            <Row gutter={24}>
                <Col span={12}>
                    <Form.Item name="code" label="Mã lớp" rules={[{ required: true, message: 'Nhập mã lớp' }]}>
                        <Input size="large" placeholder="VD: FE-K15" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="name" label="Tên lớp học" rules={[{ required: true, message: 'Nhập tên lớp' }]}>
                        <Input size="large" placeholder="VD: Frontend Master K15" />
                    </Form.Item>
                </Col>
            </Row>
            
            <Row gutter={24}>
                <Col span={24}>
                     {/* [FIX] Thêm ô chọn giảng viên */}
                    <Form.Item name="teacherIds" label="Giảng viên phụ trách">
                        <Select 
                            mode="multiple" 
                            size="large" 
                            placeholder="Chọn giảng viên..."
                            filterOption={(input, option) => 
                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {teachers.map(t => (
                                <Option key={t.user_id} value={t.user_id}>
                                    {t.full_name || t.email} ({t.email})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={24}>
                <Col span={8}>
                    <Form.Item name="status" label="Trạng thái">
                        <Select size="large">
                            <Option value="Pending">Sắp mở</Option>
                            <Option value="Active">Đang học</Option>
                            <Option value="Finished">Kết thúc</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={16}>
                    <Form.Item name="dateRange" label="Thời gian đào tạo (Bắt đầu - Kết thúc)">
                        <RangePicker size="large" format="DD/MM/YYYY" style={{width:'100%'}} placeholder={['Ngày bắt đầu', 'Ngày kết thúc']} />
                    </Form.Item>
                </Col>
            </Row>
        </Form>
      </Modal>
    </div>
  );
}