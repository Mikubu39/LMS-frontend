// src/components/admin/UserManagerTable.jsx
import { useEffect, useState, useCallback } from "react";
import { 
  Table, Button, Input, Modal, Form, Select, 
  Tag, message, Popconfirm, Avatar, Upload, Tooltip, Row, Col 
} from "antd";
import { 
  PlusOutlined, SearchOutlined, EditOutlined, 
  DeleteOutlined, UserOutlined, ManOutlined, WomanOutlined,
  UploadOutlined, DownloadOutlined, FileExcelOutlined
} from "@ant-design/icons";
import * as XLSX from "xlsx"; 
import { UserApi } from "@/services/api/userApi"; 

export default function UserManagerTable({ role, title }) {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  
  // State phân trang chuẩn Server-Side
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // State tìm kiếm
  const [searchText, setSearchText] = useState("");

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  // --- HÀM GỌI API (CORE) ---
  const fetchUsers = useCallback(async (page = 1, pageSize = 10, search = "") => {
    setLoading(true);
    try {
      // Gọi API truyền đủ tham số: page, limit, search, role
      const res = await UserApi.getAll({ 
        role: role, 
        page: page, 
        limit: pageSize,
        search: search 
      });

      // Xử lý dữ liệu trả về từ NestJS (Dựa trên cấu trúc PaginatedStudentsResponseDto)
      const userList = res.data || []; 
      const totalItems = res.meta?.total || res.total || 0; // Fallback an toàn

      setUsers(userList);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: totalItems,
      });

    } catch (error) {
      console.error("Fetch error:", error);
      message.error("Lỗi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, [role]);

  // Gọi lần đầu khi component mount hoặc khi role thay đổi
  useEffect(() => { 
    // Reset về trang 1 khi đổi tab (GV <-> HS)
    setSearchText(""); 
    fetchUsers(1, 10, ""); 
  }, [fetchUsers]);

  // --- SỰ KIỆN TABLE ---
  
  // Xử lý khi người dùng bấm trang số 2, 3... hoặc đổi số dòng (10 -> 20)
  const handleTableChange = (newPagination) => {
    fetchUsers(
      newPagination.current, 
      newPagination.pageSize, 
      searchText
    );
  };

  // Xử lý tìm kiếm (Chỉ tìm khi bấm Enter hoặc nút Tìm để tối ưu API)
  const handleSearch = () => {
    fetchUsers(1, pagination.pageSize, searchText);
  };

  // --- EXCEL HANDLERS ---
  const handleDownloadTemplate = () => {
    const rows = [
      { 
        full_name: "Nguyen Van A", 
        email: "nguyenvana@example.com", 
        password: "123", 
        phone: "0987654321",
        gender: "Nam",
        address: "Ha Noi"
      }
    ];
    if(role === 'student') rows[0]["student_code"] = "SV2025001";

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, `mau_import_${role}.xlsx`);
  };

  const handleImportExcel = async (file) => {
    setImporting(true);
    try {
      const res = await UserApi.uploadExcel(file, role);
      
      if (res.failed_count === 0) {
          message.success(`Thành công! Đã thêm ${res.success_count} ${title}.`);
      } else {
          message.warning(`Đã thêm ${res.success_count}. Lỗi ${res.failed_count} dòng.`);
          if (res.errors?.length > 0) {
            Modal.error({
              title: "Chi tiết lỗi Import",
              width: 600,
              content: (
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {res.errors.map((err, idx) => (
                    <div key={idx} style={{ marginBottom: 5, borderBottom: '1px solid #eee', paddingBottom: 5 }}>
                      <Tag color="red">Dòng {err.row}</Tag> <b>{err.email}</b>: {err.error}
                    </div>
                  ))}
                </div>
              )
            });
          }
      }
      // Refresh lại trang hiện tại sau khi import
      fetchUsers(pagination.current, pagination.pageSize, searchText);
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi khi upload file";
      message.error(msg);
    } finally {
      setImporting(false);
    }
    return false; 
  };

  // --- CRUD HANDLERS ---
  const handleDelete = async (id) => {
    try {
      await UserApi.delete(id);
      message.success("Đã xóa thành công");
      
      // Logic fix lỗi "Trang trắng": Nếu xóa hết item ở trang cuối thì lùi 1 trang
      if (users.length === 1 && pagination.current > 1) {
          fetchUsers(pagination.current - 1, pagination.pageSize, searchText);
      } else {
          fetchUsers(pagination.current, pagination.pageSize, searchText);
      }
    } catch (err) { message.error("Lỗi khi xóa"); }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await UserApi.update(editingUser.user_id, values);
        message.success("Cập nhật thành công");
      } else {
        await UserApi.create({ ...values, role: role });
        message.success("Tạo mới thành công");
      }
      setIsModalOpen(false);
      
      // Reload lại data (nếu tạo mới thì về trang 1, sửa thì giữ nguyên trang)
      if (editingUser) {
          fetchUsers(pagination.current, pagination.pageSize, searchText);
      } else {
          setSearchText(""); // Clear search khi tạo mới để thấy item vừa tạo
          fetchUsers(1, pagination.pageSize, "");
      }
    } catch (err) {
      if (!err.errorFields) message.error("Có lỗi xảy ra: " + (err.message || "Unknown"));
    }
  };

  const openModal = (user = null) => {
    setEditingUser(user);
    form.resetFields();
    if (user) {
      form.setFieldsValue(user);
    }
    setIsModalOpen(true);
  };

  // --- COLUMNS ---
  const columns = [
    {
      title: "Họ và tên",
      dataIndex: "full_name",
      key: "full_name", // Thêm key để React tối ưu
      render: (text, r) => (
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Avatar src={r.avatar} icon={<UserOutlined />} style={{backgroundColor: '#87d068'}} />
          <div>
            <div style={{ fontWeight: 600 }}>{text}</div>
            {role === 'student' && r.student_code && <Tag color="geekblue" style={{fontSize: 10, marginTop: 2}}>{r.student_code}</Tag>}
          </div>
        </div>
      ),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "SĐT", dataIndex: "phone", key: "phone", render: t => t || <span style={{color:'#ccc'}}>--</span> },
    { 
        title: "Giới tính", 
        dataIndex: "gender",
        key: "gender",
        align: 'center',
        width: 100,
        render: (g) => {
            if(g === 'Nam') return <Tag color="cyan" icon={<ManOutlined />}>Nam</Tag>;
            if(g === 'Nữ') return <Tag color="magenta" icon={<WomanOutlined />}>Nữ</Tag>;
            return <Tag>{g || '--'}</Tag>;
        }
    },
    {
      title: "Thao tác",
      key: "action",
      align: "right",
      render: (_, r) => (
        <div style={{display:'flex', justifyContent:'flex-end', gap: 8}}>
          <Button icon={<EditOutlined />} size="small" onClick={() => openModal(r)} />
          <Popconfirm title="Xóa người dùng này?" onConfirm={() => handleDelete(r.user_id)}>
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
      {/* HEADER & TOOLBAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
            <h2 style={{ margin: "0 0 4px 0" }}>{title}</h2>
            <div style={{color:'#666'}}>Tổng số: <b>{pagination.total}</b> bản ghi</div>
        </div>
        
        <div style={{display: 'flex', gap: 10, flexWrap: 'wrap'}}>
            <Tooltip title="Tải file mẫu Excel">
                <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>Mẫu</Button>
            </Tooltip>
            
            <Upload beforeUpload={handleImportExcel} showUploadList={false} accept=".xlsx, .xls">
                <Button icon={<FileExcelOutlined />} loading={importing}>
                   {importing ? "Đang xử lý..." : "Import Excel"}
                </Button>
            </Upload>

            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>
              Thêm mới
            </Button>
        </div>
      </div>

      {/* SEARCH BAR & TABLE */}
      <div style={{ background: "white", padding: 24, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <Input
              placeholder={`Tìm theo tên, email${role==='student' ? ', SDT': ''}...`}
              prefix={<SearchOutlined style={{color: '#bfbfbf'}} />}
              style={{ width: '100%', maxWidth: 350 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch} // Bấm Enter mới tìm
              allowClear
            />
            <Button type="primary" onClick={handleSearch}>Tìm kiếm</Button>
            <Button onClick={() => { setSearchText(""); fetchUsers(1, 10, ""); }}>Reset</Button>
        </div>

        <Table 
            columns={columns} 
            dataSource={users} 
            rowKey="user_id" 
            loading={loading} 
            // Cấu hình Pagination chuẩn Antd
            pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true, // Cho phép user chọn 10, 20, 50 dòng
                pageSizeOptions: ['10', '20', '50', '100'],
                showTotal: (total) => `Tổng ${total} người`,
            }}
            onChange={handleTableChange} // Sự kiện quan trọng nhất để kích hoạt API
            scroll={{ x: 800 }} // Responsive cho mobile
        />
      </div>

      {/* MODAL FORM */}
      <Modal
        title={editingUser ? "Cập nhật thông tin" : `Thêm ${title} mới`}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        width={600}
        destroyOnClose // Reset form khi đóng modal
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Row gutter={16}>
             <Col span={24}>
                <Form.Item name="full_name" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                    <Input placeholder="Ví dụ: Nguyễn Văn A" />
                </Form.Item>
             </Col>
          </Row>

          <Row gutter={16}>
             <Col span={12}>
                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
                    <Input placeholder="example@email.com" disabled={!!editingUser} />
                </Form.Item>
             </Col>
             <Col span={12}>
                 {!editingUser ? (
                    <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6, message: 'Tối thiểu 6 ký tự' }]}>
                        <Input.Password placeholder="Nhập mật khẩu..." />
                    </Form.Item>
                 ) : (
                    <Form.Item label="Mật khẩu">
                        <Input disabled placeholder="Mật khẩu bị ẩn" />
                    </Form.Item>
                 )}
             </Col>
          </Row>

          {role === 'student' && (
             <Form.Item name="studentCode" label="Mã sinh viên" tooltip="Để trống hệ thống sẽ tự sinh mã">
                <Input placeholder="VD: SV2025001" disabled={!!editingUser} />
             </Form.Item>
          )}

          <Row gutter={16}>
             <Col span={12}>
                <Form.Item name="phone" label="Số điện thoại">
                   <Input placeholder="09xxxxxxxx" />
                </Form.Item>
             </Col>
             <Col span={12}>
                <Form.Item name="gender" label="Giới tính">
                   <Select placeholder="Chọn giới tính">
                     <Select.Option value="Nam">Nam</Select.Option>
                     <Select.Option value="Nữ">Nữ</Select.Option>
                     <Select.Option value="Khác">Khác</Select.Option>
                   </Select>
                </Form.Item>
             </Col>
          </Row>
          
          <Form.Item name="address" label="Địa chỉ">
             <Input.TextArea rows={2} placeholder="Nhập địa chỉ..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}