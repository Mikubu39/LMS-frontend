import { useEffect, useState, useMemo } from "react"; 
import { useParams, useNavigate } from "react-router-dom";
import { 
  Tabs, Table, Button, Card, 
  Tag, message, Modal, Select, Spin, 
  Popconfirm, Input, Avatar, Empty, List, Upload, Tooltip 
} from "antd";
import { 
  UserAddOutlined, ArrowLeftOutlined, 
  TeamOutlined, BookOutlined, DeleteOutlined,
  SearchOutlined, ExportOutlined, UserOutlined, 
  UploadOutlined, PlusOutlined, ReadOutlined,
  TrophyOutlined, EditOutlined, FilterOutlined, 
  ManOutlined, WomanOutlined, IdcardOutlined 
} from "@ant-design/icons";
import moment from "moment";
import * as XLSX from 'xlsx'; 

import { ClassApi } from "@/services/api/classApi";
import { UserApi } from "@/services/api/userApi";
import { CourseApi } from "@/services/api/courseApi"; 

import ClassQuizTab from "../../components/ClassQuizTab";
import ClassEssayTab from "../../components/ClassEssayTab";

export default function ClassDetail() {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  // Tab States
  const [allCourses, setAllCourses] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [isAddCourseModal, setIsAddCourseModal] = useState(false);
  const [isAddTeacherModal, setIsAddTeacherModal] = useState(false);
  const [selectedIdsToAdd, setSelectedIdsToAdd] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [searchText, setSearchText] = useState('');

  // Add Student Modal State
  const [isAddStudentModal, setIsAddStudentModal] = useState(false);
  const [allStudentsPool, setAllStudentsPool] = useState([]); 
  const [selectedStudentKeys, setSelectedStudentKeys] = useState([]); 
  const [addingStudents, setAddingStudents] = useState(false);
  const [studentSearchText, setStudentSearchText] = useState(""); 

  // Import Excel States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [excelEmails, setExcelEmails] = useState([]); 
  const [importing, setImporting] = useState(false);

  // --- LOAD DATA ---
  const fetchClassData = async () => {
    setLoading(true);
    try {
      const [info, studentList] = await Promise.all([
        ClassApi.getById(classId),
        ClassApi.getStudents(classId)
      ]);
      setClassInfo(info);
      setStudents(studentList || []);
    } catch (error) { message.error("Lỗi tải trang chi tiết"); } 
    finally { setLoading(false); }
  };

  useEffect(() => { if (classId) fetchClassData(); }, [classId]);

  useEffect(() => {
    if (classInfo?.courses?.length > 0 && !selectedCourseId) {
       setSelectedCourseId(classInfo.courses[0].id);
    }
  }, [classInfo]);

  // --- MODAL THÊM HỌC VIÊN ---
  const handleOpenAddStudentModal = async () => {
    setIsAddStudentModal(true);
    setAddingStudents(true); 
    try {
        const res = await UserApi.getAll({ role: 'student', limit: 1000 });
        const existingIds = students.map(s => s.student_id);
        const availableStudents = res.filter(u => !existingIds.includes(u.user_id));
        
        setAllStudentsPool(availableStudents);
        setSelectedStudentKeys([]); 
        setStudentSearchText("");
    } catch (error) {
        message.error("Lỗi tải danh sách học viên");
    } finally {
        setAddingStudents(false);
    }
  };

  const handleAddStudentsSubmit = async () => {
    if (selectedStudentKeys.length === 0) return message.warning("Chưa chọn học viên nào");
    setAddingStudents(true);
    try {
      await Promise.all(selectedStudentKeys.map(id => ClassApi.addStudent(classId, id)));
      message.success(`Đã thêm ${selectedStudentKeys.length} học viên vào lớp`);
      setIsAddStudentModal(false);
      fetchClassData();
    } catch (err) { message.error("Có lỗi xảy ra khi thêm học viên"); } 
    finally { setAddingStudents(false); }
  };

  // Search trong Modal
  const filteredStudentPool = useMemo(() => {
    if (!studentSearchText) return allStudentsPool;
    const lower = studentSearchText.toLowerCase();
    return allStudentsPool.filter(s => 
        s.full_name?.toLowerCase().includes(lower) || 
        s.email?.toLowerCase().includes(lower) ||
        (s.phone && s.phone.includes(lower)) ||
        (s.student_code && s.student_code.toLowerCase().includes(lower)) // 👈 Search theo Mã SV
    );
  }, [allStudentsPool, studentSearchText]);

  // --- HANDLERS KHÁC ---
  const handleRemoveStudent = async (id) => {
    try {
      await ClassApi.removeStudent(classId, id);
      message.success("Đã xóa học viên");
      fetchClassData(); 
    } catch (error) { message.error("Lỗi khi xóa"); }
  };

  const handleExportExcel = () => {
    if (students.length === 0) return message.warning("Danh sách trống");
    const data = students.map((s, idx) => ({
      STT: idx + 1,
      "Mã SV": s.student_code || '',
      "Họ tên": s.full_name,
      "Email": s.email,
      "SĐT": s.phone || '',
      "Ngày sinh": s.dateOfBirth ? moment(s.dateOfBirth).format("DD/MM/YYYY") : '',
      "Giới tính": s.gender || '',
      "Địa chỉ": s.address || '',
      "Ngày tham gia": new Date(s.joined_at).toLocaleDateString(),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, `Class_${classInfo?.code}.xlsx`);
  };

  // ... (Các hàm import/export excel, add course/teacher giữ nguyên)
  const handleExcelFile = (file) => { /* ... */ };
  const handleImportStudents = async () => { /* ... */ };
  const openAddCourseModal = async () => { /* ... */ };
  const handleAddCourses = async () => { /* ... */ };
  const handleRemoveCourse = async (id) => { /* ... */ };
  const openAddTeacherModal = async () => { /* ... */ };
  const handleAddTeachers = async () => { /* ... */ };
  const handleRemoveTeacher = async (id) => { /* ... */ };

  // --- TABLE COLUMNS CONFIG ---

  // Search trong Bảng Chính
  const filteredStudents = students.filter(s => 
    s.full_name?.toLowerCase().includes(searchText.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchText.toLowerCase()) ||
    (s.student_code && s.student_code.toLowerCase().includes(searchText.toLowerCase()))
  );
  
  // 1. CẤU HÌNH BẢNG HỌC VIÊN CHÍNH (ĐÃ THÊM CỘT MÃ SV)
  const studentColumns = [
    {
        title: 'Mã SV', // 👈 CỘT MỚI
        dataIndex: 'student_code',
        width: 100,
        render: (code) => code ? <Tag color="blue" icon={<IdcardOutlined />}>{code}</Tag> : <span style={{color:'#ccc'}}>--</span>
    },
    { 
        title: 'Họ và tên', 
        width: 200,
        dataIndex: 'full_name',
        render: (t, r) => (
           <div style={{display:'flex', gap:12, alignItems:'center'}}>
              <Avatar src={r.avatar} icon={<UserOutlined/>} style={{backgroundColor:'#87d068'}}/>
              <div style={{fontWeight:600}}>{t}</div>
           </div>
        )
    },
    { 
        title: 'Email', 
        dataIndex: 'email', 
        width: 180,
        render: t => <div style={{fontSize:12, color:'#666'}}>{t}</div>
    },
    { 
        title: 'Giới tính', 
        dataIndex: 'gender', 
        width: 90,
        align: 'center',
        render: (g) => {
            if(g === 'Nam') return <Tag color="cyan" icon={<ManOutlined />}>Nam</Tag>;
            if(g === 'Nữ') return <Tag color="magenta" icon={<WomanOutlined />}>Nữ</Tag>;
            return <Tag>{g || '--'}</Tag>;
        }
    },
    { 
        title: 'Ngày sinh', 
        dataIndex: 'dateOfBirth', 
        width: 110,
        render: d => d ? moment(d).format("DD/MM/YYYY") : '--' 
    },
    { 
        title: 'Liên hệ', 
        key: 'contact',
        width: 180,
        render: (_, r) => (
            <div style={{fontSize: 13}}>
                <div>📞 {r.phone || '--'}</div>
                <Tooltip title={r.address}>
                    <div style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth: 160, color:'#666'}}>
                        🏠 {r.address || '--'}
                    </div>
                </Tooltip>
            </div>
        )
    },
    { 
        title: 'Thao tác', 
        align: 'right', 
        render: (_, r) => (
           <Popconfirm title="Xóa khỏi lớp?" onConfirm={() => handleRemoveStudent(r.student_id)} okButtonProps={{danger:true}}>
              <Button size="small" danger icon={<DeleteOutlined/>}>Xóa</Button>
           </Popconfirm>
        )
    }
  ];

  // 2. CẤU HÌNH BẢNG CHỌN HỌC VIÊN (MODAL) (ĐÃ THÊM CỘT MÃ SV)
  const addStudentColumns = [
    {
        title: 'Mã SV', // 👈 CỘT MỚI
        dataIndex: 'student_code',
        width: 100,
        render: (code) => code ? <span style={{color:'#1890ff', fontWeight:600}}>{code}</span> : '--'
    },
    {
        title: 'Họ tên',
        dataIndex: 'full_name',
        render: (text, r) => (
            <div style={{display:'flex', gap: 10, alignItems:'center'}}>
                <Avatar src={r.avatar} icon={<UserOutlined />} size="small" />
                <div style={{fontWeight: 500}}>{text}</div>
            </div>
        )
    },
    { 
        title: 'Email',
        dataIndex: 'email',
        render: t => <span style={{fontSize:12, color:'#666'}}>{t}</span>
    },
    { 
        title: 'Ngày sinh', 
        dataIndex: 'dateOfBirth', 
        width: 100,
        render: d => d ? moment(d).format("DD/MM/YYYY") : '--'
    },
  ];

  if (loading) return <div style={{height: '100vh', display:'flex', justifyContent:'center', alignItems:'center'}}><Spin size="large" /></div>;

  // --- TABS CONFIG ---
  const mainTabItems = [
    {
      key: '1',
      label: <span><TeamOutlined /> Học viên ({students.length})</span>,
      children: (
        <div style={{padding: 24}}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 16}}>
            {/* 👇 CẬP NHẬT PLACEHOLDER */}
            <Input placeholder="Tìm theo Tên, Mã SV, Email..." prefix={<SearchOutlined />} style={{width: 350}} onChange={e => setSearchText(e.target.value)} />
            <div style={{display:'flex', gap: 10}}>
                <Button icon={<ExportOutlined/>} onClick={handleExportExcel}>Xuất Excel</Button>
                <Button icon={<UploadOutlined/>} onClick={() => setIsImportModalOpen(true)}>Import Excel</Button>
                <Button type="primary" icon={<UserAddOutlined />} onClick={handleOpenAddStudentModal}>Thêm học viên</Button>
            </div>
          </div>
          <Table 
            dataSource={filteredStudents} 
            columns={studentColumns} 
            rowKey="student_id" 
            pagination={{ pageSize: 8 }} 
            scroll={{ x: 1000 }}
          />
        </div>
      )
    },
    {
        key: '2',
        label: <span><ReadOutlined /> Khóa học ({classInfo?.courses?.length || 0})</span>,
        children: (
          <div style={{padding: 24}}>
              <Button type="primary" icon={<PlusOutlined />} style={{marginBottom: 16}} onClick={openAddCourseModal}>Thêm khóa học</Button>
              <List grid={{ gutter: 16, column: 1 }} dataSource={classInfo?.courses || []} renderItem={item => (
                  <List.Item>
                      <Card size="small" title={item.title} extra={
                          <Popconfirm title="Gỡ khóa học?" onConfirm={() => handleRemoveCourse(item.id)}>
                              <Button danger size="small" type="text" icon={<DeleteOutlined />}>Gỡ bỏ</Button>
                          </Popconfirm>
                      }><Tag>{item.code}</Tag></Card>
                  </List.Item>
              )} />
          </div>
        )
      },
      {
        key: '3',
        label: <span><UserOutlined /> Giảng viên ({classInfo?.teachers?.length || 0})</span>,
        children: (
          <div style={{padding: 24}}>
              <Button type="primary" icon={<PlusOutlined />} style={{marginBottom: 16}} onClick={openAddTeacherModal}>Thêm giảng viên</Button>
                <List grid={{ gutter: 16, column: 2 }} dataSource={classInfo?.teachers || []} renderItem={item => (
                  <List.Item>
                      <Card size="small">
                          <List.Item.Meta avatar={<Avatar src={item.avatar} icon={<UserOutlined />} />} title={item.full_name} description={item.email} />
                          <div style={{textAlign:'right'}}><Popconfirm title="Gỡ GV?" onConfirm={() => handleRemoveTeacher(item.user_id)}><Button danger size="small" icon={<DeleteOutlined />}>Gỡ bỏ</Button></Popconfirm></div>
                      </Card>
                  </List.Item>
              )} />
          </div>
        )
      },
      {
        key: '4',
        label: <span><BookOutlined /> Giáo trình & Điểm số</span>,
        children: (
          <div style={{display: 'flex', flexDirection: 'column'}}>
              {classInfo?.courses?.length > 0 && (
                  <div style={{padding: '16px 24px', background: '#fafafa', borderBottom: '1px solid #f0f0f0'}}>
                      <span style={{marginRight: 12, fontWeight: 600}}>Chọn giáo trình khóa học:</span>
                      <Select value={selectedCourseId} onChange={setSelectedCourseId} style={{width: 350}}>
                          {classInfo.courses.map(c => <Select.Option key={c.id} value={c.id}>{c.title}</Select.Option>)}
                      </Select>
                  </div>
              )}
              {selectedCourseId ? (
                  <div style={{padding: 24}}>
                      <Tabs 
                        type="card" 
                        items={[
                          {
                            key: 'sub-quiz',
                            label: <span><TrophyOutlined style={{color: '#faad14'}}/> Kết quả Quiz</span>,
                            children: <ClassQuizTab courseId={selectedCourseId} students={students} />
                          },
                          {
                            key: 'sub-essay',
                            label: <span><EditOutlined style={{color: '#52c41a'}}/> Chấm bài Tự luận</span>,
                            children: <ClassEssayTab courseId={selectedCourseId} students={students} />
                          }
                        ]}
                      />
                  </div>
              ) : (
                  <Empty description="Vui lòng chọn khóa học" style={{margin: 40}} />
              )}
          </div>
        )
      }
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{marginBottom: 16}}>
         <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/classes')}>Quay lại</Button>
      </div>

      {classInfo && (
        <div style={{background: 'white', padding: 24, borderRadius: 8, marginBottom: 24}}>
            <h2 style={{margin: 0}}>{classInfo.name} <Tag color="geekblue">{classInfo.code}</Tag></h2>
            <div style={{marginTop: 8, color: '#666', display:'flex', gap: 30}}>
                <span>📅 <b>Bắt đầu:</b> {classInfo.start_date ? moment(classInfo.start_date).format("DD/MM/YYYY") : "--"}</span>
                <span>🏁 <b>Kết thúc:</b> {classInfo.end_date ? moment(classInfo.end_date).format("DD/MM/YYYY") : "--"}</span>
                <Tag color={classInfo.status === 'Active' ? 'green' : 'orange'}>{classInfo.status}</Tag>
            </div>
        </div>
      )}

      <Card styles={{ body: { padding: 0 } }} variant="borderless">
        <Tabs defaultActiveKey="1" tabBarStyle={{padding: '0 24px', marginBottom: 0}} items={mainTabItems} />
      </Card>

      {/* MODAL THÊM HỌC VIÊN */}
      <Modal
        title={`Chọn học viên để thêm vào lớp (${selectedStudentKeys.length} đã chọn)`}
        open={isAddStudentModal}
        onOk={handleAddStudentsSubmit}
        onCancel={() => setIsAddStudentModal(false)}
        width={900}
        confirmLoading={addingStudents}
      >
         <div style={{marginBottom: 16, display: 'flex', gap: 10}}>
             <Input 
                prefix={<SearchOutlined />} 
                placeholder="Tìm theo Tên, Mã SV, Email, SĐT..." 
                value={studentSearchText}
                onChange={e => setStudentSearchText(e.target.value)}
                style={{flex: 1}}
             />
             <Button icon={<FilterOutlined />}>Bộ lọc</Button>
         </div>
         
         <Table
            rowSelection={{
                selectedRowKeys: selectedStudentKeys,
                onChange: (keys) => setSelectedStudentKeys(keys),
                preserveSelectedRowKeys: true 
            }}
            columns={addStudentColumns}
            dataSource={filteredStudentPool}
            rowKey="user_id"
            pagination={{ pageSize: 5 }}
            size="small"
            scroll={{ y: 300 }} 
            loading={addingStudents && allStudentsPool.length === 0}
         />
      </Modal>

      {/* ... (Các Modal khác giữ nguyên) ... */}
      <Modal title="Import Học viên từ Excel" open={isImportModalOpen} onOk={handleImportStudents} onCancel={() => {setIsImportModalOpen(false); setExcelEmails([]);}} confirmLoading={importing}>
        <Upload beforeUpload={(file) => { handleExcelFile(file); return false; }} maxCount={1} showUploadList={false}>
            <Button icon={<UploadOutlined />}>Chọn File Excel</Button>
        </Upload>
        <div style={{marginTop: 10}}>Đã đọc: <b>{excelEmails.length}</b> email</div>
      </Modal>

      <Modal title="Thêm Khóa Học" open={isAddCourseModal} onOk={handleAddCourses} onCancel={() => setIsAddCourseModal(false)}>
         <Select mode="multiple" style={{width: '100%', minHeight: 150}} placeholder="Chọn khóa học..." onChange={setSelectedIdsToAdd} showSearch optionFilterProp="children">
            {allCourses.map(c => <Select.Option key={c.id} value={c.id}>{c.title}</Select.Option>)}
         </Select>
      </Modal>

      <Modal title="Thêm Giảng Viên" open={isAddTeacherModal} onOk={handleAddTeachers} onCancel={() => setIsAddTeacherModal(false)}>
         <Select mode="multiple" style={{width: '100%', minHeight: 150}} placeholder="Chọn giảng viên..." onChange={setSelectedIdsToAdd} showSearch optionFilterProp="children">
            {allTeachers.map(t => <Select.Option key={t.user_id} value={t.user_id}>{t.full_name} ({t.email})</Select.Option>)}
         </Select>
      </Modal>
    </div>
  );
}