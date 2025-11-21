// src/layouts/AdminLayout.jsx
import { useState } from "react";
import { Layout, Menu, Avatar, Dropdown } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ApartmentOutlined,
  BookOutlined,
  ScheduleOutlined,
  PlayCircleOutlined,
  VideoCameraOutlined,
  QuestionCircleOutlined,
  EditOutlined,
  DatabaseOutlined,
  OrderedListOutlined,
  FileTextOutlined,
  TeamOutlined,
  SearchOutlined,
  BellOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

import "../css/admin-layout.css";

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/admin/classes",
      icon: <ApartmentOutlined />,
      label: "Quản lý lớp học",
    },
    {
      key: "/admin/courses",
      icon: <BookOutlined />,
      label: "Quản lý khóa học",
    },
    {
      key: "/admin/sessions",
      icon: <ScheduleOutlined />,
      label: "Quản lý session",
    },
    {
      key: "lessons-group",
      icon: <PlayCircleOutlined />,
      label: "Quản lý lesson",
      children: [
        {
          key: "/admin/lessons",
          icon: <PlayCircleOutlined />,
          label: "Tất cả lesson",
        },
        {
          key: "/admin/lessons/video",
          icon: <VideoCameraOutlined />,
          label: "Lesson Video",
        },
        {
          key: "/admin/lessons/text",
          icon: <EditOutlined />,
          label: "Lesson Text",
        },
        {
          key: "/admin/lessons/quiz",
          icon: <QuestionCircleOutlined />,
          label: "Lesson Quiz",
        },
      ],
    },
    {
      key: "question-banks-group",
      icon: <DatabaseOutlined />,
      label: "Ngân hàng câu hỏi",
      children: [
        {
          key: "/admin/question-banks",
          icon: <DatabaseOutlined />,
          label: "Quản lý ngân hàng",
        },
        {
          key: "/admin/questions",
          icon: <OrderedListOutlined />,
          label: "Quản lý câu hỏi",
        },
      ],
    },
    {
      key: "/admin/posts",
      icon: <FileTextOutlined />,
      label: "Quản lý bài viết",
    },
    {
      key: "/admin/users",
      icon: <TeamOutlined />,
      label: "Quản lý user",
    },
  ];

  const userMenu = {
    items: [
      { key: "profile", label: "Profile" },
      { key: "settings", label: "Settings" },
      { key: "logout", label: "Logout" },
    ],
  };

  const handleMenuClick = (info) => {
    if (info.key.startsWith("/admin")) {
      navigate(info.key);
    }
  };

  // 🔹 Tính selectedKey: ưu tiên key dài nhất khớp với pathname
  const flatKeys = menuItems.flatMap((item) =>
    item.children ? item.children.map((c) => c.key) : item.key
  );

  const matchedKey =
    flatKeys
      .filter((key) => typeof key === "string")
      .filter((key) => location.pathname.startsWith(key))
      .sort((a, b) => b.length - a.length)[0] || "/admin";

  const selectedKey = matchedKey;

  return (
    <Layout className="admin-layout">
      {/* SIDEBAR */}
      <Sider
        width={230}
        collapsible
        collapsed={collapsed}
        trigger={null}
        className="admin-sider"
      >
        <div className="admin-logo">
          <div className="admin-logo-icon">L</div>
          {!collapsed && <span className="admin-logo-text">LMS Admin</span>}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={["lessons-group", "question-banks-group"]}
          items={menuItems}
          onClick={handleMenuClick}
          className="admin-menu"
        />
      </Sider>

      {/* MAIN */}
      <Layout className="admin-main">
        <Header className="admin-header">
          <div className="admin-header-left">
            <button
              className="admin-trigger"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>

            <div className="admin-search">
              <SearchOutlined className="admin-search-icon" />
              <input
                className="admin-search-input"
                placeholder="Tìm kiếm lớp, khóa, user..."
              />
            </div>
          </div>

          <div className="admin-header-right">
            <BellOutlined className="admin-header-icon" />
            <Dropdown menu={userMenu} placement="bottomRight">
              <div className="admin-user">
                <Avatar size="small" icon={<UserOutlined />} />
                <span className="admin-user-name">Admin</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
