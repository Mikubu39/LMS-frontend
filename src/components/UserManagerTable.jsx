// src/components/admin/UserManagerTable.jsx
import { useEffect, useState } from "react";
import { 
  Table, Button, Input, Modal, Form, Select, 
  Tag, message, Popconfirm, Avatar, Upload, Tooltip 
} from "antd";
import { 
  PlusOutlined, SearchOutlined, EditOutlined, 
  DeleteOutlined, UserOutlined, ManOutlined, WomanOutlined,
  UploadOutlined, DownloadOutlined, FileExcelOutlined
} from "@ant-design/icons";
import moment from "moment";
import * as XLSX from "xlsx"; // 👈 Cần cài: npm install xlsx
import { UserApi } from "@/services/api/userApi"; 

export default function UserManagerTable({ role, title }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false); // State loading khi import
  const [searchText, setSearchText] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  // --- FETCH DATA ---
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Gọi API lấy list user theo role
      const res = await UserApi.getAll({ role: role, limit: 100 });
      setUsers(res || []);
    } catch (error) {
      message.error("Lỗi tải danh sách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [role]);

  // --- EXCEL HANDLERS ---

  // 1. Tải file mẫu (Template)
  const handleDownloadTemplate = () => {
    // Header phải là tiếng Anh để khớp với DTO backend: email, full_name, ...
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
    
    // Nếu là student thì thêm cột student_code vào mẫu
    if(role === 'student') {
        rows[0]["student_code"] = "SV2025001";
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    
    // Xuất file
    XLSX.writeFile(workbook, `mau_import_${role}.xlsx`);
  };

  // 2. Upload file lên Server
  const handleImportExcel = async (file) => {
    setImporting(true);
    try {
      // Gọi API upload (Server sẽ xử lý đọc file)
      const res = await UserApi.uploadExcel(file, role);

      // Backend trả về: { success_count, failed_count, errors: [] }
      if (res.failed_count === 0) {
          message.success(`Thành công! Đã thêm ${res.success_count} ${title}.`);
      } else {
          message.warning(`Đã thêm ${res.success_count}. Lỗi ${res.failed_count} dòng.`);
          console.log("Chi tiết lỗi import:", res.errors);
          if (res.errors.length > 0) {
            Modal.error({
              title: "Chi tiết lỗi Import",
              content: (
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {res.errors.map((err, idx) => (
                    <div key={idx} style={{ marginBottom: 5 }}>
                      <b>Dòng {err.row} ({err.email}):</b> {err.error}
                    </div>
                  ))}
                </div>
              )
            });
          }
      }
      
      fetchUsers(); // Refresh lại bảng dữ liệu
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Lỗi khi upload file";
      message.error(msg);
    } finally {
      setImporting(false);
    }
    return false; // Prevent antd default upload behavior
  };

  // --- CRUD HANDLERS ---
  const handleDelete = async (id) => {
    try {
      await UserApi.delete(id);
      message.success("Đã xóa thành công");
      fetchUsers();
    } catch (err) { message.error("Lỗi khi xóa"); }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      // Format date
      if(values.dateOfBirth) values.dateOfBirth = values.dateOfBirth.format("YYYY-MM-DD");
      
      if (editingUser) {
        await UserApi.update(editingUser.user_id, values);
        message.success("Cập nhật thành công");
      } else {
        await UserApi.create({ ...values, role: role });
        message.success("Tạo mới thành công");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error("❌ Lỗi handleSave:", err);
      if (err.errorFields) return;
      message.error("Có lỗi xảy ra: " + (err.message || "Unknown error"));
    }
  };

  const openModal = (user = null) => {
    setEditingUser(user);
    form.resetFields();
    if (user) {
      form.setFieldsValue({
        ...user,
        dateOfBirth: user.dateOfBirth ? moment(user.dateOfBirth) : null
      });
    }
    setIsModalOpen(true);
  };

  // --- COLUMNS ---
  const columns = [
    {
      title: "Họ và tên",
      dataIndex: "full_name",
      render: (text, r) => (
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Avatar src={r.avatar} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 600 }}>{text}</div>
            {role === 'student' && r.student_code && <Tag color="blue" style={{fontSize: 10}}>{r.student_code}</Tag>}
          </div>
        </div>
      ),
    },
    { title: "Email", dataIndex: "email" },
    { title: "SĐT", dataIndex: "phone", render: t => t || '--' },
    { 
        title: "Giới tính", 
        dataIndex: "gender",
        width: 100,
        align: 'center',
        render: (g) => {
            if(g === 'Nam') return <Tag color="cyan" icon={<ManOutlined />}>Nam</Tag>;
            if(g === 'Nữ') return <Tag color="magenta" icon={<WomanOutlined />}>Nữ</Tag>;
            return <Tag>{g || '--'}</Tag>;
        }
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      align: "center",
      render: (active) => (
        <Tag color={active ? "green" : "red"}>{active ? "Hoạt động" : "Đã khóa"}</Tag>
      ),
    },
    {
      title: "Thao tác",
      align: "right",
      render: (_, r) => (
        <div style={{display:'flex', justifyContent:'flex-end', gap: 8}}>
          <Button icon={<EditOutlined />} size="small" onClick={() => openModal(r)} />
          <Popconfirm title="Xóa user này?" onConfirm={() => handleDelete(r.user_id)}>
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </div>
      ),
    },
  ];

  // Filter Client-side đơn giản
  const filteredData = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchText.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchText.toLowerCase()) ||
    (role === 'student' && u.student_code?.toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
            <h2 style={{ margin: 0 }}>{title}</h2>
            <div style={{color:'#666'}}>Quản lý danh sách {title.toLowerCase()} trong hệ thống</div>
        </div>
        
        {/* 👇 KHU VỰC BUTTONS MỚI */}
        <div style={{display: 'flex', gap: 10}}>
            <Tooltip title="Tải file mẫu để nhập liệu">
                <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
                    Mẫu Excel
                </Button>
            </Tooltip>
            
            <Upload 
                beforeUpload={handleImportExcel} 
                showUploadList={false} 
                accept=".xlsx, .xls"
            >
                <Button icon={<FileExcelOutlined />} loading={importing}>
                   {importing ? "Đang xử lý..." : "Import Excel"}
                </Button>
            </Upload>

            <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => openModal(null)}>
              Thêm mới
            </Button>
        </div>
      </div>

      <div style={{ background: "white", padding: 24, borderRadius: 8 }}>
        <Input
          placeholder={`Tìm kiếm theo tên, email${role==='student' ? ', mã SV': ''}...`}
          prefix={<SearchOutlined />}
          style={{ width: 300, marginBottom: 16 }}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Table 
            columns={columns} 
            dataSource={filteredData} 
            rowKey="user_id" 
            loading={loading} 
            pagination={{pageSize: 8}}
        />
      </div>

      {/* MODAL FORM */}
      <Modal
        title={editingUser ? "Cập nhật thông tin" : `Thêm ${title}`}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="full_name" label="Họ và tên" rules={[{ required: true }]}>
            <Input placeholder="Nhập họ tên..." />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="example@email.com" disabled={!!editingUser} />
          </Form.Item>
          
          {/* Nếu tạo mới thì cần mật khẩu */}
          {!editingUser && (
             <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6 }]}>
               <Input.Password placeholder="Nhập mật khẩu..." />
             </Form.Item>
          )}

          {/* Chỉ hiển thị studentCode nếu là student */}
          {role === 'student' && (
             <Form.Item name="studentCode" label="Mã sinh viên (Tự động sinh nếu để trống)">
                <Input placeholder="VD: SV2025..." disabled={!!editingUser} />
             </Form.Item>
          )}

          <div style={{display:'flex', gap: 16}}>
             <Form.Item name="phone" label="Số điện thoại" style={{flex:1}}>
               <Input />
             </Form.Item>
             <Form.Item name="gender" label="Giới tính" style={{width: 120}}>
               <Select>
                 <Select.Option value="Nam">Nam</Select.Option>
                 <Select.Option value="Nữ">Nữ</Select.Option>
               </Select>
             </Form.Item>
          </div>
          
          <Form.Item name="address" label="Địa chỉ">
             <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}