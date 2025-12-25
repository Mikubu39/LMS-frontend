// src/pages/teacher/TeacherClassDetail.jsx

import { useEffect, useState, useMemo } from "react"; 
import { useParams, useNavigate } from "react-router-dom";
import { 
  Tabs, Table, Button, Card, 
  Tag, message, Select, Spin, 
  Input, Avatar, Empty, List, Tooltip, 
  Breadcrumb, Typography, Space, Statistic, Divider, 
  Popover, Progress, Row, Col
} from "antd";
import { 
  ArrowLeftOutlined, 
  TeamOutlined, BookOutlined,
  SearchOutlined, UserOutlined, 
  ReadOutlined, TrophyOutlined, 
  EditOutlined, ManOutlined, WomanOutlined, 
  FileExcelOutlined, CalendarOutlined,
  CheckCircleOutlined, SyncOutlined, MailOutlined, PhoneOutlined
} from "@ant-design/icons";
import moment from "moment";
import * as XLSX from 'xlsx'; 

// Import APIs
import { ClassApi } from "@/services/api/classApi";
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

export default function TeacherClassDetail() {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  // --- Data State ---
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  // State lưu tiến độ học tập
  const [studentProgressMap, setStudentProgressMap] = useState({});

  // Tab States
  const [activeTab, setActiveTab] = useState('1');

  // Course Selection for Gradebook
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  
  // Search Text inside Tabs
  const [studentTabSearchText, setStudentTabSearchText] = useState('');
  const [teacherTabSearchText, setTeacherTabSearchText] = useState('');
  const [courseTabSearchText, setCourseTabSearchText] = useState('');

  // --- LOAD DATA ---
  const fetchClassData = async () => {
    setLoading(true);
    try {
      // Gọi song song 2 API lấy thông tin lớp và danh sách sinh viên
      const [info, studentList] = await Promise.all([
        ClassApi.getById(classId),
        ClassApi.getStudents(classId)
      ]);
      setClassInfo(info);
      setStudents(sortByName(studentList || []));
    } catch (error) { 
        console.error(error);
        message.error("Lỗi tải trang chi tiết"); 
    } finally { 
        setLoading(false); 
    }
  };

  useEffect(() => { if (classId) fetchClassData(); }, [classId]);

  // Tự động chọn khóa học đầu tiên khi có dữ liệu
  useEffect(() => {
    if (classInfo?.courses?.length > 0 && !selectedCourseId) {
        setSelectedCourseId(classInfo.courses[0].id);
    }
  }, [classInfo]);

  // FETCH TIẾN ĐỘ HỌC TẬP (Logic giữ nguyên)
  useEffect(() => {
    const fetchProgress = async () => {
        if (!classInfo || !students || students.length === 0 || !classInfo.courses || classInfo.courses.length === 0) return;

        try {
            const studentIds = students.map(s => s.student_id);
            const courseIds = classInfo.courses.map(c => c.id);
            
            const res = await ProgressApi.getClassProgress(classId, studentIds, courseIds);
            const data = res.data || res || {}; 
            setStudentProgressMap(data);
        } catch (error) {
            console.error("Lỗi tải tiến độ:", error);
        }
    };
    fetchProgress();
  }, [classInfo, students, classId]);

  // --- EXCEL EXPORT (Chức năng dành cho GV) ---
  const handleExportExcel = () => {
    if (students.length === 0) return message.warning("Danh sách trống");
    const sortedData = sortByName(students);
    const data = sortedData.map((s, idx) => ({ 
        STT: idx + 1, 
        "Mã SV": s.student_code || '', 
        "Họ tên": s.full_name, 
        "Email": s.email, 
        "SĐT": s.phone || ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, `Class_${classInfo?.code || 'List'}.xlsx`);
  };

  // --- FILTERING ---
  // 1. Student Filter
  const filteredStudents = useMemo(() => {
    const list = students || [];
    if(!studentTabSearchText) return list;
    const lower = studentTabSearchText.toLowerCase();
    return list.filter(s => s.full_name?.toLowerCase().includes(lower) || s.email?.toLowerCase().includes(lower) || (s.student_code && s.student_code.toLowerCase().includes(lower)));
  }, [students, studentTabSearchText]);

  // 2. Teacher Filter
  const filteredTeachersInClass = useMemo(() => {
    const list = classInfo?.teachers || [];
    const sortedList = sortByName(list);
    if(!teacherTabSearchText) return sortedList;
    const lower = teacherTabSearchText.toLowerCase();
    return sortedList.filter(t => t.full_name?.toLowerCase().includes(lower) || t.email?.toLowerCase().includes(lower));
  }, [classInfo, teacherTabSearchText]);

  // 3. Course Filter
  const filteredCoursesInClass = useMemo(() => {
    const list = classInfo?.courses || [];
    if(!courseTabSearchText) return list;
    const lower = courseTabSearchText.toLowerCase();
    return list.filter(c => c.title?.toLowerCase().includes(lower) || c.code?.toLowerCase().includes(lower));
  }, [classInfo, courseTabSearchText]);

  // --- COLUMNS CONFIGURATION (Giao diện đẹp như Admin) ---

  // Student Columns
  const studentColumns = [
    {
        title: 'Sinh viên',
        dataIndex: 'full_name',
        fixed: 'left',
        width: 280,
        sorter: (a, b) => getFirstName(a.full_name).localeCompare(getFirstName(b.full_name)),
        render: (t, r) => (
           <div style={{display:'flex', gap:12, alignItems:'center'}}>
              <Avatar src={r.avatar} icon={<UserOutlined/>} style={{backgroundColor:'#1890ff', border: '2px solid #e6f7ff'}} size={40}/>
              <div style={{display: 'flex', flexDirection: 'column'}}>
                 <Text strong style={{fontSize: '14px', marginBottom: 0}}>{t}</Text>
                 <Tag color="geekblue" style={{width: 'fit-content', marginTop: 2, fontSize: 11}}>{r.student_code || 'N/A'}</Tag>
              </div>
           </div>
        )
    },
    { 
        title: 'Liên hệ', 
        key: 'contact',
        width: 250,
        render: (_, r) => (
            <Space direction="vertical" size={0}>
                <Text copyable={{text: r.email}} style={{color: '#555'}}><MailOutlined style={{color:'#888', marginRight:6}}/> {r.email}</Text>
                {r.phone && <Text style={{color: '#555'}}><PhoneOutlined style={{color:'#888', marginRight:6}}/> {r.phone}</Text>}
            </Space>
        )
    },
    {
      title: 'Tiến độ học tập',
      key: 'progress',
      width: 220,
      render: (_, r) => {
          const userProgressList = studentProgressMap[r.student_id] || [];
          
          const avgPercent = userProgressList.length > 0 
            ? Math.round(userProgressList.reduce((acc, curr) => acc + curr.percent, 0) / userProgressList.length) 
            : 0;
          
          const popoverContent = (
              <List
                  size="small"
                  dataSource={userProgressList}
                  renderItem={item => {
                      const courseName = classInfo?.courses?.find(c => c.id === item.courseId)?.title || "Khóa học";
                      return (
                          <List.Item style={{padding: '8px 0'}}>
                              <div style={{width: '100%'}}>
                                  <div style={{fontSize: 12, marginBottom: 4, color: '#666'}}>{courseName}</div>
                                  <Progress percent={item.percent} size="small" status={item.percent === 100 ? "success" : "active"} />
                              </div>
                          </List.Item>
                      );
                  }}
              />
          );

          return (
              <Popover content={userProgressList.length > 0 ? popoverContent : "Chưa có dữ liệu"} title="Chi tiết tiến độ" trigger="hover">
                  <div style={{cursor: 'pointer'}}>
                      <Progress percent={avgPercent} steps={5} size="small" strokeColor={avgPercent === 100 ? '#52c41a' : '#1890ff'} trailColor="#f0f0f0" />
                  </div>
              </Popover>
          );
      }
    }
  ];

  // Teacher Columns
  const teacherColumns = [
    { title: 'Giảng viên', dataIndex: 'full_name', fixed: 'left', width: 280, sorter: (a, b) => getFirstName(a.full_name).localeCompare(getFirstName(b.full_name)), render: (t, r) => (<div style={{display:'flex', gap:12, alignItems:'center'}}><Avatar src={r.avatar} icon={<UserOutlined/>} style={{backgroundColor:'#52c41a', border: '2px solid #f6ffed'}} size={40}/><div><Text strong>{t}</Text></div></div>) },
    { title: 'Liên hệ', key: 'contact', width: 250, render: (_, r) => (<Space direction="vertical" size={0}><Text copyable={{text: r.email}} style={{color: '#555'}}><MailOutlined style={{color:'#888', marginRight:6}}/> {r.email}</Text>{r.phone && <Text style={{color: '#555'}}><PhoneOutlined style={{color:'#888', marginRight:6}}/> {r.phone}</Text>}</Space>) },
    { title: 'Thông tin', key: 'info', width: 150, render: (_, r) => (<Space>{r.gender === 'Nam' ? <ManOutlined style={{color: '#1890ff'}}/> : r.gender === 'Nữ' ? <WomanOutlined style={{color: '#eb2f96'}}/> : '--'}<span>{r.dateOfBirth ? moment(r.dateOfBirth).format("DD/MM/YYYY") : ''}</span></Space>) },
  ];

  // Course Columns
  const courseColumns = [
    { title: 'Tên khóa học', dataIndex: 'title', render: (t, r) => (<div style={{display:'flex', gap:12, alignItems:'center'}}><Avatar icon={<BookOutlined/>} shape="square" style={{backgroundColor:'#faad14', border: '2px solid #fffbe6'}} size={40}/><div><Text strong>{t}</Text><div style={{fontSize: 12, color: '#888', maxWidth: 300}} className="text-truncate">{r.description || 'Chưa có mô tả'}</div></div></div>) },
    { title: 'Mã môn', dataIndex: 'code', width: 150, render: (t) => <Tag color="blue">{t}</Tag> },
  ];

  if (loading && !classInfo) return ( <div style={{height: '100vh', display:'flex', justifyContent:'center', alignItems:'center', background: '#f5f7fa'}}><Spin tip="Đang tải dữ liệu lớp học..." size="large" /></div> );

  return (
    <div style={{ padding: '20px 24px', background: '#f0f2f5', minHeight: '100vh' }}>
      
      {/* 1. HEADER SECTION (Giao diện Dashboard giống Admin) */}
      <div style={{ marginBottom: 20 }}>
        <Breadcrumb items={[{title: 'Giảng viên'}, {title: 'Lớp học của tôi'}, {title: classInfo?.name || 'Chi tiết lớp'}]} style={{marginBottom: 16}}/>
        
        {classInfo && (
          <Row gutter={[16, 16]}>
             {/* Left Column: Class Info */}
             <Col xs={24} lg={16}>
                <Card bordered={false} style={{ borderRadius: 8, height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                        <div>
                            <Space align="center" style={{marginBottom: 8}}>
                                <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate('/teacher/classes')} />
                                <Title level={3} style={{margin: 0}}>{classInfo.name}</Title>
                            </Space>
                            <Space style={{marginBottom: 16, paddingLeft: 40}}>
                                <Tag color="geekblue" style={{fontSize: 14, padding: '2px 8px'}}>{classInfo.code}</Tag>
                                <Tag color={classInfo.status === 'Active' ? 'green' : 'orange'} icon={classInfo.status === 'Active' ? <CheckCircleOutlined /> : <SyncOutlined spin />}>{classInfo.status}</Tag>
                            </Space>
                            <div style={{paddingLeft: 40, display: 'flex', gap: 24, flexWrap: 'wrap'}}>
                                <span style={{color: '#666'}}><CalendarOutlined style={{marginRight: 6}}/> {classInfo.start_date ? moment(classInfo.start_date).format("DD/MM/YYYY") : "--"} &rarr; {classInfo.end_date ? moment(classInfo.end_date).format("DD/MM/YYYY") : "--"}</span>
                                {/* GV xem thông tin chính mình hoặc GV khác cùng lớp */}
                                <span style={{color: '#666'}}><UserOutlined style={{marginRight: 6}}/> GVCN: <b>{classInfo.teachers?.[0]?.full_name || 'Chưa gán'}</b></span>
                            </div>
                        </div>
                    </div>
                </Card>
             </Col>

             {/* Right Column: Statistics */}
             <Col xs={24} lg={8}>
                <Row gutter={[12, 12]}>
                    <Col span={12}>
                        <Card bordered={false} style={{borderRadius: 8, textAlign:'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}} bodyStyle={{padding: 16}}>
                             <Statistic title="Học viên" value={students.length} valueStyle={{color: '#1890ff', fontWeight: 'bold'}} prefix={<TeamOutlined />} />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card bordered={false} style={{borderRadius: 8, textAlign:'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}} bodyStyle={{padding: 16}}>
                             <Statistic title="Giáo trình" value={classInfo?.courses?.length || 0} valueStyle={{color: '#faad14', fontWeight: 'bold'}} prefix={<BookOutlined />} />
                        </Card>
                    </Col>
                    <Col span={24}>
                        <Card bordered={false} style={{borderRadius: 8, textAlign:'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}} bodyStyle={{padding: 16}}>
                             <Statistic title="Bài kiểm tra & Bài tập" value={loading ? '...' : 'Đang cập nhật'} prefix={<TrophyOutlined />} valueStyle={{fontSize: 18}} />
                        </Card>
                    </Col>
                </Row>
             </Col>
          </Row>
        )}
      </div>

      {/* 2. MAIN TABS CONTENT */}
      <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }} bodyStyle={{padding: 0}}>
        <Tabs 
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
          tabBarStyle={{padding: '0 24px', margin: 0}}
          items={[
            // TAB 1: DANH SÁCH HỌC VIÊN
            {
              key: '1',
              label: <span style={{padding: '0 8px'}}><TeamOutlined /> Danh sách Học viên</span>,
              children: (
                <div style={{padding: 24}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10}}>
                    <Input placeholder="Tìm kiếm theo tên, mã SV, email..." prefix={<SearchOutlined style={{color:'#ccc'}}/>} allowClear size="large" style={{width: 400, borderRadius: 6}} onChange={e => setStudentTabSearchText(e.target.value)} />
                    <Button icon={<FileExcelOutlined />} onClick={handleExportExcel} size="large" style={{borderRadius: 6}}>Xuất danh sách Excel</Button>
                  </div>
                  <Table dataSource={filteredStudents} columns={studentColumns} rowKey="student_id" pagination={{ pageSize: 8, showTotal: (total) => `Tổng ${total} học viên` }} scroll={{ x: 800 }} />
                </div>
              )
            },
            // TAB 2: DANH SÁCH GIẢNG VIÊN (VIEW ONLY)
            {
              key: '2',
              label: <span style={{padding: '0 8px'}}><UserOutlined /> Giảng viên</span>,
              children: (
                <div style={{padding: 24}}>
                   <div style={{marginBottom: 20}}>
                      <Input placeholder="Tìm kiếm giảng viên..." prefix={<SearchOutlined style={{color:'#ccc'}}/>} allowClear size="large" style={{width: 400, borderRadius: 6}} onChange={e => setTeacherTabSearchText(e.target.value)} />
                   </div>
                   <Table dataSource={filteredTeachersInClass} columns={teacherColumns} rowKey="user_id" pagination={{ pageSize: 8 }} scroll={{ x: 800 }} locale={{ emptyText: "Chưa có giảng viên nào được gán" }} />
                </div>
              )
            },
            // TAB 3: DANH SÁCH KHÓA HỌC (VIEW ONLY)
            {
              key: '3',
              label: <span style={{padding: '0 8px'}}><ReadOutlined /> Khóa học & Giáo trình</span>,
              children: (
                <div style={{padding: 24}}>
                   <div style={{marginBottom: 20}}>
                      <Input placeholder="Tìm kiếm khóa học..." prefix={<SearchOutlined style={{color:'#ccc'}}/>} allowClear size="large" style={{width: 400, borderRadius: 6}} onChange={e => setCourseTabSearchText(e.target.value)} />
                   </div>
                   <Table dataSource={filteredCoursesInClass} columns={courseColumns} rowKey="id" pagination={{ pageSize: 8 }} scroll={{ x: 800 }} locale={{ emptyText: "Chưa có khóa học nào được gán" }} />
                </div>
              )
            },
            // TAB 4: SỔ ĐIỂM (QUAN TRỌNG NHẤT VỚI GV)
            {
              key: '4',
              label: <span style={{padding: '0 8px'}}><TrophyOutlined /> Sổ điểm & Chấm bài</span>,
              children: (
                <div style={{minHeight: 500}}>
                    <div style={{padding: '24px', background: '#fafafa', borderBottom: '1px solid #f0f0f0'}}>
                        <Space>
                            <Text strong style={{fontSize: 16}}>Chọn môn học cần xem điểm:</Text>
                            <Select value={selectedCourseId} onChange={setSelectedCourseId} style={{width: 320}} size="large" placeholder="-- Chọn khóa học --" showSearch optionFilterProp="children" status={!selectedCourseId ? 'warning' : ''}>
                                {classInfo?.courses?.map(c => <Option key={c.id} value={c.id}>{c.title}</Option>)}
                            </Select>
                        </Space>
                    </div>
                    {selectedCourseId ? (
                        <div style={{padding: 24}}>
                            <Tabs type="card" items={[ { key: 'sub-quiz', label: <span><CheckCircleOutlined /> Điểm Quiz</span>, children: <ClassQuizTab courseId={selectedCourseId} students={students} /> }, { key: 'sub-essay', label: <span><EditOutlined /> Chấm bài Tự luận</span>, children: <ClassEssayTab courseId={selectedCourseId} students={students} /> } ]} />
                        </div>
                    ) : (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Vui lòng chọn khóa học phía trên để xem bảng điểm" style={{marginTop: 80, marginBottom: 80}} />
                    )}
                </div>
              )
            }
          ]}
        />
      </Card>
    </div>
  );
}