import { useCallback, useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Upload, // Thêm Upload
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LoadingOutlined, // Thêm icon loading
} from "@ant-design/icons";

import { PostApi } from "@/services/api/postApi";
import { UploadApi } from "@/services/api/uploadApi"; // Import API Upload
import CkEditorField from "@/components/form/CkEditorField";

const { Option } = Select;
const { TextArea } = Input;

export default function PostManagement() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // State cho Upload ảnh
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [search, setSearch] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const slugify = (str) =>
    (str || "")
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const fetchPosts = useCallback(
    async (page = 1, pageSize = 10, searchValue = "") => {
      try {
        setLoading(true);
        const { posts: list, meta } = await PostApi.getPosts({
          page,
          limit: pageSize,
          search: searchValue,
        });

        const mapped = (list || []).map((p) => ({
          id: p.id,
          key: p.id,
          title: p.title,
          slug: p.slug,
          category: p.category,
          status: p.status,
          featured: p.featured,
          views: p.views,
          readMins: p.readMins,
          publishedAt: p.publishedAt,
          coverUrl: p.coverUrl, // Cần lấy coverUrl để hiển thị
          raw: p,
        }));

        setPosts(mapped);
        setPagination({
          current: meta?.page || page,
          pageSize: meta?.limit || pageSize,
          total: meta?.total || list.length,
        });
      } catch (error) {
        console.error("❌ Lỗi load posts:", error);
        message.error("Không tải được danh sách bài viết");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPosts(1, pagination.pageSize, "");
  }, [fetchPosts, pagination.pageSize]);

  const handleTableChange = (paginationConfig) => {
    const { current, pageSize } = paginationConfig;
    fetchPosts(current, pageSize, search);
  };

  // ===== XỬ LÝ UPLOAD ẢNH =====
  const handleUploadImage = async ({ file, onSuccess, onError }) => {
    try {
      setUploading(true);
      // Gọi API upload (giả sử trả về { secure_url: "..." })
      const res = await UploadApi.uploadImage(file);
      
      const url = res.secure_url || res.url; // Lấy URL từ response
      
      // Cập nhật giá trị vào Form (ẩn)
      form.setFieldsValue({ coverUrl: url });
      
      message.success("Upload ảnh bìa thành công");
      onSuccess(res, file);
    } catch (err) {
      console.error(err);
      message.error("Upload thất bại");
      onError(err);
    } finally {
      setUploading(false);
    }
  };

  const handleChangeUpload = ({ fileList: newFileList }) => {
    // Cập nhật state fileList để hiển thị thumbnail
    // Nếu upload xong, gán url từ response vào file để Antd hiển thị preview
    const updatedList = newFileList.map(file => {
      if (file.response) {
        file.url = file.response.secure_url || file.response.url;
      }
      return file;
    });
    
    setFileList(updatedList);

    // Nếu người dùng xóa hết ảnh -> reset form value
    if (newFileList.length === 0) {
      form.setFieldsValue({ coverUrl: "" });
    }
  };

  const uploadButton = (
    <div>
      {uploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  // ==============================

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFileList([]); // Reset ảnh
    setModalVisible(true);
    setTimeout(() => {
      form.setFieldsValue({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        category: "general",
        status: "draft",
        coverUrl: "",
        tags: [],
        author: "Admin",
        featured: false,
        views: 0,
        readMins: 5,
        seoTitle: "",
        seoDesc: "",
        publishedAt: new Date().toISOString(),
      });
    }, 0);
  };

  const openEditModal = (record) => {
    const p = record.raw;
    setIsEditing(true);
    setEditingId(p.id);
    
    // Setup ảnh preview nếu có
    if (p.coverUrl) {
      setFileList([
        {
          uid: "-1",
          name: "cover-image",
          status: "done",
          url: p.coverUrl,
        },
      ]);
    } else {
      setFileList([]);
    }

    setModalVisible(true);
    setTimeout(() => {
      form.setFieldsValue({
        title: p.title,
        slug: p.slug,
        content: p.content,
        excerpt: p.excerpt,
        category: p.category,
        status: p.status,
        coverUrl: p.coverUrl,
        tags: p.tags || [],
        author: p.author,
        featured: p.featured,
        views: p.views,
        readMins: p.readMins,
        seoTitle: p.seoTitle,
        seoDesc: p.seoDesc,
        publishedAt: p.publishedAt,
      });
    }, 0);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const slug = values.slug?.trim() ? values.slug.trim() : slugify(values.title);

      const body = {
        ...values,
        slug,
        tags: values.tags || [],
        author: values.author || "Admin",
        featured: !!values.featured,
        views: values.views ?? 0,
        readMins: values.readMins ?? 0,
        publishedAt: values.publishedAt || new Date().toISOString(),
      };

      if (isEditing && editingId != null) {
        await PostApi.updatePost(editingId, body);
        message.success("Cập nhật bài viết thành công");
      } else {
        await PostApi.createPost(body);
        message.success("Tạo bài viết thành công");
      }

      setModalVisible(false);
      setEditingId(null);
      form.resetFields();
      setFileList([]); // Reset ảnh sau khi lưu
      fetchPosts(pagination.current, pagination.pageSize, search);
    } catch (error) {
      if (error?.errorFields) return;
      console.error("❌ Lỗi lưu bài viết:", error);
      message.error("Lưu bài viết thất bại");
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xoá bài viết",
      content: "Bạn có chắc muốn xoá bài viết này?",
      okText: "Xoá",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await PostApi.deletePost(id);
          message.success("Xoá bài viết thành công");
          fetchPosts(pagination.current, pagination.pageSize, search);
        } catch (error) {
          message.error("Xoá bài viết thất bại");
        }
      },
    });
  };

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "coverUrl",
      key: "coverUrl",
      width: 80,
      render: (url) => (
        url ? <img src={url} alt="cover" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} /> : null
      )
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{text}</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{record.slug}</div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "published" ? "green" : "orange"}>
          {status === "published" ? "Published" : "Draft"}
        </Tag>
      ),
    },
    {
      title: "Ngày đăng",
      dataIndex: "publishedAt",
      key: "publishedAt",
      render: (value) =>
        value ? new Date(value).toLocaleString("vi-VN") : "—",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            Sửa
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Xoá
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Quản lý bài viết</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreateModal}
        >
          Thêm bài viết
        </Button>
      </div>

      <div style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={posts}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
          }}
          onChange={handleTableChange}
        />
      </div>

      <Modal
        title={isEditing ? "Cập nhật bài viết" : "Thêm bài viết mới"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={900}
        style={{ top: 20 }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[{ required: true, message: "Nhập tiêu đề" }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item label="Mô tả ngắn" name="excerpt">
            <TextArea rows={2} />
          </Form.Item>

          <Form.Item
            label="Nội dung"
            name="content"
            rules={[{ required: true, message: "Nhập nội dung" }]}
          >
            <CkEditorField
              value={form.getFieldValue("content")}
              onChange={(data) => form.setFieldsValue({ content: data })}
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
             <Form.Item label="Trạng thái" name="status" style={{ flex: 1 }}>
                <Select>
                  <Option value="draft">Draft</Option>
                  <Option value="published">Published</Option>
                </Select>
             </Form.Item>
             <Form.Item label="Danh mục" name="category" style={{ flex: 1 }}>
                <Input />
             </Form.Item>
          </div>
          
          {/* THAY THẾ INPUT URL BẰNG UPLOAD */}
          <Form.Item label="Ảnh Bìa (Cover)" style={{ marginBottom: 0 }}>
             {/* Input ẩn để giữ giá trị URL khi submit form */}
             <Form.Item name="coverUrl" noStyle>
               <Input type="hidden" />
             </Form.Item>
             
             <Upload
               listType="picture-card"
               fileList={fileList}
               customRequest={handleUploadImage}
               onChange={handleChangeUpload}
               maxCount={1} // Chỉ cho phép 1 ảnh bìa
               onPreview={(file) => {
                  const src = file.url || file.thumbUrl;
                  if (src) {
                    const imgWindow = window.open(src);
                    imgWindow?.document.write(`<img src="${src}" style="max-width: 100%;"/>`);
                  }
               }}
             >
               {fileList.length >= 1 ? null : uploadButton}
             </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}