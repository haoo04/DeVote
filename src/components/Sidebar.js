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
      label: '仪表板',
    },
    {
      key: '/create',
      icon: <PlusOutlined />,
      label: '发起投票',
    },
    {
      key: '/votes',
      icon: <UnorderedListOutlined />,
      label: '所有投票',
    },
    {
      type: 'divider',
    },
    {
      key: 'results',
      icon: <BarChartOutlined />,
      label: '投票统计',
      children: [
        {
          key: '/results/ongoing',
          label: '进行中投票',
        },
        {
          key: '/results/completed',
          label: '已完成投票',
        },
        {
          key: '/results/analytics',
          label: '数据分析',
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      key: '/admin',
      icon: <CrownOutlined />,
      label: '管理中心',
    },
    {
      type: 'divider',
    },
    {
      key: 'user',
      icon: <UserOutlined />,
      label: '用户中心',
      children: [
        {
          key: '/profile',
          label: '个人资料',
        },
        {
          key: '/history',
          label: '投票历史',
        },
        {
          key: '/settings',
          label: '设置',
        },
      ],
    },
    {
      key: 'help',
      icon: <FileTextOutlined />,
      label: '帮助文档',
      children: [
        {
          key: '/help/guide',
          label: '使用指南',
        },
        {
          key: '/help/faq',
          label: '常见问题',
        },
        {
          key: '/help/about',
          label: '关于我们',
        },
      ],
    },
  ];

  const handleMenuClick = ({ key }) => {
    // 如果是父级菜单项，不进行导航
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
        top: 64, // Header高度
        bottom: 0,
        zIndex: 1001, // 确保在其他内容之上
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