// src/pages/admin/CourseManagement.jsx
import { useEffect, useState, useCallback } from "react";
import {
  Table, Button, Space, Tag, Modal, Form,
  Input, Select, Popconfirm, message, Upload, Card, Row, Col, Tooltip, Typography
} from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  InboxOutlined, VideoCameraOutlined, SearchOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

// Services
import { CourseApi } from "@/services/api/courseApi.jsx";
import { uploadImage } from "@/services/api/uploadApi.jsx";

const { Option } = Select;
const { Title, Text } = Typography;
const { Dragger } = Upload;

export default function CourseManagement() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // --- State Management ---
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState(""); // State cho tìm kiếm
  
  // Pagination State
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Modal & Form State
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Upload State
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  /**
   * Core: Fetch data
   */
  const fetchCourses = useCallback(async (page = 1, limit = 10, search = "") => {
    try {
      setLoading(true);
      
      // Giả sử API hỗ trợ params search, nếu không nó sẽ bỏ qua
      const { courses: list, meta } = await CourseApi.getCourses({ page, limit, search });

      const mappedData = (list || []).map((c) => ({
        key: c.id,
        id: c.id,
        name: c.title,
        status: c.status || "Đang mở",
        sessionCount: c.sessionsCount || 0,
        thumbnail: c.thumbnail,
        level: c.level || "Beginner",
        raw: c, 
      }));

      setCourses(mappedData);
      setPagination({
        current: meta?.page || page,
        pageSize: meta?.limit || limit,
        total: meta?.total || 0,
      });

    } catch (error) {
      console.error("Fetch Error:", error);
      message.error("Không thể tải danh sách khóa học.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchCourses(pagination.current, pagination.pageSize, searchText);
  }, [fetchCourses, pagination.current, pagination.pageSize, searchText]); // Reload khi search text đổi

  /**
   * Action: Handle Image Upload (Using Dragger now)
   */
  const handleUpload = async (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      message.error('Định dạng không hỗ trợ (Chỉ JPG, PNG, WEBP)');
      return Upload.LIST_IGNORE;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Ảnh phải nhỏ hơn 5MB');
      return Upload.LIST_IGNORE;
    }

    try {
      setUploading(true);
      const res = await uploadImage(file);
      
      const url = res.secure_url || res.url;
      setImageUrl(url);
      form.setFieldsValue({ thumbnail: url });
      message.success("Upload ảnh thành công");
    } catch (error) {
      console.error("Upload Error:", error);
      message.error("Lỗi upload ảnh, vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
    return false; 
  };

  /**
   * Action: Create or Update Course
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Payload: Mặc định giá = 0 để backend không lỗi (nếu backend yêu cầu trường này)
      const payload = { ...values, price: 0 };

      if (isEditing && editingId) {
        await CourseApi.updateCourse(editingId, payload);
        message.success("Cập nhật khóa học thành công");
      } else {
        await CourseApi.createCourse(payload);
        message.success("Tạo khóa học mới thành công");
      }

      handleModalClose();
      fetchCourses(pagination.current, pagination.pageSize);
    } catch (error) {
        // Form validate failed
    }
  };

  const handleDelete = async (id) => {
    try {
      await CourseApi.deleteCourse(id);
      message.success("Đã xóa khóa học");
      if (courses.length === 1 && pagination.current > 1) {
          fetchCourses(pagination.current - 1, pagination.pageSize);
      } else {
          fetchCourses(pagination.current, pagination.pageSize);
      }
    } catch (error) {
      message.error("Xóa thất bại.");
    }
  };

  // --- Modal Helpers ---
  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setImageUrl(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEditModal = (record) => {
    const data = record.raw;
    setIsEditing(true);
    setEditingId(data.id);
    setImageUrl(data.thumbnail);
    
    // Đã bỏ field 'price' ở đây
    form.setFieldsValue({
      title: data.title,
      description: data.description,
      thumbnail: data.thumbnail,
      level: data.level || "Beginner",
    });
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingId(null);
    setImageUrl(null);
    form.resetFields();
  };

  // --- Helper: Level Color ---
  const getLevelColor = (level) => {
    switch(level) {
      case 'Advanced': return 'red';
      case 'Intermediate': return 'gold';
      default: return 'green';
    }
  };

  // --- Table Configuration ---
  const columns = [
    {
      title: "Thông tin khóa học",
      dataIndex: "name",
      key: "name",
      width: 400,
      render: (text, record) => (
        <div style={{ display: 'flex', gap: 16 }}>
          {/* Thumbnail đẹp hơn */}
          <div style={{ 
            width: 80, height: 50, borderRadius: 6, overflow: 'hidden', 
            background: '#f0f0f0', flexShrink: 0,
            border: '1px solid #eee'
          }}>
            {record.thumbnail ? (
              <img src={record.thumbnail} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <VideoCameraOutlined style={{ color: '#ccc', fontSize: 20 }} />
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Text strong style={{ fontSize: 15, marginBottom: 4 }}>{text}</Text>
            <Space size={4}>
               <Tag color={getLevelColor(record.level)} style={{ margin: 0, fontSize: 10, lineHeight: '18px' }}>
                  {record.level}
               </Tag>
               <Tag color={record.status === "Đang mở" ? "success" : "default"} style={{ margin: 0, fontSize: 10, lineHeight: '18px' }}>
                  {record.status}
               </Tag>
            </Space>
          </div>
        </div>
      )
    },
    {
      title: "Bài học",
      dataIndex: "sessionCount",
      key: "sessionCount",
      align: "center",
      render: (count) => (
        <div style={{ textAlign: 'center' }}>
          <Text strong style={{ fontSize: 16 }}>{count}</Text>
          <div style={{ fontSize: 12, color: '#888' }}>Sessions</div>
        </div>
      )
    },
    {
      title: "Nội dung",
      key: "manage",
      align: "center",
      render: (_, record) => (
        <Button 
          type="primary" 
          ghost
          shape="round"
          size="small"
          onClick={() => navigate(`/admin/courses/${record.id}/manage`)}
        >
          Quản lý Video & Bài tập
        </Button>
      ),
    },
    {
      title: "",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa thông tin">
            <Button type="text" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          </Tooltip>
          <Popconfirm 
            title="Xóa khóa học?" 
            description="Hành động này sẽ xóa toàn bộ bài học bên trong."
            okText="Xóa ngay" 
            okType="danger" 
            cancelText="Hủy"
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="Xóa khóa học">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f5f7fa', minHeight: '100vh' }}>
      
      {/* Header Section */}
      <div style={{ marginBottom: 24 }}>
         <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col>
              <Title level={2} style={{ margin: 0 }}>Quản lý khóa học</Title>
              <Text type="secondary">Danh sách và quản lý nội dung đào tạo</Text>
            </Col>
            <Col>
               <Button type="primary" size="large" icon={<PlusOutlined />} onClick={openCreateModal}>
                  Tạo khóa học mới
               </Button>
            </Col>
         </Row>
      </div>

      {/* Filter & Table Card */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        
        {/* Search Bar */}
        <Row style={{ marginBottom: 20 }} justify="space-between">
           <Col span={12}>
              <Input 
                placeholder="Tìm kiếm theo tên khóa học..." 
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} 
                size="large"
                allowClear
                onChange={(e) => setSearchText(e.target.value)} // Note: Tốt nhất nên dùng debounce ở đây
                onPressEnter={() => fetchCourses(1, pagination.pageSize, searchText)}
              />
           </Col>
           <Col>
              <Button icon={<ReloadOutlined />} onClick={() => fetchCourses(pagination.current, pagination.pageSize)}>
                Làm mới
              </Button>
           </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={courses}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} khóa học`
          }}
          onChange={(pager) => fetchCourses(pager.current, pager.pageSize, searchText)}
        />
      </Card>

      {/* Modal Form */}
      <Modal
        title={isEditing ? "Cập nhật thông tin" : "Tạo khóa học mới"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleModalClose}
        okText={isEditing ? "Lưu thay đổi" : "Hoàn tất"}
        cancelText="Hủy bỏ"
        destroyOnClose
        width={700}
        centered
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          
          <Row gutter={24}>
             {/* Cột trái: Thông tin Text */}
             <Col span={14}>
                <Form.Item label="Tên khóa học" name="title" rules={[{ required: true, message: "Vui lòng nhập tên!" }]}>
                  <Input size="large" placeholder="VD: ReactJS từ cơ bản đến nâng cao" />
                </Form.Item>

                <Form.Item label="Mô tả ngắn" name="description" rules={[{ required: true, message: "Nhập mô tả!" }]}>
                  <Input.TextArea rows={5} placeholder="Giới thiệu nội dung khóa học..." showCount maxLength={300} />
                </Form.Item>

                <Form.Item label="Trình độ" name="level" initialValue="Beginner">
                  <Select size="large">
                    <Option value="Beginner">Cơ bản (Beginner)</Option>
                    <Option value="Intermediate">Trung cấp (Intermediate)</Option>
                    <Option value="Advanced">Nâng cao (Advanced)</Option>
                  </Select>
                </Form.Item>
             </Col>

             {/* Cột phải: Upload Ảnh */}
             <Col span={10}>
                <Form.Item label="Ảnh bìa (Thumbnail)" name="thumbnail" rules={[{ required: true, message: "Bắt buộc có ảnh" }]}>
                  <div style={{ width: '100%' }}>
                     <Dragger 
                        name="file"
                        multiple={false}
                        showUploadList={false}
                        beforeUpload={handleUpload}
                        accept="image/*"
                        style={{ background: '#fafafa', border: '1px dashed #d9d9d9' }}
                     >
                        {imageUrl ? (
                           <div style={{ position: 'relative', height: 160, width: '100%' }}>
                              <img 
                                src={imageUrl} 
                                alt="preview" 
                                style={{ 
                                   width: '100%', height: '100%', objectFit: 'cover', 
                                   borderRadius: 8 
                                }} 
                              />
                              <div style={{ 
                                 position: 'absolute', bottom: 0, left: 0, right: 0, 
                                 background: 'rgba(0,0,0,0.5)', color: '#fff', padding: 4, fontSize: 12
                              }}>
                                 Bấm để thay đổi
                              </div>
                           </div>
                        ) : (
                           <div style={{ padding: '20px 0' }}>
                              <p className="ant-upload-drag-icon">
                                 <InboxOutlined style={{ color: '#1890ff' }} />
                              </p>
                              <p className="ant-upload-text" style={{ fontSize: 14 }}>Kéo ảnh vào đây</p>
                              <p className="ant-upload-hint" style={{ fontSize: 12, color: '#999' }}>
                                 Hỗ trợ JPG, PNG (Max 5MB)
                              </p>
                           </div>
                        )}
                     </Dragger>
                     {/* Ẩn input thật để Form nhận value */}
                     <Input style={{ display: 'none' }} />
                  </div>
                </Form.Item>
             </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}