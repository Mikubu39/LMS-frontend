// src/layouts/AdminLayout.jsx
import { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Dropdown, Badge } from "antd"; 
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
  MessageOutlined 
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"; 
import io from 'socket.io-client'; 

import ChatWidget from "@/components/ChatWidget";
import { ChatApi } from "@/services/api/chatApi"; 
// 🟢 BỔ SUNG: Import ProfileApi và setUser để cập nhật thông tin mới nhất
import { ProfileApi } from "@/services/api/profileApi";
import { logout, selectUser, setUser } from "@/redux/authSlice"; 

import "../css/admin-layout.css";

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); 
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const currentUser = useSelector(selectUser);

  // 🟢 THÊM MỚI: useEffect này chuyên để fetch dữ liệu mới nhất khi F5 hoặc mới login vào
  useEffect(() => {
    const fetchLatestUser = async () => {
      try {
        // Chỉ gọi API nếu đã có token/user (tránh gọi khi chưa login)
        if (currentUser) {
            // Gọi API lấy thông tin tươi từ DB
            const freshData = await ProfileApi.getProfile({ mapped: true, prevUser: currentUser });
            
            // So sánh nhẹ: Nếu avatar khác nhau thì mới dispatch để tránh render thừa (tuỳ chọn)
            if (freshData.avatar !== currentUser.avatar || freshData.name !== currentUser.name) {
                dispatch(setUser(freshData));
            }
        }
      } catch (error) {
        console.error("Lỗi cập nhật thông tin user tại AdminLayout:", error);
        // Nếu lỗi 401 (token hết hạn) thì có thể logout luôn tại đây nếu muốn
      }
    };

    fetchLatestUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chạy 1 lần duy nhất khi AdminLayout mount

  useEffect(() => {
    if (currentUser && currentUser.user_id) {
        
        ChatApi.getUnreadCount()
          .then((res) => setUnreadCount(res.count))
          .catch((err) => console.error("Lỗi badge admin", err));

        const socket = io('http://localhost:3000', {
            query: { userId: currentUser.user_id }
        });

        socket.on('receiveMessage', (newMsg) => {
            if (newMsg.sender.user_id !== currentUser.user_id) {
                setUnreadCount(prev => prev + 1);
            }
        });

        return () => socket.disconnect();
    }
  }, [currentUser?.user_id]); // Chỉ chạy lại khi ID thay đổi

  const menuItems = [
    { key: "/admin", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "/admin/classes", icon: <ApartmentOutlined />, label: "Quản lý lớp học" },
    { key: "/admin/courses", icon: <BookOutlined />, label: "Quản lý khóa học" },
    {
      key: "question-banks-group",
      icon: <DatabaseOutlined />,
      label: "Quản lý bộ đề",
      children: [
        { key: "/admin/question-banks", icon: <DatabaseOutlined />, label: "Quản lý quiz" },
        { key: "/admin/questions", icon: <OrderedListOutlined />, label: "Quản lý câu hỏi" },
      ],
    },
    { key: "/admin/posts", icon: <FileTextOutlined />, label: "Quản lý bài viết" },
    {
      key: "user-management-group", 
      icon: <TeamOutlined />,
      label: "Quản lý người dùng",
      children: [
        { key: "/admin/students", label: "Học viên" },
        { key: "/admin/teachers", label: "Giảng viên" },
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
        dispatch(logout());
        navigate("/login"); 
        break;
      default: break;
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
    if (info.key.startsWith("/admin")) navigate(info.key);
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

  const handleOpenChat = () => {
      setChatOpen(true);
  }

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
            <div 
                className="admin-header-icon" 
                onClick={handleOpenChat}
                style={{ cursor: 'pointer', marginRight: 10, display: 'flex', alignItems: 'center' }}
                title="Tin nhắn"
            >
                <Badge count={unreadCount} overflowCount={99} size="small"> 
                    <MessageOutlined style={{ fontSize: 20 }} />
                </Badge>
            </div>

            <BellOutlined className="admin-header-icon" />
            
            <Dropdown menu={userMenu} placement="bottomRight" arrow>
              <div className="admin-user" style={{ cursor: "pointer" }}>
                <Avatar size="small" icon={<UserOutlined />} src={currentUser?.avatar} />
                <span className="admin-user-name">
                  {currentUser?.full_name || currentUser?.name || "Admin"}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>

      <ChatWidget 
        open={chatOpen} 
        onClose={() => setChatOpen(false)} 
        currentUser={currentUser}
      />
    </Layout>
  );
}