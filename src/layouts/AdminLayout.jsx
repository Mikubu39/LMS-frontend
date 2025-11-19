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
  LinkOutlined,
  DatabaseOutlined,
  OrderedListOutlined,
  FileTextOutlined,
  TeamOutlined,
  SearchOutlined,
  BellOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

import "../css/admin-layout.css"; // tạo file này

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
          key: "/admin/lessons/video",
          icon: <VideoCameraOutlined />,
          label: "Lesson video",
        },
        {
          key: "/admin/lessons/quiz",
          icon: <QuestionCircleOutlined />,
          label: "Lesson quiz",
        },
        {
          key: "/admin/lessons/essay",
          icon: <EditOutlined />,
          label: "Lesson essay",
        },
        {
          key: "/admin/lessons/submit-link",
          icon: <LinkOutlined />,
          label: "Nộp link",
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

  // để menu highlight đúng item đang đứng
  const selectedKey = menuItems
    .flatMap((item) => (item.children ? item.children : item))
    .map((i) => i.key)
    .find((key) => location.pathname.startsWith(key)) || "/admin";

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
