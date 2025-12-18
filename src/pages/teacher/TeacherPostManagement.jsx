// src/pages/teacher/TeacherPostManagement.jsx
import { useCallback, useEffect, useState } from "react";
import {
  Table,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Upload,
} from "antd";
import {
  PlusOutlined,
  LoadingOutlined,
  SearchOutlined,
} from "@ant-design/icons";

// Import Redux để lấy tên Giảng viên
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/authSlice";

import { PostApi } from "@/services/api/postApi";
import { UploadApi } from "@/services/api/uploadApi";
import CkEditorField from "@/components/form/CkEditorField";

const { Option } = Select;
const { TextArea } = Input;

export default function TeacherPostManagement() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Lấy thông tin giảng viên đang đăng nhập
  const currentUser = useSelector(selectUser);

  // State cho Modal & Form
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // State cho Upload ảnh
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const slugify = (str) =>
    (str || "")
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  // 1. Fetch Posts
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
          coverUrl: p.coverUrl,
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

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    fetchPosts(1, pagination.pageSize, value);
  };

  // 2. Xử lý Upload Ảnh
  const handleUploadImage = async ({ file, onSuccess, onError }) => {
    try {
      setUploading(true);
      const res = await UploadApi.uploadImage(file);
      const url = res.secure_url || res.url;
      form.setFieldsValue({ coverUrl: url });
      message.success("Upload ảnh thành công");
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
    const updatedList = newFileList.map((file) => {
      if (file.response) {
        file.url = file.response.secure_url || file.response.url;
      }
      return file;
    });
    setFileList(updatedList);
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

  // 3. Mở Modal Thêm mới
  const openCreateModal = () => {
    setFileList([]);
    setModalVisible(true);
    // Reset form và set giá trị mặc định
    setTimeout(() => {
      form.setFieldsValue({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        category: "general",
        status: "draft",
        coverUrl: "",
        author: currentUser?.full_name || currentUser?.name || "Teacher", // Tự động điền tên GV
        readMins: 5,
        publishedAt: new Date().toISOString(),
      });
    }, 0);
  };

  // 4. Xử lý Submit (Chỉ Tạo mới)
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const slug = values.slug?.trim()
        ? values.slug.trim()
        : slugify(values.title);

      const body = {
        ...values,
        slug,
        tags: [], // Mặc định rỗng hoặc thêm field nhập tags nếu cần
        author: values.author || "Teacher",
        featured: false,
        views: 0,
        readMins: values.readMins ?? 5,
        publishedAt: values.publishedAt || new Date().toISOString(),
      };

      // Chỉ gọi API Create
      await PostApi.createPost(body);
      message.success("Tạo bài viết thành công");

      setModalVisible(false);
      form.resetFields();
      setFileList([]);
      fetchPosts(1, pagination.pageSize, search); // Reset về trang 1
    } catch (error) {
      if (error?.errorFields) return;
      console.error("❌ Lỗi lưu bài viết:", error);
      message.error("Lưu bài viết thất bại");
    }
  };

  // 5. Cấu hình cột (BỎ CỘT ACTION ĐỂ KHÔNG XÓA ĐƯỢC)
  const columns = [
    {
      title: "Ảnh",
      dataIndex: "coverUrl",
      key: "coverUrl",
      width: 80,
      render: (url) =>
        url ? (
          <img
            src={url}
            alt="cover"
            style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4 }}
          />
        ) : null,
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
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: 150,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
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
      width: 180,
      render: (value) =>
        value ? new Date(value).toLocaleString("vi-VN") : "—",
    },
    {
      title: "Lượt xem",
      dataIndex: "views",
      key: "views",
      align: "center",
      width: 100,
    },
    // ❌ KHÔNG CÓ CỘT HÀNH ĐỘNG (DELETE/EDIT)
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Danh sách bài viết</h2>
        {/* 🟢 Nút Thêm bài viết */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreateModal}
        >
          Thêm bài viết
        </Button>
      </div>

      <div style={{ marginBottom: 16, maxWidth: 400 }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm kiếm bài viết..."
          onChange={handleSearch}
          allowClear
        />
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

      {/* 🟢 Modal Thêm mới */}
      <Modal
        title="Thêm bài viết mới"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={900}
        style={{ top: 20 }}
        okText="Tạo bài viết"
        cancelText="Hủy"
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

          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item label="Trạng thái" name="status" style={{ flex: 1 }}>
              <Select>
                <Option value="draft">Draft (Nháp)</Option>
                <Option value="published">Published (Công khai)</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Danh mục" name="category" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
          </div>

          <Form.Item label="Ảnh Bìa (Cover)" style={{ marginBottom: 0 }}>
            <Form.Item name="coverUrl" noStyle>
              <Input type="hidden" />
            </Form.Item>

            <Upload
              listType="picture-card"
              fileList={fileList}
              customRequest={handleUploadImage}
              onChange={handleChangeUpload}
              maxCount={1}
              onPreview={(file) => {
                const src = file.url || file.thumbUrl;
                if (src) {
                  const imgWindow = window.open(src);
                  imgWindow?.document.write(
                    `<img src="${src}" style="max-width: 100%;"/>`
                  );
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