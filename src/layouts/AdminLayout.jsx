// src/layouts/AdminLayout.jsx
import { useState, useEffect, useRef } from "react";
import { Layout, Menu, Avatar, Dropdown, Badge } from "antd"; 
import {
  MenuFoldOutlined, MenuUnfoldOutlined, DashboardOutlined, ApartmentOutlined,
  BookOutlined, DatabaseOutlined, OrderedListOutlined, FileTextOutlined,
  TeamOutlined, SearchOutlined, BellOutlined, UserOutlined, SettingOutlined,
  LogoutOutlined, MessageOutlined 
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"; 
import io from 'socket.io-client'; 

import ChatWidget from "@/components/ChatWidget";
import { ChatApi } from "@/services/api/chatApi"; 
import { ProfileApi } from "@/services/api/profileApi";
import { logout, selectUser, setUser } from "@/redux/authSlice"; 
import "../css/admin-layout.css";

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); 
  
  // 🟢 1. Tạo Ref để theo dõi trạng thái chatOpen
  // Lý do: useEffect của Socket chỉ chạy 1 lần, nếu dùng state 'chatOpen' trực tiếp sẽ bị giá trị cũ (closure).
  const chatOpenRef = useRef(chatOpen);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);

  // Sync state sang ref
  useEffect(() => {
    chatOpenRef.current = chatOpen;
  }, [chatOpen]);

  // Fetch user info & count
  useEffect(() => {
    const fetchLatestUser = async () => {
      if (currentUser) {
        try {
            const freshData = await ProfileApi.getProfile({ mapped: true, prevUser: currentUser });
            if (freshData.avatar !== currentUser.avatar || freshData.name !== currentUser.name) {
                dispatch(setUser(freshData));
            }
        } catch (e) {}
      }
    };
    fetchLatestUser();

    if (currentUser && currentUser.user_id) {
        // Lấy số tin nhắn chưa đọc ban đầu từ server
        ChatApi.getUnreadCount()
          .then((res) => setUnreadCount(res.count))
          .catch((err) => console.error(err));

        const socket = io('http://localhost:3000', {
            query: { userId: currentUser.user_id }
        });

        socket.on('receiveMessage', (newMsg) => {
            if (newMsg.sender.user_id !== currentUser.user_id) {
                // 🟢 2. Chỉ tăng số thông báo nếu Chat ĐANG ĐÓNG
                if (!chatOpenRef.current) {
                    setUnreadCount(prev => prev + 1);
                }
            }
        });

        return () => socket.disconnect();
    }
  }, [currentUser?.user_id]); 

  // ... (Phần menu giữ nguyên) ...
  const menuItems = [
    { key: "/admin", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "/admin/classes", icon: <ApartmentOutlined />, label: "Quản lý lớp học" },
    { key: "/admin/courses", icon: <BookOutlined />, label: "Quản lý khóa học" },
    { key: "question-banks-group", icon: <DatabaseOutlined />, label: "Quản lý bộ đề", children: [
        { key: "/admin/question-banks", icon: <DatabaseOutlined />, label: "Quản lý quiz" },
        { key: "/admin/questions", icon: <OrderedListOutlined />, label: "Quản lý câu hỏi" },
    ]},
    { key: "/admin/posts", icon: <FileTextOutlined />, label: "Quản lý bài viết" },
    { key: "user-management-group", icon: <TeamOutlined />, label: "Quản lý người dùng", children: [
        { key: "/admin/students", label: "Học viên" },
        { key: "/admin/teachers", label: "Giảng viên" },
    ]},
  ];

  const handleUserMenuClick = ({ key }) => {
    if(key === "logout") { dispatch(logout()); navigate("/login"); }
    else if(key === "profile") navigate("/admin/profile");
    else if(key === "settings") navigate("/admin/settings");
  };
  const handleMenuClick = (info) => { if (info.key.startsWith("/admin")) navigate(info.key); };

  const handleOpenChat = () => {
      setChatOpen(true);
      // Lưu ý: Không reset unreadCount = 0 ở đây để giữ tính năng "đọc mới mất"
  };

  // 🟢 3. Hàm này được ChatWidget gọi khi user focus vào ô chat hoặc gửi tin
  const handleMessageRead = () => {
     setUnreadCount(0);
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
  
  const flatKeys = menuItems.flatMap((item) => item.children ? item.children.map((c) => c.key) : item.key);
  const matchedKey = flatKeys.filter((k) => typeof k === "string" && location.pathname.startsWith(k)).sort((a, b) => b.length - a.length)[0] || "/admin";

  return (
    <Layout className="admin-layout">
      <Sider width={230} collapsible collapsed={collapsed} trigger={null} className="admin-sider">
        <div className="admin-logo">
          <div className="admin-logo-icon">L</div>
          {!collapsed && <span className="admin-logo-text">LMS Admin</span>}
        </div>
        <Menu mode="inline" selectedKeys={[matchedKey]} defaultOpenKeys={["question-banks-group"]} items={menuItems} onClick={handleMenuClick} className="admin-menu" />
      </Sider>

      <Layout className="admin-main">
        <Header className="admin-header">
          <div className="admin-header-left">
            <button className="admin-trigger" onClick={() => setCollapsed(!collapsed)}>{collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}</button>
            <div className="admin-search"><SearchOutlined className="admin-search-icon" /><input className="admin-search-input" placeholder="Tìm kiếm..." /></div>
          </div>

          <div className="admin-header-right">
            <div className="admin-header-icon" onClick={handleOpenChat} style={{ cursor: 'pointer', marginRight: 10 }}>
                {/* 🟢 Badge hiển thị số lượng */}
                <Badge count={unreadCount} overflowCount={99} size="small"> 
                    <MessageOutlined style={{ fontSize: 20 }} />
                </Badge>
            </div>
            <BellOutlined className="admin-header-icon" />
            <Dropdown menu={userMenu} placement="bottomRight" arrow>
              <div className="admin-user" style={{ cursor: "pointer" }}>
                <Avatar size="small" icon={<UserOutlined />} src={currentUser?.avatar} />
                <span className="admin-user-name">{currentUser?.full_name || currentUser?.name || "Admin"}</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="admin-content"><Outlet /></Content>
      </Layout>

      {/* 🟢 4. Truyền handleMessageRead vào component con */}
      <ChatWidget 
        open={chatOpen} 
        onClose={() => setChatOpen(false)} 
        currentUser={currentUser}
        onRead={handleMessageRead} 
      />
    </Layout>
  );
}