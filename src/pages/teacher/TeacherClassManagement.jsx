// src/pages/teacher/TeacherClassManagement.jsx
import { useEffect, useState } from "react";
import { 
  Table, Input, Tag, message 
} from "antd";
import { 
  SearchOutlined, ApartmentOutlined 
} from "@ant-design/icons";
import moment from "moment";
import { useNavigate } from "react-router-dom"; 

import { ClassApi } from "@/services/api/classApi";

export default function TeacherClassManagement() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // --- LOAD DATA ---
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Lưu ý: Nếu backend có API riêng lấy lớp của GV (VD: getMyClasses), hãy dùng API đó.
      // Ở đây tạm thời dùng getAll giống Admin.
      const data = await ClassApi.getAll();
      setClasses(data || []);
    } catch (error) { message.error("Lỗi tải dữ liệu"); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAllData(); }, []);

  // --- COLUMNS ---
  const columns = [
    {
      title: 'Mã lớp',
      dataIndex: 'code',
      key: 'code',
      width: 150, 
      render: text => <b style={{color:'#1890ff'}}>{text}</b>,
    },
    {
      title: 'Tên lớp',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        // 🟢 SỬA: Điều hướng sang trang chi tiết của Teacher
        <a onClick={() => navigate(`/teacher/classes/${record.class_id}`)} style={{fontWeight: 500}}>
          {text}
        </a>
      ),
    },
    {
      title: 'Khóa học',
      dataIndex: 'courses',
      width: 120,
      render: (courses) => (
         <Tag color="geekblue">{courses?.length || 0} khóa</Tag>
      )
    },
    {
      title: 'Giảng viên',
      dataIndex: 'teachers',
      width: 250, 
      render: (teachers) => (
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
    // ❌ ĐÃ XÓA CỘT THAO TÁC
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}><ApartmentOutlined /> Lớp học của tôi</h2>
        {/* ❌ ĐÃ XÓA NÚT TẠO LỚP */}
      </div>

      <div style={{ background: 'white', padding: 24, borderRadius: 8 }}>
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
      
      {/* ❌ ĐÃ XÓA MODAL */}
    </div>
  );
}