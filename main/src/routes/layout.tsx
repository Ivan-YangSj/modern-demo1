import React, { useState } from "react";
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import { Outlet, useNavigate } from "@modern-js/runtime/router";

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

const App: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const currentYear = new Date().getFullYear();

  function getItem({
    label,
    key,
    icon,
    children,
    path,
  }: {
    label: React.ReactNode;
    key: string;
    icon?: React.ReactNode;
    children?: MenuItem[];
    path?: string;
  }): MenuItem {
    return {
      key,
      icon,
      children,
      label,
    } as MenuItem;
  }

  const items: MenuItem[] = [
    getItem({ label: "Home", key: "/", icon: <PieChartOutlined />, path: "/" }),
    getItem({
      label: "About",
      key: "/about",
      icon: <DesktopOutlined />,
      path: "/about",
    }),
    getItem({
      label: "User",
      key: "sub1",
      icon: <UserOutlined />,
      children: [
        getItem({ label: "Home", key: "/child", path: "/child" }),
        getItem({ label: "About", key: "/child/about", path: "/child/about" }),
        getItem({ label: "Alex", key: "5" }),
      ],
    }),
    getItem({
      label: "Team",
      key: "sub2",
      icon: <TeamOutlined />,
      children: [
        getItem({ label: "Team 1", key: "6" }),
        getItem({ label: "Team 2", key: "8" }),
      ],
    }),
    getItem({ label: "Files", key: "9", icon: <FileOutlined /> }),
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          defaultSelectedKeys={["1"]}
          mode="inline"
          items={items}
          onClick={(item) => {
            navigate(item.key)
          }}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: "0 16px" }}>
          <Breadcrumb
            style={{ margin: "16px 0" }}
            items={[{ title: "User" }, { title: "Bill" }]}
          />
          <div
            style={{
              minHeight: 360,
              width: '100%',
              height: '100%',
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Ant Design ©{currentYear} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default App;
