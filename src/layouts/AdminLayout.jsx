// src/layouts/AdminLayout.jsx
import { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Dropdown, Badge } from "antd"; // 👈 Thêm Badge
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ApartmentOutlined,
  BookOutlined,
  DatabaseOutlined,
  OrderedListOutlined,
  FileTextOutlined,
  TeamOutlined,
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MessageOutlined // 👈 Thêm icon tin nhắn
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

// 👇 Import ChatWidget (Đảm bảo bạn đã tạo file này ở src/components/ChatWidget.jsx)
import ChatWidget from "@/components/ChatWidget";

import "../css/admin-layout.css";

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  
  // 👇 State cho Chat Widget
  const [chatOpen, setChatOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // 👇 Lấy thông tin user từ localStorage khi load trang
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        setCurrentUser(JSON.parse(userStr));
      }
    } catch (error) {
      console.error("Lỗi đọc user từ localStorage", error);
    }
  }, []);

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
      key: "question-banks-group",
      icon: <DatabaseOutlined />,
      label: "Quản lý bộ đề",
      children: [
        {
          key: "/admin/question-banks",
          icon: <DatabaseOutlined />,
          label: "Quản lý quiz",
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
      key: "user-management-group", 
      icon: <TeamOutlined />,
      label: "Quản lý người dùng",
      children: [
        {
          key: "/admin/students",
          label: "Học viên",
        },
        {
          key: "/admin/teachers",
          label: "Giảng viên",
        },
      ],
    },
  ];

  const handleUserMenuClick = ({ key }) => {
    switch (key) {
      case "profile":
        navigate("/admin/profile");
        break;
      case "settings":
        navigate("/admin/settings");
        break;
      case "logout":
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        navigate("/login"); 
        break;
      default:
        break;
    }
  };

  const userMenu = {
    items: [
      { key: "profile", label: "Hồ sơ cá nhân", icon: <UserOutlined /> },
      { key: "settings", label: "Cài đặt", icon: <SettingOutlined /> },
      { type: "divider" },
      { key: "logout", label: "Đăng xuất", icon: <LogoutOutlined />, danger: true },
    ],
    onClick: handleUserMenuClick,
  };

  const handleMenuClick = (info) => {
    if (info.key.startsWith("/admin")) {
      navigate(info.key);
    }
  };

  const flatKeys = menuItems.flatMap((item) =>
    item.children ? item.children.map((c) => c.key) : item.key
  );
  
  const matchedKey =
    flatKeys
      .filter((key) => typeof key === "string")
      .filter((key) => location.pathname.startsWith(key))
      .sort((a, b) => b.length - a.length)[0] || "/admin";

  const selectedKey = location.pathname.includes('/courses') ? '/admin/courses' : matchedKey;

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
          defaultOpenKeys={["question-banks-group"]}
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
                placeholder="Tìm kiếm..."
              />
            </div>
          </div>

          <div className="admin-header-right">
            {/* 👇 ICON CHAT MỚI THÊM VÀO */}
            <div 
                className="admin-header-icon" 
                onClick={() => setChatOpen(true)}
                style={{ cursor: 'pointer', marginRight: 10, display: 'flex', alignItems: 'center' }}
                title="Tin nhắn"
            >
                <Badge count={0} dot offset={[-5, 5]}> 
                    <MessageOutlined style={{ fontSize: 20 }} />
                </Badge>
            </div>

            <BellOutlined className="admin-header-icon" />
            
            <Dropdown menu={userMenu} placement="bottomRight">
              <div className="admin-user">
                <Avatar size="small" icon={<UserOutlined />} src={currentUser?.avatar} />
                <span className="admin-user-name">
                  {currentUser?.full_name || currentUser?.username || "Admin"}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>

      {/* 👇 COMPONENT CHAT WIDGET (DRAWER) */}
      <ChatWidget 
        open={chatOpen} 
        onClose={() => setChatOpen(false)} 
        currentUser={currentUser}
      />
    </Layout>
  );
}