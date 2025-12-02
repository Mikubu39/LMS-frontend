import React from "react";
import { Card, Switch, List } from "antd";

export default function AdminSettings() {
  const data = [
    {
      title: "Thông báo qua Email",
      description: "Nhận email khi có học viên đăng ký mới",
      actions: [<Switch defaultChecked />],
    },
    {
      title: "Chế độ bảo trì",
      description: "Tạm đóng hệ thống để nâng cấp",
      actions: [<Switch />],
    },
    {
      title: "Giao diện tối (Dark Mode)",
      description: "Chuyển sang giao diện nền tối",
      actions: [<Switch />],
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="Cài đặt hệ thống">
        <List
          itemLayout="horizontal"
          dataSource={data}
          renderItem={(item) => (
            <List.Item actions={item.actions}>
              <List.Item.Meta
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}