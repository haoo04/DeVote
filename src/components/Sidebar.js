import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  DashboardOutlined, 
  PlusOutlined, 
  UnorderedListOutlined, 
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  FileTextOutlined,
  CrownOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/create',
      icon: <PlusOutlined />,
      label: 'Create Vote',
    },
    {
      key: '/votes',
      icon: <UnorderedListOutlined />,
      label: 'All Votes',
    },
    {
      type: 'divider',
    },
    {
      key: 'results',
      icon: <BarChartOutlined />,
      label: 'Vote Statistics',
      children: [
        {
          key: '/results/ongoing',
          label: 'Ongoing Votes',
        },
        {
          key: '/results/completed',
          label: 'Completed Votes',
        },
        {
          key: '/results/analytics',
          label: 'Analytics',
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      key: '/admin',
      icon: <CrownOutlined />,
      label: 'Admin Center',
    },
    {
      type: 'divider',
    },
    {
      key: 'user',
      icon: <UserOutlined />,
      label: 'User Center',
      children: [
        {
          key: '/profile',
          label: 'Profile',
        },
        {
          key: '/history',
          label: 'Vote History',
        },
        {
          key: '/settings',
          label: 'Settings',
        },
      ],
    },
    {
      key: 'help',
      icon: <FileTextOutlined />,
      label: 'Help',
      children: [
        {
          key: '/help/guide',
          label: 'Guide',
        },
        {
          key: '/help/faq',
          label: 'FAQ',
        },
        {
          key: '/help/about',
          label: 'About Us',
        },
      ],
    },
  ];

  const handleMenuClick = ({ key }) => {
    // If it's a parent menu item, do not navigate
    if (['results', 'user', 'help'].includes(key)) {
      return;
    }
    navigate(key);
  };

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      width={256}
      style={{
        overflow: 'auto',
        height: 'calc(100vh - 64px)',
        position: 'fixed',
        left: 0,
        top: 64, // Header height
        bottom: 0,
        zIndex: 1001, // Ensure it's above other content
      }}
    >
      <div style={{ height: '100%', borderRight: 0 }}>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['results', 'user']}
          style={{ height: '100%', borderRight: 0 }}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </div>
    </Sider>
  );
};

export default Sidebar; 