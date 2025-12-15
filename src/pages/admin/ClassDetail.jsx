import { useEffect, useState, useMemo } from "react"; 
import { useParams, useNavigate } from "react-router-dom";
import { 
  Tabs, Table, Button, Card, 
  Tag, message, Modal, Select, Spin, 
  Popconfirm, Input, Avatar, Empty, List, Upload, Tooltip, 
  Breadcrumb, Typography, Space, Descriptions, Statistic, Divider, Dropdown,
  Popover, Progress // 🟢 Thêm Popover, Progress
} from "antd";
import { 
  UserAddOutlined, ArrowLeftOutlined, 
  TeamOutlined, BookOutlined, DeleteOutlined,
  SearchOutlined, UserOutlined, 
  UploadOutlined, PlusOutlined, ReadOutlined,
  TrophyOutlined, EditOutlined, 
  ManOutlined, WomanOutlined, 
  MoreOutlined, FileExcelOutlined, CalendarOutlined,
  CheckCircleOutlined, SyncOutlined, MailOutlined, PhoneOutlined,
  InfoCircleOutlined // 🟢 Thêm Icon
} from "@ant-design/icons";
import moment from "moment";
import * as XLSX from 'xlsx'; 

// Import APIs
import { ClassApi } from "@/services/api/classApi";
import { UserApi } from "@/services/api/userApi";
import { CourseApi } from "@/services/api/courseApi"; 
import { ProgressApi } from "@/services/api/progressApi"; // 🟢 Import ProgressApi

import ClassQuizTab from "../../components/ClassQuizTab";
import ClassEssayTab from "../../components/ClassEssayTab";

const { Title, Text } = Typography;
const { Option } = Select;

// Helper Functions (Giữ nguyên)
const getFirstName = (fullName) => {
  if (!fullName) return "";
  const parts = fullName.trim().split(" ");
  return parts[parts.length - 1].toLowerCase();
};

const sortByName = (list) => {
  if (!list) return [];
  return [...list].sort((a, b) => 
    getFirstName(a.full_name).localeCompare(getFirstName(b.full_name))
  );
};

