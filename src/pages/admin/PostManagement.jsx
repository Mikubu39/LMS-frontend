// src/pages/admin/PostManagement.jsx
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
  Switch,
  InputNumber,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import { PostApi } from "@/services/api/postApi";
import CkEditorField from "@/components/form/CkEditorField";

const { Option } = Select;
const { TextArea } = Input;

export default function PostManagement() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // ------- SLUGIFY đơn giản từ title -------
  const slugify = (str) =>
    (str || "")
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // bỏ dấu tiếng Việt
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  // ===== LOAD POSTS =====
  const fetchPosts = useCallback(
    async (page = 1, pageSize = 10, searchValue = "") => {
      try {
        setLoading(true);

        // 👇 Nhận { posts, meta } từ PostApi
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

  // ===== THAY ĐỔI PAGE / PAGE SIZE =====
  const handleTableChange = (paginationConfig) => {
    const { current, pageSize } = paginationConfig;
    fetchPosts(current, pageSize, search);
  };

  // ===== MỞ MODAL TẠO =====
  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
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
        // chuẩn ISO giống swagger mẫu
        publishedAt: new Date().toISOString(),
      });
    }, 0);
  };

  // ===== MỞ MODAL SỬA =====
  const openEditModal = (record) => {
    const p = record.raw;
    setIsEditing(true);
    setEditingId(p.id);
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

  // ===== SUBMIT FORM (TẠO / SỬA) =====
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const slug =
        values.slug && values.slug.trim()
          ? values.slug.trim()
          : slugify(values.title);

      const body = {
        title: values.title,
        slug,
        content: values.content,
        excerpt: values.excerpt,
        category: values.category,
        status: values.status,
        coverUrl: values.coverUrl,
        tags: values.tags || [],
        author: values.author || "Admin",
        featured: !!values.featured,
        views: values.views ?? 0,
        readMins: values.readMins ?? 0,
        seoTitle: values.seoTitle,
        seoDesc: values.seoDesc,
        publishedAt: values.publishedAt || new Date().toISOString(),
      };

      console.log("[Post] body gửi lên:", body);

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
      fetchPosts(pagination.current, pagination.pageSize, search);
    } catch (error) {
      // error của Form.validateFields
      if (error?.errorFields) return;

      console.error("❌ Lỗi lưu bài viết:", error?.response?.data || error);
      const backendMsg = error?.response?.data?.message;
      const msg = Array.isArray(backendMsg)
        ? backendMsg.join(", ")
        : backendMsg || error?.message || "Lưu bài viết thất bại";
      message.error(msg);
    }
  };

  // ===== XOÁ POST =====
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xoá bài viết",
      content: "Bạn có chắc muốn xoá bài viết này?",
      okText: "Xoá",
      okType: "danger",
      cancelText: "Hủy",
      async onOk() {
        try {
          await PostApi.deletePost(id);
          message.success("Xoá bài viết thành công");
          fetchPosts(pagination.current, pagination.pageSize, search);
        } catch (error) {
          console.error("❌ Lỗi xoá bài viết:", error);
          const backendMsg = error?.response?.data?.message;
          const msg = Array.isArray(backendMsg)
            ? backendMsg.join(", ")
            : backendMsg || "Xoá bài viết thất bại";
          message.error(msg);
        }
      },
    });
  };

  // ===== CỘT TABLE =====
  const columns = [
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
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (cat) => <Tag>{cat || "—"}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const isPublished = status === "published";
        return (
          <Tag color={isPublished ? "green" : "orange"}>
            {isPublished ? "Published" : status || "Draft"}
          </Tag>
        );
      },
    },
    {
      title: "Nổi bật",
      dataIndex: "featured",
      key: "featured",
      render: (featured) =>
        featured ? <Tag color="gold">Featured</Tag> : "—",
    },
    {
      title: "Views",
      dataIndex: "views",
      key: "views",
      width: 90,
    },
    {
      title: "Đọc (phút)",
      dataIndex: "readMins",
      key: "readMins",
      width: 110,
    },
    {
      title: "Ngày đăng",
      dataIndex: "publishedAt",
      key: "publishedAt",
      render: (value) =>
        value ? new Date(value).toLocaleString("vi-VN") : "—",
      width: 170,
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
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
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <h2 style={{ marginBottom: 0 }}>Quản lý bài viết</h2>

          <Space.Compact style={{ width: 320 }}>
            <Input
              allowClear
              placeholder="Tìm theo tiêu đề..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={(e) => {
                const value = e.target.value;
                setSearch(value);
                fetchPosts(1, pagination.pageSize, value);
              }}
            />
            <Button
              type="primary"
              onClick={() => fetchPosts(1, pagination.pageSize, search)}
            >
              Tìm
            </Button>
          </Space.Compact>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreateModal}
        >
          Thêm bài viết
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={posts}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={isEditing ? "Cập nhật bài viết" : "Thêm bài viết mới"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          setEditingId(null);
          form.resetFields();
        }}
        okText={isEditing ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input placeholder="VD: 10 tips học NestJS hiệu quả" />
          </Form.Item>

          <Form.Item label="Slug" name="slug">
            <Input placeholder="vd: 10-tips-hoc-nestjs (bỏ trống sẽ tự tạo)" />
          </Form.Item>

          <Form.Item label="Danh mục" name="category">
            <Input placeholder="VD: backend, lms, tip-hoc" />
          </Form.Item>

          <Form.Item label="Trạng thái" name="status">
            <Select>
              <Option value="draft">Draft</Option>
              <Option value="published">Published</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Nổi bật" name="featured" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item label="Ảnh cover (URL)" name="coverUrl">
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item label="Tags" name="tags">
            <Select mode="tags" placeholder="Nhập tags rồi nhấn Enter" />
          </Form.Item>

          <Form.Item label="Tác giả" name="author">
            <Input placeholder="Tên tác giả" />
          </Form.Item>

          <Form.Item label="Views" name="views">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Thời gian đọc (phút)" name="readMins">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="SEO Title" name="seoTitle">
            <Input placeholder="Tiêu đề SEO" />
          </Form.Item>

          <Form.Item label="SEO Description" name="seoDesc">
            <TextArea rows={2} placeholder="Mô tả SEO" />
          </Form.Item>

          <Form.Item label="Tóm tắt (excerpt)" name="excerpt">
            <TextArea rows={2} placeholder="Tóm tắt ngắn cho bài viết" />
          </Form.Item>

          <Form.Item
            label="Nội dung"
            name="content"
            rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
          >
            <CkEditorField
              value={form.getFieldValue("content")}
              onChange={(html) => form.setFieldsValue({ content: html })}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
