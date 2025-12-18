// src/pages/teacher/TeacherClassDetail.jsx

import { useEffect, useState, useMemo } from "react"; 
import { useParams, useNavigate } from "react-router-dom";
import { 
  Tabs, Table, Button, Card, 
  Tag, message, Select, Spin, 
  Input, Avatar, Empty, List, Tooltip, 
  Breadcrumb, Typography, Space, Descriptions, Statistic, Divider, 
  Popover, Progress 
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

// Helper Functions
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
  
  // Data State
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

  // FETCH TIẾN ĐỘ HỌC TẬP
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

  // EXCEL EXPORT ONLY (Giữ lại để GV xuất danh sách)
  const handleExportExcel = () => {
    if (students.length === 0) return message.warning("Danh sách trống");
    const sortedData = sortByName(students);
    const data = sortedData.map((s, idx) => ({ STT: idx + 1, "Mã SV": s.student_code || '', "Họ tên": s.full_name, "Email": s.email, }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, `Class_${classInfo?.code}.xlsx`);
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
    // CỘT TIẾN ĐỘ HỌC TẬP
    {
      title: 'Tiến độ',
      key: 'progress',
      width: 200,
      render: (_, r) => {
          const userProgressList = studentProgressMap[r.student_id] || [];
          
          if (userProgressList.length === 0) {
              return <Tag color="default">Chưa có dữ liệu</Tag>;
          }

          const avgPercent = Math.round(userProgressList.reduce((acc, curr) => acc + curr.percent, 0) / (userProgressList.length || 1));
          
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
    }
    // ❌ ĐÃ XÓA CỘT THAO TÁC (DELETE)
  ];

  // -- Teacher Table --
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
    // ❌ ĐÃ XÓA CỘT THAO TÁC (DELETE)
  ];

  // -- Course Table --
  const filteredCoursesInClass = useMemo(() => {
    const list = classInfo?.courses || [];
    if(!courseTabSearchText) return list;
    const lower = courseTabSearchText.toLowerCase();
    return list.filter(c => c.title?.toLowerCase().includes(lower) || c.code?.toLowerCase().includes(lower));
  }, [classInfo, courseTabSearchText]);

  const courseColumns = [
    { title: 'Tên khóa học', dataIndex: 'title', render: (t, r) => (<div style={{display:'flex', gap:12, alignItems:'center'}}><Avatar icon={<BookOutlined/>} shape="square" style={{backgroundColor:'#faad14', flexShrink: 0}} size="large"/><div><div style={{fontWeight:600, fontSize: '14px'}}>{t}</div><div style={{fontSize: 12, color: '#888', maxWidth: 300, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{r.description || 'Chưa có mô tả'}</div></div></div>) },
    { title: 'Mã môn', dataIndex: 'code', width: 150, render: (t) => <Tag color="blue">{t}</Tag> },
    // ❌ ĐÃ XÓA CỘT THAO TÁC (DELETE)
  ];

  if (loading && !classInfo) return ( <div style={{height: '100vh', display:'flex', justifyContent:'center', alignItems:'center', background: '#f5f5f5'}}><Spin tip="Đang tải dữ liệu lớp học..." size="large" /></div> );

  return (
    <div style={{ padding: '24px 32px', background: '#f5f7fa', minHeight: '100vh' }}>
      {/* HEADER SECTION */}
      <div style={{ marginBottom: 24 }}>
        <Breadcrumb items={[{title: 'Giảng viên'}, {title: 'Lớp học của tôi'}, {title: classInfo?.name || 'Chi tiết lớp'}]} style={{marginBottom: 16}}/>
        {classInfo && (
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} bodyStyle={{padding: 24}}>
             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <div style={{flex: 1}}>
                    <Space align="center" style={{marginBottom: 12}}>
                       {/* Nút quay lại về trang lớp của GV */}
                       <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate('/teacher/classes')} />
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
                        {/* Chỉ giữ lại nút Xuất Excel */}
                        <Button icon={<FileExcelOutlined />} onClick={handleExportExcel}>Xuất Excel</Button>
                    </Space>
                  </div>
                  <Table dataSource={filteredStudents} columns={studentColumns} rowKey="student_id" pagination={{ pageSize: 8, showTotal: (total) => `Tổng ${total} học viên` }} scroll={{ x: 800 }} />
                </div>
              )
            },
            // TAB 2: GIẢNG VIÊN (Chỉ xem)
            {
              key: '2',
              label: <span><UserOutlined /> Giảng viên</span>,
              children: (
                <div style={{padding: 24}}>
                   <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10}}>
                      <Input placeholder="Tìm kiếm giảng viên..." prefix={<SearchOutlined style={{color:'#ccc'}}/>} allowClear style={{width: 350, borderRadius: 6}} onChange={e => setTeacherTabSearchText(e.target.value)} />
                      {/* Đã xóa nút thêm giảng viên */}
                   </div>
                   <Table dataSource={filteredTeachersInClass} columns={teacherColumns} rowKey="user_id" pagination={{ pageSize: 8 }} scroll={{ x: 800 }} locale={{ emptyText: "Chưa có giảng viên nào được gán" }} />
                </div>
              )
            },
            // TAB 3: KHÓA HỌC (Chỉ xem)
            {
              key: '3',
              label: <span><ReadOutlined /> Khóa học</span>,
              children: (
                <div style={{padding: 24}}>
                   <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10}}>
                      <Input placeholder="Tìm kiếm khóa học..." prefix={<SearchOutlined style={{color:'#ccc'}}/>} allowClear style={{width: 350, borderRadius: 6}} onChange={e => setCourseTabSearchText(e.target.value)} />
                      {/* Đã xóa nút gán khóa học */}
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

      {/* Đã xóa toàn bộ Modal */}
    </div>
  );
}