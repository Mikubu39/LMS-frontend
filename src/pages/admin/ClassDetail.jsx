// ✅ src/pages/admin/ClassDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Tabs, Table, Button, Progress, Card, 
  List, Tag, Statistic, message, Modal, Select, Spin 
} from "antd";
import { 
  UserAddOutlined, ArrowLeftOutlined, 
  TeamOutlined, BookOutlined 
} from "@ant-design/icons";

import { ClassApi } from "@/services/api/classApi";
import { UserApi } from "@/services/api/userApi";

export default function ClassDetail() {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]); // Dữ liệu thật từ API
  const [loading, setLoading] = useState(false);

  // Modal Thêm học viên
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [studentOptions, setStudentOptions] = useState([]); // List user để chọn
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // --- LOAD DATA ---
  const fetchClassData = async () => {
    setLoading(true);
    try {
      // 1. Lấy thông tin lớp & danh sách học viên song song
      const [info, studentList] = await Promise.all([
        ClassApi.getById(classId),
        ClassApi.getStudents(classId)
      ]);
      
      setClassInfo(info);
      setStudents(studentList || []);

    } catch (error) {
      console.error("Lỗi tải trang chi tiết:", error);
      // message.error("Lỗi tải dữ liệu lớp");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) fetchClassData();
  }, [classId]);

  // --- LOAD USER LIST (Cho Modal Thêm) ---
  const handleOpenAddModal = async () => {
    setIsAddModalOpen(true);
    try {
      // Lấy tất cả user có role 'student' để chọn
      // Backend UserApi.getAll cần hỗ trợ filter role hoặc ta filter client
      const users = await UserApi.getAll({ role: 'student', limit: 1000 });
      
      // Lọc ra những người CHƯA có trong lớp
      const existingIds = students.map(s => s.student_id);
      const available = users.filter(u => !existingIds.includes(u.user_id));
      
      setStudentOptions(available.map(u => ({
        value: u.user_id,
        label: `${u.full_name} (${u.email})`
      })));
    } catch (e) {
      message.error("Không tải được danh sách học viên");
    }
  };

  // --- HANDLER THÊM HỌC VIÊN ---
  const handleAddStudent = async () => {
    if (!selectedStudentId) return message.warning("Vui lòng chọn học viên");
    try {
      await ClassApi.addStudent(classId, selectedStudentId);
      message.success("Đã thêm học viên vào lớp");
      setIsAddModalOpen(false);
      fetchClassData(); // Reload danh sách
    } catch (e) {
      message.error("Lỗi khi thêm (Có thể học viên đã trong lớp)");
    }
  };

  // --- TABLE CONFIG ---
  const columns = [
    { title: 'Họ tên', dataIndex: 'full_name', key: 'name', render: t => <b>{t}</b> },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Ngày tham gia', dataIndex: 'joined_at', key: 'join', render: d => new Date(d).toLocaleDateString('vi-VN') },
    { title: 'Tiến độ', dataIndex: 'progress', key: 'prog', render: val => <Progress percent={val} size="small" /> },
    { title: 'Thao tác', key: 'action', render: () => <Button size="small" danger>Xóa</Button> }
  ];

  if (loading) return <div style={{padding: 50, textAlign:'center'}}><Spin size="large" /></div>;

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/classes')} style={{padding:0, marginBottom: 10}}>
          Quay lại danh sách
        </Button>
        <div style={{ background:'white', padding: 20, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24 }}>{classInfo?.name || 'Đang tải...'}</h1>
            <div style={{ color: '#666', marginTop: 5 }}>
              <Tag color="blue" style={{fontSize: 14, padding: '4px 8px'}}>{classInfo?.code}</Tag> 
              <span style={{marginLeft: 10}}>Giảng viên: <b>{classInfo?.teacher?.full_name || 'Chưa gán'}</b></span>
            </div>
          </div>
          <Statistic title="Sĩ số hiện tại" value={students.length} prefix={<TeamOutlined />} suffix={`/ ${classInfo?.max_students || '∞'}`} />
        </div>
      </div>

      {/* TABS CONTENT */}
      <Card>
        <Tabs defaultActiveKey="1" items={[
          {
            key: '1',
            label: <span><TeamOutlined /> Danh sách Học viên</span>,
            children: (
              <div>
                <div style={{textAlign: 'right', marginBottom: 16}}>
                  <Button type="primary" icon={<UserAddOutlined />} onClick={handleOpenAddModal}>
                    Thêm học viên
                  </Button>
                </div>
                <Table dataSource={students} columns={columns} rowKey="student_id" />
              </div>
            ),
          },
          {
            key: '2',
            label: <span><BookOutlined /> Bài tập & Điểm số</span>,
            children: <EmptyState text="Chức năng đang phát triển" />,
          }
        ]} />
      </Card>

      {/* MODAL ADD STUDENT */}
      <Modal 
        title="Thêm học viên vào lớp" 
        open={isAddModalOpen} 
        onOk={handleAddStudent}
        onCancel={() => setIsAddModalOpen(false)}
        okText="Thêm vào lớp"
        cancelText="Hủy"
      >
        <p>Chọn học viên từ danh sách hệ thống:</p>
        <Select 
          showSearch
          style={{ width: '100%' }} 
          placeholder="Tìm theo tên hoặc email..."
          filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          options={studentOptions}
          onChange={setSelectedStudentId}
        />
      </Modal>
    </div>
  );
}

const EmptyState = ({text}) => (
  <div style={{padding: 40, textAlign:'center', color:'#999'}}>
    <BookOutlined style={{fontSize: 40, marginBottom: 10}} />
    <p>{text}</p>
  </div>
);