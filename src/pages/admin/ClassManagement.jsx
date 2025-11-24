// ✅ src/pages/admin/ClassManagement.jsx
import { useEffect, useState } from "react";
import { 
  Table, Button, Input, Modal, Form, Select, 
  Tag, message, Popconfirm, DatePicker, InputNumber 
} from "antd";
import { 
  PlusOutlined, SearchOutlined, EditOutlined, 
  DeleteOutlined, ApartmentOutlined 
} from "@ant-design/icons";
import moment from "moment";
import { useNavigate } from "react-router-dom"; // 👈 1. Import useNavigate

import { ClassApi } from "@/services/api/classApi";
import { CourseApi } from "@/services/api/courseApi";
import { UserApi } from "@/services/api/userApi";

const { Option } = Select;

export default function ClassManagement() {
  const navigate = useNavigate(); // 👈 2. Khai báo hook này để dùng chuyển trang
  
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [coursesList, setCoursesList] = useState([]);
  const [teachersList, setTeachersList] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [form] = Form.useForm();

  // --- 1. LOAD DATA ---
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [classData, courseRes, teacherRes] = await Promise.all([
        ClassApi.getAll(),
        CourseApi.getCourses({ limit: 100 }),
        UserApi.getAll({ role: 'teacher', limit: 100 }) 
      ]);

      setClasses(classData || []);
      setCoursesList(courseRes.courses || courseRes || []);
      setTeachersList(teacherRes || []);

    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      message.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- 2. HANDLERS ---
  const handleCreate = () => {
    setEditingClass(null);
    form.resetFields();
    form.setFieldsValue({ max_students: 30, status: 'Pending' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingClass(record);
    form.setFieldsValue({
      ...record,
      course_id: record.course?.id,
      teacher_id: record.teacher?.user_id,
      start_date: record.start_date ? moment(record.start_date) : null,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await ClassApi.delete(id);
      message.success("Đã xóa lớp học");
      fetchAllData();
    } catch (error) {
      message.error("Lỗi khi xóa");
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        start_date: values.start_date ? values.start_date.format("YYYY-MM-DD") : null,
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
      console.error(error);
      message.error("Lỗi khi lưu");
    }
  };

  // --- 3. COLUMNS ---
  const columns = [
    {
      title: 'Mã lớp',
      dataIndex: 'code',
      key: 'code',
      render: text => <b style={{color:'#1890ff'}}>{text}</b>,
    },
    {
      title: 'Tên lớp',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        // 👇 3. Sử dụng navigate ở đây để bấm vào tên lớp -> Chuyển sang trang chi tiết
        <a onClick={() => navigate(`/admin/classes/${record.class_id}`)} style={{fontWeight: 500}}>
          {text}
        </a>
      ),
    },
    {
      title: 'Khóa học',
      dataIndex: ['course', 'title'],
      key: 'course',
      render: text => <Tag color="geekblue">{text || 'Chưa gán'}</Tag>
    },
    {
      title: 'Giảng viên',
      dataIndex: ['teacher', 'full_name'], 
      key: 'teacher',
      render: (text) => text || <i style={{color:'#999'}}>Chưa gán</i>
    },
    {
      title: 'Lịch học',
      dataIndex: 'schedule',
      key: 'schedule',
    },
    {
      title: 'Sĩ số',
      key: 'capacity',
      align: 'center',
      render: (_, r) => <span>0 / {r.max_students}</span>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => {
        let color = 'default';
        if (status === 'Active') color = 'green';
        if (status === 'Pending') color = 'orange';
        if (status === 'Finished') color = 'red';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <div style={{display:'flex', justifyContent:'center', gap: 8}}>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          <Popconfirm title="Xóa lớp này?" onConfirm={() => handleDelete(record.class_id)}>
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <ApartmentOutlined /> Quản lý Lớp học
          </h2>
          <div style={{ color: '#666', marginTop: 4 }}>Tổ chức lớp học, phân công giảng viên</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={handleCreate}>
          Mở lớp mới
        </Button>
      </div>

      <div style={{ background: 'white', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: 16, maxWidth: 400 }}>
          <Input prefix={<SearchOutlined />} placeholder="Tìm kiếm..." allowClear />
        </div>
        <Table 
          columns={columns} 
          dataSource={classes} 
          rowKey="class_id" 
          loading={loading} 
          pagination={{ pageSize: 8 }} 
        />
      </div>

      <Modal
        title={editingClass ? "Chỉnh sửa thông tin lớp" : "Mở lớp học mới"}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        width={650}
        okText="Lưu thông tin"
        cancelText="Hủy"
        centered
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="code" label="Mã lớp" style={{ flex: 1 }} rules={[{ required: true, message: 'Bắt buộc' }]}>
              <Input placeholder="VD: REACT-K15" />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái" style={{ flex: 1 }}>
              <Select>
                <Option value="Pending">Sắp mở</Option>
                <Option value="Active">Đang học</Option>
                <Option value="Finished">Kết thúc</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="name" label="Tên lớp học" rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input placeholder="VD: ReactJS Thực chiến K15" />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="course_id" label="Thuộc Khóa học" style={{ flex: 1 }} rules={[{ required: true, message: 'Chọn khóa học' }]}>
              <Select placeholder="-- Chọn khóa học --" showSearch optionFilterProp="children">
                {coursesList.map(c => (
                  <Option key={c.id} value={c.id}>{c.title}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="teacher_id" label="Giảng viên phụ trách" style={{ flex: 1 }} rules={[{ required: true, message: 'Chọn giảng viên' }]}>
              <Select placeholder="-- Chọn GV --" showSearch optionFilterProp="children">
                {teachersList.map(t => (
                  <Option key={t.user_id} value={t.user_id}>
                    {t.full_name} ({t.email})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="schedule" label="Lịch học" style={{ flex: 2 }}>
              <Input placeholder="VD: T2-T4-T6, 19h30" />
            </Form.Item>
            <Form.Item name="max_students" label="Sĩ số tối đa" style={{ flex: 1 }}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Form.Item name="start_date" label="Ngày khai giảng">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}