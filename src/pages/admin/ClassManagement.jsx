import { useEffect, useState } from "react";
import { 
  Table, Button, Input, Modal, Form, Select, 
  Tag, message, Popconfirm, DatePicker 
} from "antd";
import { 
  PlusOutlined, SearchOutlined, EditOutlined, 
  DeleteOutlined, ApartmentOutlined 
} from "@ant-design/icons";
import moment from "moment";
import { useNavigate } from "react-router-dom"; 

import { ClassApi } from "@/services/api/classApi";

const { Option } = Select;

export default function ClassManagement() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [form] = Form.useForm();

  // --- LOAD DATA ---
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const data = await ClassApi.getAll();
      setClasses(data || []);
    } catch (error) { message.error("Lỗi tải dữ liệu"); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAllData(); }, []);

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
      start_date: record.start_date ? moment(record.start_date) : null,
      end_date: record.end_date ? moment(record.end_date) : null,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        // 👇 THÊM 2 DÒNG NÀY: Gửi mảng rỗng mặc định
        courseIds: [], 
        teacherIds: [],
        start_date: values.start_date ? values.start_date.format("YYYY-MM-DD") : null,
        end_date: values.end_date ? values.end_date.format("YYYY-MM-DD") : null,
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
    } catch (error) { console.error(error); }
  };
  
  const handleDelete = async (id) => {
    try {
      await ClassApi.delete(id);
      message.success("Đã xóa lớp");
      fetchAllData();
    } catch (error) { message.error("Lỗi xóa lớp"); }
  };

  // --- COLUMNS ---
  const columns = [
    {
      title: 'Mã lớp',
      dataIndex: 'code',
      key: 'code',
      width: 150, // Cố định chiều rộng để bảng đỡ bị nhảy
      render: text => <b style={{color:'#1890ff'}}>{text}</b>,
    },
    {
      title: 'Tên lớp',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <a onClick={() => navigate(`/admin/classes/${record.class_id}`)} style={{fontWeight: 500}}>
          {text}
        </a>
      ),
    },
    {
      title: 'Khóa học',
      dataIndex: 'courses',
      width: 120,
      render: (courses) => (
         // Giữ nguyên hiển thị số lượng
         <Tag color="geekblue">{courses?.length || 0} khóa</Tag>
      )
    },
    {
      title: 'Giảng viên',
      dataIndex: 'teachers',
      width: 250, // Tăng độ rộng cột này để hiển thị tên
      render: (teachers) => (
         // 👇 SỬA ĐỔI: Hiển thị tên giảng viên
         <div style={{display:'flex', flexWrap:'wrap', gap: 4}}>
            {teachers && teachers.length > 0 ? (
                teachers.map(t => (
                    <Tag key={t.user_id}>{t.full_name}</Tag>
                ))
            ) : (
                <span style={{color: '#ccc', fontSize: 12}}>Chưa gán</span>
            )}
         </div>
      )
    },
    {
      title: 'Thời gian',
      key: 'time',
      width: 150,
      render: (_, r) => (
        <div style={{fontSize: 13}}>
          <div>BĐ: {r.start_date ? moment(r.start_date).format("DD/MM/YYYY") : '--'}</div>
          <div>KT: {r.end_date ? moment(r.end_date).format("DD/MM/YYYY") : '--'}</div>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      align: 'center',
      width: 120,
      render: (status) => {
        let color = status === 'Active' ? 'green' : status === 'Pending' ? 'orange' : 'red';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <div style={{display:'flex', justifyContent:'center', gap: 8}}>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          <Popconfirm title="Xóa lớp?" onConfirm={() => handleDelete(record.class_id)}>
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}><ApartmentOutlined /> Quản lý Lớp học</h2>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={handleCreate}>
          Mở lớp mới
        </Button>
      </div>

      <div style={{ background: 'white', padding: 24, borderRadius: 8 }}>
        <div style={{ marginBottom: 16, maxWidth: 400 }}>
          <Input prefix={<SearchOutlined />} placeholder="Tìm kiếm..." allowClear />
        </div>
        <Table columns={columns} dataSource={classes} rowKey="class_id" loading={loading} pagination={{ pageSize: 8 }} />
      </div>

      {/* MODAL ĐÃ ĐƯỢC LÀM TO HƠN */}
      <Modal
        title={editingClass ? "Chỉnh sửa thông tin" : "Tạo lớp mới"}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        maskClosable={false}
        width={800} // 👈 Tăng kích thước Modal lên 800px (Mặc định là 520px)
        centered // Căn giữa màn hình
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
            <div style={{display: 'flex', gap: 24}}>
                <Form.Item name="code" label="Mã lớp" rules={[{ required: true }]} style={{flex: 1}}>
                  <Input size="large" placeholder="VD: REACT-K15" />
                </Form.Item>
                <Form.Item name="name" label="Tên lớp" rules={[{ required: true }]} style={{flex: 2}}>
                  <Input size="large" placeholder="VD: ReactJS K15" />
                </Form.Item>
            </div>
            
            <div style={{display: 'flex', gap: 24}}>
                <Form.Item name="status" label="Trạng thái" style={{flex: 1}}>
                  <Select size="large">
                    <Option value="Pending">Sắp mở</Option>
                    <Option value="Active">Đang học</Option>
                    <Option value="Finished">Kết thúc</Option>
                  </Select>
                </Form.Item>
                
                <Form.Item name="start_date" label="Ngày bắt đầu" style={{flex: 1}}>
                  <DatePicker size="large" format="DD/MM/YYYY" style={{width:'100%'}} />
                </Form.Item>
                
                <Form.Item name="end_date" label="Ngày kết thúc" style={{flex: 1}}>
                  <DatePicker size="large" format="DD/MM/YYYY" style={{width:'100%'}} />
                </Form.Item>
            </div>
        </Form>
      </Modal>
    </div>
  );
}