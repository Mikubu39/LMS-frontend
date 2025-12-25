import { useEffect, useState, useMemo } from "react"; 
import { useParams, useNavigate } from "react-router-dom";
import { 
  Tabs, Table, Button, Card, 
  Tag, message, Modal, Select, Spin, 
  Popconfirm, Input, Avatar, Empty, List, Upload, Tooltip, 
  Breadcrumb, Typography, Space, Descriptions, Statistic, Divider, Dropdown,
  Popover, Progress, Row, Col
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
  DashboardOutlined, EnvironmentOutlined
} from "@ant-design/icons";
import moment from "moment";
import * as XLSX from 'xlsx'; 

// Import APIs
import { ClassApi } from "@/services/api/classApi";
import { UserApi } from "@/services/api/userApi";
import { CourseApi } from "@/services/api/courseApi"; 
import { ProgressApi } from "@/services/api/progressApi";

import ClassQuizTab from "../../components/ClassQuizTab";
import ClassEssayTab from "../../components/ClassEssayTab";

const { Title, Text } = Typography;
const { Option } = Select;

// --- Helper Functions ---
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
  
  // --- States ---
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [studentProgressMap, setStudentProgressMap] = useState({});
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

  // --- Data Fetching ---
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

  useEffect(() => {
    const fetchProgress = async () => {
        if (!classInfo || !students || students.length === 0 || !classInfo.courses || classInfo.courses.length === 0) return;
        try {
            const studentIds = students.map(s => s.student_id);
            const courseIds = classInfo.courses.map(c => c.id);
            const res = await ProgressApi.getClassProgress(classId, studentIds, courseIds);
            const data = res.data || res || {}; 
            setStudentProgressMap(data);
        } catch (error) { console.error("Lỗi tải tiến độ:", error); }
    };
    fetchProgress();
  }, [classInfo, students, classId]);

  // --- Handlers (Đã sửa logic nhận Data) ---
  const handleOpenAddStudentModal = async () => {
    setIsAddStudentModal(true);
    setAddingStudents(true); 
    try {
        const res = await UserApi.getAll({ role: 'student', limit: 1000 });
        // [FIX] Lấy data an toàn (tránh lỗi filter is not a function)
        const allStudents = res.data || res || []; 
        
        const allClasses = await ClassApi.getAll();
        const otherClasses = allClasses.data || allClasses || []; // [FIX] Safe data

        // Chỉ lọc khi thực sự là mảng
        if (!Array.isArray(allStudents)) throw new Error("API User trả về sai định dạng");
        
        // Fallback nếu otherClasses lỗi
        const safeOtherClasses = Array.isArray(otherClasses) ? otherClasses : [];

        const currentClassId = classId;
        const otherClassesFiltered = safeOtherClasses.filter(c => c.class_id !== currentClassId);
        
        const busyPromises = otherClassesFiltered.map(c => ClassApi.getStudents(c.class_id));
        const busyResults = await Promise.all(busyPromises);
        
        const busyStudentIds = new Set();
        busyResults.flat().forEach(s => busyStudentIds.add(s.student_id));
        students.forEach(s => busyStudentIds.add(s.student_id));

        const availableStudents = allStudents.filter(u => !busyStudentIds.has(u.user_id));
        setAllStudentsPool(sortByName(availableStudents));
        setSelectedStudentKeys([]); 
        setStudentSearchText("");
    } catch (error) { 
        console.error(error);
        message.error("Lỗi tải danh sách học viên"); 
    } finally { setAddingStudents(false); }
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

  const handleRemoveStudent = async (id) => {
    try { await ClassApi.removeStudent(classId, id); message.success("Đã xóa học viên"); fetchClassData(); } catch (error) { message.error("Lỗi khi xóa"); }
  };

  const handleExportExcel = () => {
    if (students.length === 0) return message.warning("Danh sách trống");
    const sortedData = sortByName(students);
    const data = sortedData.map((s, idx) => ({ STT: idx + 1, "Mã SV": s.student_code || '', "Họ tên": s.full_name, "Email": s.email }));
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
             // [FIX] Cần check res.data
             const userRes = await UserApi.getAll({ email, role: 'student', limit: 1 });
             const list = userRes.data || userRes || [];
             if (list?.[0]?.user_id) { 
                 await ClassApi.addStudent(classId, list[0].user_id); 
                 success++; 
             }
          } catch(e) {}
       }
       if (success > 0) message.success(`Import thành công ${success} học viên`);
       setIsImportModalOpen(false); setExcelEmails([]); fetchClassData();
    } catch(e) { message.error("Lỗi import"); } finally { setImporting(false); }
  };

  const openAddCourseModal = async () => {
     setLoading(true);
     try {
        const res = await CourseApi.getCourses({ page: 1, limit: 1000 });
        // [FIX] Xử lý safe data cho courses
        const coursesData = res.courses || res.data || res || [];
        
        if (!Array.isArray(coursesData)) throw new Error("Sai định dạng Course API");

        const currentIds = classInfo.courses ? classInfo.courses.map(c => c.id) : [];
        setAllCourses(coursesData.filter(c => !currentIds.includes(c.id)));
        setSelectedCourseKeys([]); setCourseSearchTerm(""); setIsAddCourseModal(true);
     } catch(error) { 
         console.error(error);
         message.error("Lỗi tải danh sách khóa học"); 
     } finally { setLoading(false); }
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

  const openAddTeacherModal = async () => {
    setLoading(true);
    try {
        const res = await UserApi.getAll({ role: 'teacher', limit: 1000 });
        // [FIX QUAN TRỌNG] Xử lý safe data, tránh lỗi filter trên object
        const teachersList = res.data || res || [];

        if (!Array.isArray(teachersList)) throw new Error("Format API User sai");

        const currentIds = classInfo.teachers.map(t => t.user_id);
        setAllTeachers(teachersList.filter(t => !currentIds.includes(t.user_id)));
        setSelectedTeacherKeys([]); setTeacherSearchTerm(""); setIsAddTeacherModal(true);
    } catch(e) { 
        console.error(e);
        message.error("Lỗi tải giảng viên"); 
    } finally { setLoading(false); }
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

  // --- Filtering & Columns ---
  const filteredStudents = useMemo(() => {
    const list = students || [];
    if(!studentTabSearchText) return list;
    const lower = studentTabSearchText.toLowerCase();
    return list.filter(s => s.full_name?.toLowerCase().includes(lower) || s.email?.toLowerCase().includes(lower) || (s.student_code && s.student_code.toLowerCase().includes(lower)));
  }, [students, studentTabSearchText]);

  const filteredTeachersInClass = useMemo(() => {
    const list = classInfo?.teachers || [];
    const sortedList = sortByName(list);
    if(!teacherTabSearchText) return sortedList;
    const lower = teacherTabSearchText.toLowerCase();
    return sortedList.filter(t => t.full_name?.toLowerCase().includes(lower) || t.email?.toLowerCase().includes(lower) || (t.phone && t.phone.includes(lower)));
  }, [classInfo, teacherTabSearchText]);

  const filteredCoursesInClass = useMemo(() => {
    const list = classInfo?.courses || [];
    if(!courseTabSearchText) return list;
    const lower = courseTabSearchText.toLowerCase();
    return list.filter(c => c.title?.toLowerCase().includes(lower) || c.code?.toLowerCase().includes(lower));
  }, [classInfo, courseTabSearchText]);

  // Modal filters
  const filteredStudentPool = useMemo(() => {
    if (!studentSearchText) return allStudentsPool;
    const lower = studentSearchText.toLowerCase();
    return allStudentsPool.filter(s => s.full_name?.toLowerCase().includes(lower) || s.email?.toLowerCase().includes(lower) || (s.student_code && s.student_code.toLowerCase().includes(lower)));
  }, [allStudentsPool, studentSearchText]);

  const filteredCoursesPool = (allCourses || []).filter(c => c.title.toLowerCase().includes(courseSearchTerm.toLowerCase()) || c.code.toLowerCase().includes(courseSearchTerm.toLowerCase()));
  const filteredTeachersPool = (allTeachers || []).filter(t => t.full_name.toLowerCase().includes(teacherSearchTerm.toLowerCase()) || t.email.toLowerCase().includes(teacherSearchTerm.toLowerCase()));

  // --- Table Columns ---
  const studentColumns = [
    {
        title: 'Sinh viên', dataIndex: 'full_name', fixed: 'left', width: 280,
        sorter: (a, b) => getFirstName(a.full_name).localeCompare(getFirstName(b.full_name)),
        render: (t, r) => (
           <div style={{display:'flex', gap:12, alignItems:'center'}}>
              <Avatar src={r.avatar} icon={<UserOutlined/>} style={{backgroundColor:'#1890ff', border: '2px solid #e6f7ff'}} size={40}/>
              <div style={{display: 'flex', flexDirection: 'column'}}>
                 <Text strong style={{fontSize: '14px', marginBottom: 0}}>{t}</Text>
                 <Text type="secondary" style={{fontSize: '12px'}}>{r.student_code || 'N/A'}</Text>
              </div>
           </div>
        )
    },
    { 
        title: 'Liên hệ', key: 'contact', width: 250,
        render: (_, r) => (
            <Space direction="vertical" size={0}>
                <Text copyable={{text: r.email}} style={{color: '#555'}}><MailOutlined style={{color:'#888', marginRight:6}}/> {r.email}</Text>
                {r.phone && <Text style={{color: '#555'}}><PhoneOutlined style={{color:'#888', marginRight:6}}/> {r.phone}</Text>}
            </Space>
        )
    },
    {
      title: 'Tiến độ học tập', key: 'progress', width: 220,
      render: (_, r) => {
          const userProgressList = studentProgressMap[r.student_id] || [];
          const avgPercent = userProgressList.length > 0 
            ? Math.round(userProgressList.reduce((acc, curr) => acc + curr.percent, 0) / userProgressList.length) 
            : 0;
          
          const popoverContent = (
              <List size="small" dataSource={userProgressList} renderItem={item => (
                 <List.Item style={{padding: '8px 0'}}>
                    <div style={{width: '100%'}}>
                        <div style={{fontSize: 12, marginBottom: 4, color: '#666'}}>{classInfo?.courses?.find(c => c.id === item.courseId)?.title || "Khóa học"}</div>
                        <Progress percent={item.percent} size="small" status={item.percent === 100 ? "success" : "active"} />
                    </div>
                 </List.Item>
              )}/>
          );

          return (
              <Popover content={userProgressList.length > 0 ? popoverContent : "Chưa có dữ liệu"} title="Chi tiết tiến độ" trigger="hover">
                  <div style={{cursor: 'pointer'}}>
                      <Progress percent={avgPercent} steps={5} size="small" strokeColor={avgPercent === 100 ? '#52c41a' : '#1890ff'} trailColor="#f0f0f0" />
                  </div>
              </Popover>
          );
      }
    },
    { 
        title: '', align: 'center', fixed: 'right', width: 60,
        render: (_, r) => (
           <Popconfirm title="Xóa học viên khỏi lớp này?" onConfirm={() => handleRemoveStudent(r.student_id)} okButtonProps={{danger:true}}>
              <Button type="text" danger icon={<DeleteOutlined/>}></Button>
           </Popconfirm>
        )
    }
  ];

  const teacherColumns = [
    { title: 'Giảng viên', dataIndex: 'full_name', fixed: 'left', width: 280, sorter: (a, b) => getFirstName(a.full_name).localeCompare(getFirstName(b.full_name)), render: (t, r) => (<div style={{display:'flex', gap:12, alignItems:'center'}}><Avatar src={r.avatar} icon={<UserOutlined/>} style={{backgroundColor:'#52c41a', border: '2px solid #f6ffed'}} size={40}/><div><Text strong>{t}</Text></div></div>) },
    { title: 'Liên hệ', key: 'contact', width: 250, render: (_, r) => (<Space direction="vertical" size={0}><Text copyable={{text: r.email}} style={{color: '#555'}}><MailOutlined style={{color:'#888', marginRight:6}}/> {r.email}</Text>{r.phone && <Text style={{color: '#555'}}><PhoneOutlined style={{color:'#888', marginRight:6}}/> {r.phone}</Text>}</Space>) },
    { title: 'Thông tin', key: 'info', width: 150, render: (_, r) => (<Space>{r.gender === 'Nam' ? <ManOutlined style={{color: '#1890ff'}}/> : r.gender === 'Nữ' ? <WomanOutlined style={{color: '#eb2f96'}}/> : '--'}<span>{r.dateOfBirth ? moment(r.dateOfBirth).format("DD/MM/YYYY") : ''}</span></Space>) },
    { title: '', align: 'center', fixed: 'right', width: 60, render: (_, r) => (<Popconfirm title="Gỡ giảng viên khỏi lớp?" onConfirm={() => handleRemoveTeacher(r.user_id)} okButtonProps={{danger:true}}><Button type="text" danger icon={<DeleteOutlined/>}></Button></Popconfirm>) }
  ];

  const courseColumns = [
    { title: 'Tên khóa học', dataIndex: 'title', render: (t, r) => (<div style={{display:'flex', gap:12, alignItems:'center'}}><Avatar icon={<BookOutlined/>} shape="square" style={{backgroundColor:'#faad14', border: '2px solid #fffbe6'}} size={40}/><div><Text strong>{t}</Text><div style={{fontSize: 12, color: '#888', maxWidth: 300}} className="text-truncate">{r.description || 'Chưa có mô tả'}</div></div></div>) },
    { title: 'Mã môn', dataIndex: 'code', width: 150, render: (t) => <Tag color="blue">{t}</Tag> },
    { title: '', align: 'center', width: 60, render: (_, r) => (<Popconfirm title="Gỡ khóa học khỏi lớp?" onConfirm={() => handleRemoveCourse(r.id)} okButtonProps={{danger:true}}><Button type="text" danger icon={<DeleteOutlined/>}></Button></Popconfirm>) }
  ];

  const exportItems = [ { key: 'export', label: 'Xuất Excel', icon: <FileExcelOutlined />, onClick: handleExportExcel }, { key: 'import', label: 'Import Excel', icon: <UploadOutlined />, onClick: () => setIsImportModalOpen(true) }, ];

  // --- LOADING STATE ---
  if (loading && !classInfo) return ( <div style={{height: '100vh', display:'flex', justifyContent:'center', alignItems:'center', background: '#f5f7fa'}}><Spin tip="Đang tải dữ liệu lớp học..." size="large" /></div> );

  return (
    <div style={{ padding: '20px 24px', background: '#f0f2f5', minHeight: '100vh' }}>
      
      {/* 1. HEADER SECTION (DASHBOARD STYLE) */}
      <div style={{ marginBottom: 20 }}>
        <Breadcrumb items={[{title: 'Quản lý đào tạo'}, {title: 'Danh sách lớp'}, {title: classInfo?.name || 'Chi tiết'}]} style={{marginBottom: 16}}/>
        
        {classInfo && (
          <Row gutter={[16, 16]}>
             {/* Left Column: Info */}
             <Col xs={24} lg={16}>
                <Card bordered={false} style={{ borderRadius: 8, height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                        <div>
                            <Space align="center" style={{marginBottom: 8}}>
                                <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate('/admin/classes')} />
                                <Title level={3} style={{margin: 0}}>{classInfo.name}</Title>
                            </Space>
                            <Space style={{marginBottom: 16, paddingLeft: 40}}>
                                <Tag color="geekblue" style={{fontSize: 14, padding: '2px 8px'}}>{classInfo.code}</Tag>
                                <Tag color={classInfo.status === 'Active' ? 'green' : 'orange'} icon={classInfo.status === 'Active' ? <CheckCircleOutlined /> : <SyncOutlined spin />}>{classInfo.status}</Tag>
                            </Space>
                            <div style={{paddingLeft: 40, display: 'flex', gap: 24, flexWrap: 'wrap'}}>
                                <span style={{color: '#666'}}><CalendarOutlined style={{marginRight: 6}}/> {classInfo.start_date ? moment(classInfo.start_date).format("DD/MM/YYYY") : "--"} &rarr; {classInfo.end_date ? moment(classInfo.end_date).format("DD/MM/YYYY") : "--"}</span>
                                <span style={{color: '#666'}}><UserOutlined style={{marginRight: 6}}/> GVCN: <b>{classInfo.teachers?.[0]?.full_name || 'Chưa gán'}</b></span>
                            </div>
                        </div>
                    </div>
                </Card>
             </Col>

             {/* Right Column: Stats */}
             <Col xs={24} lg={8}>
                <Row gutter={[12, 12]}>
                    <Col span={12}>
                        <Card bordered={false} style={{borderRadius: 8, textAlign:'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}} bodyStyle={{padding: 16}}>
                             <Statistic title="Học viên" value={students.length} valueStyle={{color: '#1890ff', fontWeight: 'bold'}} prefix={<TeamOutlined />} />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card bordered={false} style={{borderRadius: 8, textAlign:'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}} bodyStyle={{padding: 16}}>
                             <Statistic title="Giảng viên" value={classInfo?.teachers?.length || 0} valueStyle={{color: '#52c41a', fontWeight: 'bold'}} prefix={<UserOutlined />} />
                        </Card>
                    </Col>
                    <Col span={24}>
                        <Card bordered={false} style={{borderRadius: 8, textAlign:'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}} bodyStyle={{padding: 16}}>
                             <Statistic title="Giáo trình" value={classInfo?.courses?.length || 0} prefix={<BookOutlined />} suffix="môn học" valueStyle={{fontSize: 18}} />
                        </Card>
                    </Col>
                </Row>
             </Col>
          </Row>
        )}
      </div>

      {/* 2. MAIN TABS AREA */}
      <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }} bodyStyle={{padding: 0}}>
        <Tabs 
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
          tabBarStyle={{padding: '0 24px', margin: 0}}
          items={[
            // TAB 1: STUDENTS
            {
              key: '1', label: <span style={{padding: '0 8px'}}><TeamOutlined /> Quản lý Học viên</span>,
              children: (
                <div style={{padding: 24}}>
                  <Row justify="space-between" align="middle" style={{marginBottom: 20}} gutter={[16, 16]}>
                     <Col xs={24} md={12}>
                        <Input prefix={<SearchOutlined style={{color:'#ccc'}}/>} placeholder="Tìm kiếm theo tên, mã SV, email..." allowClear size="large" style={{borderRadius: 6}} onChange={e => setStudentTabSearchText(e.target.value)} />
                     </Col>
                     <Col>
                        <Space>
                           <Button onClick={handleOpenAddStudentModal} type="primary" size="large" icon={<UserAddOutlined />} style={{borderRadius: 6}}>Thêm học viên</Button>
                           <Dropdown menu={{ items: exportItems }} placement="bottomRight" trigger={['click']}>
                              <Button size="large" icon={<MoreOutlined />}>Tiện ích Excel</Button>
                           </Dropdown>
                        </Space>
                     </Col>
                  </Row>
                  <Table dataSource={filteredStudents} columns={studentColumns} rowKey="student_id" pagination={{ pageSize: 8, showTotal: (total) => `Tổng ${total} học viên` }} scroll={{ x: 900 }} />
                </div>
              )
            },
            // TAB 2: TEACHERS
            {
              key: '2', label: <span style={{padding: '0 8px'}}><UserOutlined /> Quản lý Giảng viên</span>,
              children: (
                <div style={{padding: 24}}>
                  <Row justify="space-between" align="middle" style={{marginBottom: 20}}>
                     <Col xs={24} md={12}><Input prefix={<SearchOutlined style={{color:'#ccc'}}/>} placeholder="Tìm giảng viên..." allowClear size="large" style={{borderRadius: 6}} onChange={e => setTeacherTabSearchText(e.target.value)} /></Col>
                     <Col><Button type="primary" ghost size="large" icon={<UserAddOutlined />} onClick={openAddTeacherModal} style={{borderRadius: 6}}>Thêm giảng viên</Button></Col>
                  </Row>
                  <Table dataSource={filteredTeachersInClass} columns={teacherColumns} rowKey="user_id" pagination={{ pageSize: 8 }} scroll={{ x: 800 }} locale={{ emptyText: "Chưa có giảng viên" }} />
                </div>
              )
            },
            // TAB 3: COURSES
            {
              key: '3', label: <span style={{padding: '0 8px'}}><ReadOutlined /> Khóa học & Giáo trình</span>,
              children: (
                <div style={{padding: 24}}>
                  <Row justify="space-between" align="middle" style={{marginBottom: 20}}>
                     <Col xs={24} md={12}><Input prefix={<SearchOutlined style={{color:'#ccc'}}/>} placeholder="Tìm khóa học..." allowClear size="large" style={{borderRadius: 6}} onChange={e => setCourseTabSearchText(e.target.value)} /></Col>
                     <Col><Button type="primary" size="large" icon={<PlusOutlined />} onClick={openAddCourseModal} style={{borderRadius: 6}}>Gán khóa học</Button></Col>
                  </Row>
                  <Table dataSource={filteredCoursesInClass} columns={courseColumns} rowKey="id" pagination={{ pageSize: 8 }} scroll={{ x: 800 }} locale={{ emptyText: "Chưa có khóa học" }} />
                </div>
              )
            },
            // TAB 4: GRADES
            {
              key: '4', label: <span style={{padding: '0 8px'}}><TrophyOutlined /> Sổ điểm & Bài tập</span>,
              children: (
                <div style={{minHeight: 500}}>
                    <div style={{padding: '24px', background: '#fafafa', borderBottom: '1px solid #f0f0f0'}}>
                        <Space>
                            <Text strong style={{fontSize: 16}}>Chọn môn học cần xem:</Text>
                            <Select value={selectedCourseId} onChange={setSelectedCourseId} style={{width: 320}} size="large" placeholder="-- Chọn khóa học --" showSearch optionFilterProp="children">
                                {classInfo?.courses?.map(c => <Option key={c.id} value={c.id}>{c.title}</Option>)}
                            </Select>
                        </Space>
                    </div>
                    {selectedCourseId ? (
                        <div style={{padding: 24}}>
                            <Tabs type="card" items={[ { key: 'sub-quiz', label: <span><CheckCircleOutlined /> Điểm Quiz</span>, children: <ClassQuizTab courseId={selectedCourseId} students={students} /> }, { key: 'sub-essay', label: <span><EditOutlined /> Bài Tự luận</span>, children: <ClassEssayTab courseId={selectedCourseId} students={students} /> } ]} />
                        </div>
                    ) : (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Vui lòng kiểm tra khóa học phía trên để xem bảng điểm" style={{marginTop: 80, marginBottom: 80}} />
                    )}
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* --- MODALS (KEEP LOGIC, IMPROVE UI) --- */}
      {/* 1. Add Student */}
      <Modal title={<Space><UserAddOutlined /> <span>Thêm học viên</span><Tag color="blue">{selectedStudentKeys.length} đã chọn</Tag></Space>} open={isAddStudentModal} onOk={handleAddStudentsSubmit} onCancel={() => setIsAddStudentModal(false)} width={800} okText="Xác nhận thêm" cancelText="Hủy" confirmLoading={addingStudents} centered>
         <div style={{marginBottom: 16, background: '#f5f7fa', padding: 16, borderRadius: 8, border: '1px solid #eee'}}>
             <Input prefix={<SearchOutlined style={{color:'#999'}} />} placeholder="Nhập tên, mã SV để tìm..." value={studentSearchText} onChange={e => setStudentSearchText(e.target.value)} allowClear size="large" />
             <div style={{marginTop:8, fontSize:12, color:'#888', paddingLeft: 4}}>* Hệ thống tự động lọc bỏ các học viên đã có lớp học khác.</div>
         </div>
         <Table rowSelection={{ selectedRowKeys: selectedStudentKeys, onChange: (keys) => setSelectedStudentKeys(keys), preserveSelectedRowKeys: true }} columns={[{ title: 'Mã SV', dataIndex: 'student_code', width: 120, render: (c) => <Tag>{c}</Tag> }, { title: 'Họ tên', dataIndex: 'full_name', sorter: (a, b) => getFirstName(a.full_name).localeCompare(getFirstName(b.full_name)), render: (t, r) => <Space><Avatar src={r.avatar} size="small" /><b>{t}</b></Space> }, { title: 'Email', dataIndex: 'email', className: 'text-secondary' }]} dataSource={filteredStudentPool} rowKey="user_id" pagination={{ pageSize: 6, size: 'small' }} size="small" scroll={{ y: 350 }} loading={addingStudents && allStudentsPool.length === 0} bordered />
      </Modal>

      {/* 2. Import Excel */}
      <Modal title="Import từ Excel" open={isImportModalOpen} onOk={handleImportStudents} onCancel={() => {setIsImportModalOpen(false); setExcelEmails([]);}} confirmLoading={importing} okText={excelEmails.length > 0 ? `Import ${excelEmails.length} users` : "Import"} centered>
        <Space direction="vertical" style={{width:'100%'}}>
           <div style={{padding: 24, background: '#fafafa', borderRadius: 8, textAlign:'center', border: '2px dashed #d9d9d9', cursor:'pointer'}}>
              <Upload beforeUpload={(file) => { handleExcelFile(file); return false; }} maxCount={1} showUploadList={false}>
                  <p className="ant-upload-drag-icon"><FileExcelOutlined style={{fontSize: 48, color: '#217346'}}/></p>
                  <p className="ant-upload-text">Nhấn hoặc kéo thả file Excel vào đây</p>
              </Upload>
           </div>
           <div style={{marginTop: 8, fontSize: 13, color: '#666'}}>* File cần có cột B là Email.</div>
           {excelEmails.length > 0 && (<div style={{marginTop: 10, padding: 10, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4, color: '#389e0d'}}><CheckCircleOutlined /> Đã tìm thấy <b>{excelEmails.length}</b> email hợp lệ.</div>)}
        </Space>
      </Modal>

      {/* 3. Add Course */}
      <Modal title="Chọn Khóa Học" open={isAddCourseModal} onOk={handleAddCourses} onCancel={() => setIsAddCourseModal(false)} width={800} centered>
         <div style={{marginBottom: 16}}><Input prefix={<SearchOutlined />} placeholder="Tìm khóa học..." value={courseSearchTerm} onChange={e => setCourseSearchTerm(e.target.value)} size="large" /></div>
         <Table rowSelection={{ selectedRowKeys: selectedCourseKeys, onChange: (keys) => setSelectedCourseKeys(keys) }} columns={[{ title: 'Mã', dataIndex: 'code', render: t => <Tag color="blue">{t}</Tag> }, { title: 'Tên khóa học', dataIndex: 'title', render: t => <b>{t}</b> }]} dataSource={filteredCoursesPool} rowKey="id" pagination={{ pageSize: 6 }} size="small" scroll={{ y: 350 }} bordered />
      </Modal>

      {/* 4. Add Teacher */}
      <Modal title="Chọn Giảng Viên" open={isAddTeacherModal} onOk={handleAddTeachers} onCancel={() => setIsAddTeacherModal(false)} width={800} centered>
         <div style={{marginBottom: 16}}><Input prefix={<SearchOutlined />} placeholder="Tìm giảng viên..." value={teacherSearchTerm} onChange={e => setTeacherSearchTerm(e.target.value)} size="large" /></div>
         <Table rowSelection={{ selectedRowKeys: selectedTeacherKeys, onChange: (keys) => setSelectedTeacherKeys(keys) }} columns={[{ title: 'Tên GV', dataIndex: 'full_name', render: t => <b>{t}</b> }, { title: 'Email', dataIndex: 'email' }]} dataSource={filteredTeachersPool} rowKey="user_id" pagination={{ pageSize: 6 }} size="small" scroll={{ y: 350 }} bordered />
      </Modal>
    </div>
  );
}