export default function ClassDetail() {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  // Data State
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  // 🟢 State lưu tiến độ học tập: { [studentId]: [ { courseId, percent }, ... ] }
  const [studentProgressMap, setStudentProgressMap] = useState({});

  // Tab States
  const [activeTab, setActiveTab] = useState('1');

  // Course & Teacher Data State
  const [allCourses, setAllCourses] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  
  // Modal States
  const [isAddCourseModal, setIsAddCourseModal] = useState(false);
  const [isAddTeacherModal, setIsAddTeacherModal] = useState(false);
  
  const [courseSearchTerm, setCourseSearchTerm] = useState("");
  const [selectedCourseKeys, setSelectedCourseKeys] = useState([]);
  
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");
  const [selectedTeacherKeys, setSelectedTeacherKeys] = useState([]);

  // Search Text inside Tabs
  const [studentTabSearchText, setStudentTabSearchText] = useState('');
  const [teacherTabSearchText, setTeacherTabSearchText] = useState('');
  const [courseTabSearchText, setCourseTabSearchText] = useState('');

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
      setStudents(sortByName(studentList || []));
    } catch (error) { message.error("Lỗi tải trang chi tiết"); } 
    finally { setLoading(false); }
  };

  useEffect(() => { if (classId) fetchClassData(); }, [classId]);

  useEffect(() => {
    if (classInfo?.courses?.length > 0 && !selectedCourseId) {
       setSelectedCourseId(classInfo.courses[0].id);
    }
  }, [classInfo]);

  // 🟢 1. FETCH TIẾN ĐỘ HỌC TẬP KHI CÓ DATA LỚP & HỌC VIÊN
  useEffect(() => {
    const fetchProgress = async () => {
        if (!classInfo || !students || students.length === 0 || !classInfo.courses || classInfo.courses.length === 0) return;

        try {
            const studentIds = students.map(s => s.student_id);
            const courseIds = classInfo.courses.map(c => c.id);
            
            // Gọi API lấy tổng hợp tiến độ
            const res = await ProgressApi.getClassProgress(classId, studentIds, courseIds);
            const data = res.data || res || {}; // Xử lý tùy format axios trả về
            setStudentProgressMap(data);
        } catch (error) {
            console.error("Lỗi tải tiến độ:", error);
        }
    };
    fetchProgress();
  }, [classInfo, students, classId]);

  // ============================================================
  // ... (GIỮ NGUYÊN CÁC HANDLERS ADD/REMOVE STUDENT, TEACHER, COURSE) ...
  // ============================================================
  
  // HANDLERS: HỌC VIÊN
  const handleOpenAddStudentModal = async () => {
    setIsAddStudentModal(true);
    setAddingStudents(true); 
    try {
        const allStudents = await UserApi.getAll({ role: 'student', limit: 1000 });
        const allClasses = await ClassApi.getAll();
        const otherClasses = allClasses.filter(c => c.class_id !== classId);
        const busyPromises = otherClasses.map(c => ClassApi.getStudents(c.class_id));
        const busyResults = await Promise.all(busyPromises);
        const busyStudentIds = new Set();
        busyResults.flat().forEach(s => busyStudentIds.add(s.student_id));
        students.forEach(s => busyStudentIds.add(s.student_id));
        const availableStudents = allStudents.filter(u => !busyStudentIds.has(u.user_id));
        setAllStudentsPool(sortByName(availableStudents));
        setSelectedStudentKeys([]); 
        setStudentSearchText("");
    } catch (error) { console.error(error); message.error("Lỗi tải danh sách học viên khả dụng"); } finally { setAddingStudents(false); }
  };

  const handleAddStudentsSubmit = async () => {
    if (selectedStudentKeys.length === 0) return message.warning("Chưa chọn học viên nào");
    setAddingStudents(true);
    try {
      const results = await Promise.allSettled(selectedStudentKeys.map(id => ClassApi.addStudent(classId, id)));
      const successCases = results.filter(r => r.status === 'fulfilled');
      if (successCases.length > 0) message.success(`Đã thêm ${successCases.length} học viên`);
      setIsAddStudentModal(false);
      fetchClassData(); 
    } catch (err) { message.error("Có lỗi hệ thống xảy ra"); } finally { setAddingStudents(false); }
  };

  const filteredStudentPool = useMemo(() => {
    if (!studentSearchText) return allStudentsPool;
    const lower = studentSearchText.toLowerCase();
    return allStudentsPool.filter(s => s.full_name?.toLowerCase().includes(lower) || s.email?.toLowerCase().includes(lower) || (s.student_code && s.student_code.toLowerCase().includes(lower)));
  }, [allStudentsPool, studentSearchText]);

  const handleRemoveStudent = async (id) => {
    try { await ClassApi.removeStudent(classId, id); message.success("Đã xóa học viên"); fetchClassData(); } catch (error) { message.error("Lỗi khi xóa"); }
  };

  // EXCEL HANDLERS
  const handleExportExcel = () => {
    if (students.length === 0) return message.warning("Danh sách trống");
    const sortedData = sortByName(students);
    const data = sortedData.map((s, idx) => ({ STT: idx + 1, "Mã SV": s.student_code || '', "Họ tên": s.full_name, "Email": s.email, }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, `Class_${classInfo?.code}.xlsx`);
  };

  const handleExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const wb = XLSX.read(data, { type: 'array' });
          const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
          const emails = json.slice(1).map(r => r[1]?.trim()).filter(e => e && e.includes('@'));
          setExcelEmails([...new Set(emails)]);
          resolve();
        } catch (err) { reject(err); }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleImportStudents = async () => {
    if (excelEmails.length === 0) return message.warning("File không có email hợp lệ");
    setImporting(true);
    let success = 0;
    try {
       for (const email of excelEmails) {
          try {
             const userRes = await UserApi.getAll({ email, role: 'student', limit: 1 });
             if (userRes?.[0]?.user_id) { await ClassApi.addStudent(classId, userRes[0].user_id); success++; }
          } catch(e) {}
       }
       if (success > 0) message.success(`Import thành công ${success} học viên`);
       setIsImportModalOpen(false); setExcelEmails([]); fetchClassData();
    } catch(e) { message.error("Lỗi import"); } finally { setImporting(false); }
  };

  // COURSE HANDLERS
  const openAddCourseModal = async () => {
     setLoading(true);
     try {
        const res = await CourseApi.getCourses({ page: 1, limit: 1000 });
        const coursesData = res.courses || [];
        const currentIds = classInfo.courses ? classInfo.courses.map(c => c.id) : [];
        setAllCourses(coursesData.filter(c => !currentIds.includes(c.id)));
        setSelectedCourseKeys([]); setCourseSearchTerm(""); setIsAddCourseModal(true);
     } catch(error) { message.error("Lỗi tải danh sách khóa học"); } finally { setLoading(false); }
  };

  const handleAddCourses = async () => {
     if(selectedCourseKeys.length === 0) return message.warning("Chưa chọn khóa học nào");
     try {
        const newCourseIds = [...classInfo.courses.map(c => c.id), ...selectedCourseKeys];
        const currentTeacherIds = classInfo.teachers.map(t => t.user_id);
        await ClassApi.update(classId, { courseIds: newCourseIds, teacherIds: currentTeacherIds });
        message.success("Đã thêm khóa học"); setIsAddCourseModal(false); fetchClassData();
     } catch(e) { message.error("Lỗi thêm khóa học"); }
  };

  const handleRemoveCourse = async (id) => {
      try {
        const newIds = classInfo.courses.filter(c => c.id !== id).map(c => c.id);
        const currentTeacherIds = classInfo.teachers.map(t => t.user_id);
        await ClassApi.update(classId, { courseIds: newIds, teacherIds: currentTeacherIds });
        message.success("Đã gỡ khóa học"); fetchClassData();
      } catch(e) { message.error("Lỗi gỡ khóa học"); }
  };

  // TEACHER HANDLERS
  const openAddTeacherModal = async () => {
    setLoading(true);
    try {
        const res = await UserApi.getAll({ role: 'teacher', limit: 1000 });
        const currentIds = classInfo.teachers.map(t => t.user_id);
        setAllTeachers(res.filter(t => !currentIds.includes(t.user_id)));
        setSelectedTeacherKeys([]); setTeacherSearchTerm(""); setIsAddTeacherModal(true);
    } catch(e) { message.error("Lỗi tải giảng viên"); } finally { setLoading(false); }
  };

  const handleAddTeachers = async () => {
    if(selectedTeacherKeys.length === 0) return message.warning("Chưa chọn giảng viên nào");
    try {
       const newTeacherIds = [...classInfo.teachers.map(t => t.user_id), ...selectedTeacherKeys];
       const currentCourseIds = classInfo.courses.map(c => c.id);
       await ClassApi.update(classId, { teacherIds: newTeacherIds, courseIds: currentCourseIds });
       message.success("Đã thêm giảng viên"); setIsAddTeacherModal(false); fetchClassData();
    } catch(e) { message.error("Lỗi thêm giảng viên"); }
 };

 const handleRemoveTeacher = async (id) => {
    try {
        const newIds = classInfo.teachers.filter(t => t.user_id !== id).map(t => t.user_id);
        const currentCourseIds = classInfo.courses.map(c => c.id);
        await ClassApi.update(classId, { teacherIds: newIds, courseIds: currentCourseIds });
        message.success("Đã gỡ giảng viên"); fetchClassData();
    } catch(e) { message.error("Lỗi gỡ giảng viên"); }
 };

  // ============================================================
  // CONFIG TABLES & FILTERS
  // ============================================================
  
  // -- Student Table --
  const filteredStudents = useMemo(() => {
    const list = students || [];
    if(!studentTabSearchText) return list;
    const lower = studentTabSearchText.toLowerCase();
    return list.filter(s => s.full_name?.toLowerCase().includes(lower) || s.email?.toLowerCase().includes(lower) || (s.student_code && s.student_code.toLowerCase().includes(lower)));
  }, [students, studentTabSearchText]);

  const studentColumns = [
    {
        title: 'Sinh viên',
        dataIndex: 'full_name',
        fixed: 'left',
        width: 250,
        sorter: (a, b) => getFirstName(a.full_name).localeCompare(getFirstName(b.full_name)),
        render: (t, r) => (
           <div style={{display:'flex', gap:12, alignItems:'center'}}>
              <Avatar src={r.avatar} icon={<UserOutlined/>} style={{backgroundColor:'#1890ff', flexShrink: 0}} size="large"/>
              <div>
                 <div style={{fontWeight:600, fontSize: '14px'}}>{t}</div>
                 <Tag color="blue" bordered={false} style={{marginRight:0}}>{r.student_code || 'N/A'}</Tag>
              </div>
           </div>
        )
    },
    { 
        title: 'Liên hệ', 
        key: 'contact',
        width: 250,
        render: (_, r) => (
            <Space direction="vertical" size={2} style={{fontSize: 13}}>
                <Text copyable={{text: r.email}} type="secondary"><MailOutlined/> {r.email}</Text>
                {r.phone && <Text type="secondary"><PhoneOutlined/> {r.phone}</Text>}
            </Space>
        )
    },
    // 🟢 2. CỘT TIẾN ĐỘ HỌC TẬP
    {
      title: 'Tiến độ',
      key: 'progress',
      width: 200,
      render: (_, r) => {
          const userProgressList = studentProgressMap[r.student_id] || [];
          
          if (userProgressList.length === 0) {
              return <Tag color="default">Chưa có dữ liệu</Tag>;
          }

          // Tính trung bình cộng của tất cả khóa học (nếu muốn hiển thị tổng quan)
          const avgPercent = Math.round(userProgressList.reduce((acc, curr) => acc + curr.percent, 0) / (userProgressList.length || 1));
          
          // Nội dung chi tiết khi hover
          const popoverContent = (
              <List
                  size="small"
                  dataSource={userProgressList}
                  renderItem={item => {
                      const courseName = classInfo?.courses?.find(c => c.id === item.courseId)?.title || "Khóa học";
                      return (
                          <List.Item>
                              <div style={{width: '100%'}}>
                                  <div style={{fontSize: 12, marginBottom: 4}}>{courseName}</div>
                                  <Progress percent={item.percent} size="small" status={item.percent === 100 ? "success" : "active"} />
                              </div>
                          </List.Item>
                      );
                  }}
              />
          );

          return (
              <Popover content={popoverContent} title="Chi tiết tiến độ" trigger="hover">
                  <div style={{cursor: 'pointer'}}>
                      <Progress percent={avgPercent} steps={5} size="small" strokeColor={avgPercent === 100 ? '#52c41a' : '#1890ff'} />
                  </div>
              </Popover>
          );
      }
    },
    { 
        title: '', 
        align: 'center', 
        fixed: 'right',
        width: 60,
        render: (_, r) => (
           <Popconfirm title="Xóa học viên khỏi lớp này?" onConfirm={() => handleRemoveStudent(r.student_id)} okButtonProps={{danger:true}}>
              <Button type="text" danger icon={<DeleteOutlined/>}></Button>
           </Popconfirm>
        )
    }
  ];

  // -- Teacher Table (Giữ nguyên) --
  const filteredTeachersInClass = useMemo(() => {
    const list = classInfo?.teachers || [];
    const sortedList = sortByName(list);
    if(!teacherTabSearchText) return sortedList;
    const lower = teacherTabSearchText.toLowerCase();
    return sortedList.filter(t => t.full_name?.toLowerCase().includes(lower) || t.email?.toLowerCase().includes(lower) || (t.phone && t.phone.includes(lower)));
  }, [classInfo, teacherTabSearchText]);

  const teacherColumns = [
    { title: 'Giảng viên', dataIndex: 'full_name', fixed: 'left', width: 250, sorter: (a, b) => getFirstName(a.full_name).localeCompare(getFirstName(b.full_name)), render: (t, r) => (<div style={{display:'flex', gap:12, alignItems:'center'}}><Avatar src={r.avatar} icon={<UserOutlined/>} style={{backgroundColor:'#52c41a', flexShrink: 0}} size="large"/><div><div style={{fontWeight:600, fontSize: '14px'}}>{t}</div>{r.role && <Tag color="green">Teacher</Tag>}</div></div>) },
    { title: 'Liên hệ', key: 'contact', width: 250, render: (_, r) => (<Space direction="vertical" size={2} style={{fontSize: 13}}><Text copyable={{text: r.email}} type="secondary"><MailOutlined /> {r.email}</Text>{r.phone && <Text type="secondary"><PhoneOutlined /> {r.phone}</Text>}</Space>) },
    { title: 'Thông tin', key: 'info', width: 150, render: (_, r) => (<Space>{r.gender === 'Nam' ? <ManOutlined style={{color: '#1890ff'}}/> : r.gender === 'Nữ' ? <WomanOutlined style={{color: '#eb2f96'}}/> : '--'}<span>{r.dateOfBirth ? moment(r.dateOfBirth).format("DD/MM/YYYY") : ''}</span></Space>) },
    { title: '', align: 'center', fixed: 'right', width: 60, render: (_, r) => (<Popconfirm title="Gỡ giảng viên khỏi lớp?" onConfirm={() => handleRemoveTeacher(r.user_id)} okButtonProps={{danger:true}}><Button type="text" danger icon={<DeleteOutlined/>}></Button></Popconfirm>) }
  ];

  // -- Course Table (Giữ nguyên) --
  const filteredCoursesInClass = useMemo(() => {
    const list = classInfo?.courses || [];
    if(!courseTabSearchText) return list;
    const lower = courseTabSearchText.toLowerCase();
    return list.filter(c => c.title?.toLowerCase().includes(lower) || c.code?.toLowerCase().includes(lower));
  }, [classInfo, courseTabSearchText]);

  const courseColumns = [
    { title: 'Tên khóa học', dataIndex: 'title', render: (t, r) => (<div style={{display:'flex', gap:12, alignItems:'center'}}><Avatar icon={<BookOutlined/>} shape="square" style={{backgroundColor:'#faad14', flexShrink: 0}} size="large"/><div><div style={{fontWeight:600, fontSize: '14px'}}>{t}</div><div style={{fontSize: 12, color: '#888', maxWidth: 300, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{r.description || 'Chưa có mô tả'}</div></div></div>) },
    { title: 'Mã môn', dataIndex: 'code', width: 150, render: (t) => <Tag color="blue">{t}</Tag> },
    { title: '', align: 'center', width: 60, render: (_, r) => (<Popconfirm title="Gỡ khóa học khỏi lớp?" onConfirm={() => handleRemoveCourse(r.id)} okButtonProps={{danger:true}}><Button type="text" danger icon={<DeleteOutlined/>}></Button></Popconfirm>) }
  ];

  const exportItems = [ { key: 'export', label: 'Xuất Excel', icon: <FileExcelOutlined />, onClick: handleExportExcel }, { key: 'import', label: 'Import Excel', icon: <UploadOutlined />, onClick: () => setIsImportModalOpen(true) }, ];

  // --- FILTER DATA FOR MODALS ---
  const filteredCoursesPool = allCourses.filter(c => c.title.toLowerCase().includes(courseSearchTerm.toLowerCase()) || c.code.toLowerCase().includes(courseSearchTerm.toLowerCase()));
  const filteredTeachersPool = allTeachers.filter(t => t.full_name.toLowerCase().includes(teacherSearchTerm.toLowerCase()) || t.email.toLowerCase().includes(teacherSearchTerm.toLowerCase()));

  if (loading && !classInfo) return ( <div style={{height: '100vh', display:'flex', justifyContent:'center', alignItems:'center', background: '#f5f5f5'}}><Spin tip="Đang tải dữ liệu lớp học..." size="large" /></div> );

  return (
    <div style={{ padding: '24px 32px', background: '#f5f7fa', minHeight: '100vh' }}>
      {/* HEADER SECTION (Giữ nguyên) */}
      <div style={{ marginBottom: 24 }}>
        <Breadcrumb items={[{title: 'Quản lý đào tạo'}, {title: 'Danh sách lớp'}, {title: classInfo?.name || 'Chi tiết lớp'}]} style={{marginBottom: 16}}/>
        {classInfo && (
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} bodyStyle={{padding: 24}}>
             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <div style={{flex: 1}}>
                    <Space align="center" style={{marginBottom: 12}}>
                       <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate('/admin/classes')} />
                       <Title level={3} style={{margin: 0}}>{classInfo.name}</Title>
                       <Tag color="geekblue" style={{fontSize: 14, padding: '4px 10px'}}>{classInfo.code}</Tag>
                       <Tag color={classInfo.status === 'Active' ? 'green' : 'orange'} icon={classInfo.status === 'Active' ? <CheckCircleOutlined /> : <SyncOutlined spin />}>{classInfo.status}</Tag>
                    </Space>
                    <Descriptions column={{ xs: 1, sm: 2, md: 4 }} size="small" style={{marginTop: 16, paddingLeft: 40}}>
                        <Descriptions.Item label={<span style={{color:'#888'}}><CalendarOutlined/> Ngày bắt đầu</span>}>{classInfo.start_date ? moment(classInfo.start_date).format("DD/MM/YYYY") : "--"}</Descriptions.Item>
                        <Descriptions.Item label={<span style={{color:'#888'}}><CalendarOutlined/> Ngày kết thúc</span>}>{classInfo.end_date ? moment(classInfo.end_date).format("DD/MM/YYYY") : "--"}</Descriptions.Item>
                        <Descriptions.Item label={<span style={{color:'#888'}}>Giảng viên chính</span>}>{classInfo.teachers?.[0]?.full_name || 'Chưa gán'}</Descriptions.Item>
                    </Descriptions>
                </div>
                <Space size="large" split={<Divider type="vertical" height={40} />} style={{paddingLeft: 24, borderLeft: '1px solid #f0f0f0'}}>
                    <Statistic title="Tổng Học viên" value={students.length} prefix={<TeamOutlined />} valueStyle={{fontSize: 20}} />
                    <Statistic title="Giảng viên" value={classInfo?.teachers?.length || 0} prefix={<UserOutlined />} valueStyle={{fontSize: 20}} />
                </Space>
             </div>
          </Card>
        )}
      </div>

      {/* MAIN CONTENT TABS */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} bodyStyle={{padding: 0}}>
        <Tabs 
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
          tabBarStyle={{padding: '0 24px', margin: 0}}
          items={[
            // TAB 1: HỌC VIÊN
            {
              key: '1',
              label: <span><TeamOutlined /> Học viên</span>,
              children: (
                <div style={{padding: 24}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10}}>
                    <Input placeholder="Tìm kiếm học viên..." prefix={<SearchOutlined style={{color:'#ccc'}}/>} allowClear style={{width: 350, borderRadius: 6}} onChange={e => setStudentTabSearchText(e.target.value)} />
                    <Space>
                        <Dropdown menu={{ items: exportItems }} placement="bottomRight"><Button icon={<MoreOutlined />}>Tiện ích</Button></Dropdown>
                        <Button type="primary" icon={<UserAddOutlined />} onClick={handleOpenAddStudentModal} style={{borderRadius: 6}}>Thêm học viên</Button>
                    </Space>
                  </div>
                  <Table dataSource={filteredStudents} columns={studentColumns} rowKey="student_id" pagination={{ pageSize: 8, showTotal: (total) => `Tổng ${total} học viên` }} scroll={{ x: 800 }} />
                </div>
              )
            },
            // TAB 2: GIẢNG VIÊN
            {
              key: '2',
              label: <span><UserOutlined /> Giảng viên</span>,
              children: (
                <div style={{padding: 24}}>
                   <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10}}>
                      <Input placeholder="Tìm kiếm giảng viên..." prefix={<SearchOutlined style={{color:'#ccc'}}/>} allowClear style={{width: 350, borderRadius: 6}} onChange={e => setTeacherTabSearchText(e.target.value)} />
                      <Button type="primary" ghost icon={<UserAddOutlined />} onClick={openAddTeacherModal} style={{borderRadius: 6}}>Thêm giảng viên</Button>
                   </div>
                   <Table dataSource={filteredTeachersInClass} columns={teacherColumns} rowKey="user_id" pagination={{ pageSize: 8 }} scroll={{ x: 800 }} locale={{ emptyText: "Chưa có giảng viên nào được gán" }} />
                </div>
              )
            },
            // TAB 3: KHÓA HỌC
            {
              key: '3',
              label: <span><ReadOutlined /> Khóa học</span>,
              children: (
                <div style={{padding: 24}}>
                   <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10}}>
                      <Input placeholder="Tìm kiếm khóa học..." prefix={<SearchOutlined style={{color:'#ccc'}}/>} allowClear style={{width: 350, borderRadius: 6}} onChange={e => setCourseTabSearchText(e.target.value)} />
                      <Button type="primary" icon={<PlusOutlined />} onClick={openAddCourseModal} style={{borderRadius: 6}}>Gán khóa học</Button>
                   </div>
                   <Table dataSource={filteredCoursesInClass} columns={courseColumns} rowKey="id" pagination={{ pageSize: 8 }} scroll={{ x: 800 }} locale={{ emptyText: "Chưa có khóa học nào được gán" }} />
                </div>
              )
            },
            // TAB 4: ĐIỂM SỐ
            {
              key: '4',
              label: <span><TrophyOutlined /> Sổ điểm</span>,
              children: (
                <div style={{minHeight: 400}}>
                    <div style={{padding: '20px 24px', background: '#fcfcfc', borderBottom: '1px solid #f0f0f0', display:'flex', alignItems:'center', gap: 16}}>
                        <span style={{fontWeight: 500}}>Chọn giáo trình cần xem điểm:</span>
                        <Select value={selectedCourseId} onChange={setSelectedCourseId} style={{width: 300}} placeholder="Chọn khóa học..." status={!selectedCourseId ? 'warning' : ''}>
                            {classInfo?.courses?.map(c => <Option key={c.id} value={c.id}>{c.title}</Option>)}
                        </Select>
                    </div>
                    {selectedCourseId ? (
                        <div style={{padding: 24}}>
                            <Tabs type="line" items={[ { key: 'sub-quiz', label: <span><CheckCircleOutlined /> Điểm Quiz</span>, children: <ClassQuizTab courseId={selectedCourseId} students={students} /> }, { key: 'sub-essay', label: <span><EditOutlined /> Chấm bài Tự luận</span>, children: <ClassEssayTab courseId={selectedCourseId} students={students} /> } ]} />
                        </div>
                    ) : (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Vui lòng chọn khóa học phía trên để xem bảng điểm" style={{marginTop: 60}} />
                    )}
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* --- MODALS (GIỮ NGUYÊN) --- */}
      <Modal title={<Space><UserAddOutlined /> <span>Thêm học viên vào lớp</span><Tag color="blue">{selectedStudentKeys.length} đã chọn</Tag></Space>} open={isAddStudentModal} onOk={handleAddStudentsSubmit} onCancel={() => setIsAddStudentModal(false)} width={800} okText="Thêm ngay" cancelText="Hủy" confirmLoading={addingStudents}>
         <div style={{marginBottom: 16, background: '#fafafa', padding: 16, borderRadius: 8}}>
             <Input prefix={<SearchOutlined style={{color:'#999'}} />} placeholder="Tìm học viên trong hệ thống..." value={studentSearchText} onChange={e => setStudentSearchText(e.target.value)} allowClear />
             <div style={{marginTop:8, fontSize:12, color:'#888', fontStyle:'italic'}}>* Danh sách này ĐÃ ĐƯỢC LỌC BỎ tất cả học sinh đang học lớp khác (kể cả lớp đã kết thúc).</div>
         </div>
         <Table rowSelection={{ selectedRowKeys: selectedStudentKeys, onChange: (keys) => setSelectedStudentKeys(keys), preserveSelectedRowKeys: true }} columns={[{ title: 'Mã SV', dataIndex: 'student_code', width: 100, render: (c) => <Tag>{c}</Tag> }, { title: 'Họ tên', dataIndex: 'full_name', sorter: (a, b) => getFirstName(a.full_name).localeCompare(getFirstName(b.full_name)), render: (t, r) => <Space><Avatar src={r.avatar} size="small" />{t}</Space> }, { title: 'Email', dataIndex: 'email', className: 'text-secondary' }]} dataSource={filteredStudentPool} rowKey="user_id" pagination={{ pageSize: 5, size: 'small' }} size="small" scroll={{ y: 350 }} loading={addingStudents && allStudentsPool.length === 0} bordered />
      </Modal>

      <Modal title={<Space><FileExcelOutlined style={{color: '#217346'}}/> Import từ Excel</Space>} open={isImportModalOpen} onOk={handleImportStudents} onCancel={() => {setIsImportModalOpen(false); setExcelEmails([]);}} confirmLoading={importing} okText={`Import ${excelEmails.length > 0 ? excelEmails.length + ' user' : ''}`}>
        <Space direction="vertical" style={{width:'100%'}}>
           <div style={{padding: 16, background: '#f5f5f5', borderRadius: 8, textAlign:'center', border: '1px dashed #d9d9d9'}}>
              <Upload beforeUpload={(file) => { handleExcelFile(file); return false; }} maxCount={1} showUploadList={false}><Button icon={<UploadOutlined />} size="large">Chọn File Excel</Button></Upload>
              <div style={{marginTop: 8, fontSize: 12, color: '#888'}}>Hỗ trợ định dạng .xlsx, .xls</div>
           </div>
           {excelEmails.length > 0 && (<div style={{marginTop: 10}}><CheckCircleOutlined style={{color: '#52c41a'}} /> Đã tìm thấy <b>{excelEmails.length}</b> email hợp lệ.</div>)}
        </Space>
      </Modal>

      <Modal title={<Space><BookOutlined style={{color:'#1890ff'}}/> <span style={{fontSize:16}}>Chọn Khóa Học Để Gán</span></Space>} open={isAddCourseModal} onOk={handleAddCourses} onCancel={() => setIsAddCourseModal(false)} width={900} okText={`Thêm ${selectedCourseKeys.length} khóa học`} cancelText="Hủy bỏ">
         <div style={{marginBottom: 16, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <Input prefix={<SearchOutlined style={{color:'#999'}} />} placeholder="Tìm kiếm theo Tên hoặc Mã môn..." value={courseSearchTerm} onChange={e => setCourseSearchTerm(e.target.value)} style={{width: '100%'}} size="large" allowClear />
         </div>
         <Table rowSelection={{ selectedRowKeys: selectedCourseKeys, onChange: (keys) => setSelectedCourseKeys(keys), preserveSelectedRowKeys: true }} columns={[{ title: 'Mã môn', dataIndex: 'code', width: 120, render: t => <Tag color="blue">{t}</Tag> }, { title: 'Tên khóa học', dataIndex: 'title', render: t => <b>{t}</b> }, { title: 'Mô tả', dataIndex: 'description', ellipsis: true, className: 'text-secondary' }]} dataSource={filteredCoursesPool} rowKey="id" pagination={{ pageSize: 6 }} size="middle" scroll={{ y: 400 }} bordered locale={{ emptyText: 'Không tìm thấy khóa học phù hợp' }} />
      </Modal>

      <Modal title={<Space><UserAddOutlined style={{color:'#52c41a'}}/> <span style={{fontSize:16}}>Chọn Giảng Viên Phụ Trách</span></Space>} open={isAddTeacherModal} onOk={handleAddTeachers} onCancel={() => setIsAddTeacherModal(false)} width={900} okText={`Thêm ${selectedTeacherKeys.length} giảng viên`} cancelText="Hủy bỏ">
         <div style={{marginBottom: 16}}><Input prefix={<SearchOutlined style={{color:'#999'}} />} placeholder="Tìm giảng viên theo Tên hoặc Email..." value={teacherSearchTerm} onChange={e => setTeacherSearchTerm(e.target.value)} style={{width: '100%'}} size="large" allowClear /></div>
         <Table rowSelection={{ selectedRowKeys: selectedTeacherKeys, onChange: (keys) => setSelectedTeacherKeys(keys), preserveSelectedRowKeys: true }} columns={[{ title: 'Giảng viên', dataIndex: 'full_name', render: (t, r) => (<Space><Avatar src={r.avatar} icon={<UserOutlined />} style={{backgroundColor: '#87d068'}} /><div><div style={{fontWeight: 600}}>{t}</div><div style={{fontSize: 12, color: '#888'}}>{r.phone}</div></div></Space>) }, { title: 'Email', dataIndex: 'email' }, { title: 'Giới tính', dataIndex: 'gender', width: 100 }]} dataSource={filteredTeachersPool} rowKey="user_id" pagination={{ pageSize: 6 }} size="middle" scroll={{ y: 400 }} bordered locale={{ emptyText: 'Không tìm thấy giảng viên phù hợp' }} />
      </Modal>
    </div>
  );
}