import React, { useState } from 'react';
import { 
  Layout, 
  Button, 
  Dropdown, 
  Space, 
  Typography, 
  Badge,
  Avatar,
  Modal,
  Card,
  Divider
} from 'antd';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  WalletOutlined,
  UserOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
  SettingOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { useWallet } from '../contexts/WalletContext';

const { Header: AntHeader } = Layout;
const { Text, Title } = Typography;

const Header = ({ collapsed, onToggleSidebar, isDarkMode, onToggleTheme }) => {
  const { 
    account, 
    balance, 
    isConnected, 
    isConnecting,
    connectMetaMask, 
    connectWalletConnect,
    disconnect, 
    formatAddress,
    isCorrectNetwork
  } = useWallet();

  const [walletModalVisible, setWalletModalVisible] = useState(false);

  const handleConnectWallet = (type) => {
    if (type === 'metamask') {
      connectMetaMask();
    } else if (type === 'walletconnect') {
      connectWalletConnect();
    }
    setWalletModalVisible(false);
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'disconnect',
      icon: <LogoutOutlined />,
      label: '断开连接',
      danger: true,
      onClick: disconnect,
    },
  ];

  const WalletModal = () => (
    <Modal
      title="连接钱包"
      open={walletModalVisible}
      onCancel={() => setWalletModalVisible(false)}
      footer={null}
      width={400}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card 
          hoverable
          onClick={() => handleConnectWallet('metamask')}
          style={{ cursor: 'pointer' }}
        >
          <Space>
            <Avatar 
              size={40} 
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMwLjA0IDEyLjc2TDMxLjk5IDQuNTdMMjguMzIgNy40N0wyNC44OSAxLjAzTDIwLjk5IDUuMzhMMTYgMEwxMS4wMSA1LjM4TDcuMTEgMS4wM0wzLjY4IDcuNDdMMC4wMSA0LjU3TDEuOTYgMTIuNzZMMCA5LjA0SDMyTDMwLjA0IDEyLjc2WiIgZmlsbD0iIzc2NzY3NiIvPgo8L3N2Zz4K"
            />
            <div>
              <Text strong>MetaMask</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                使用MetaMask钱包连接
              </Text>
            </div>
          </Space>
        </Card>

        <Card 
          hoverable
          onClick={() => handleConnectWallet('walletconnect')}
          style={{ cursor: 'pointer' }}
        >
          <Space>
            <Avatar 
              size={40} 
              style={{ backgroundColor: '#3b99fc' }}
            >
              WC
            </Avatar>
            <div>
              <Text strong>WalletConnect</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                使用WalletConnect协议连接
              </Text>
            </div>
          </Space>
        </Card>
      </Space>
    </Modal>
  );

  const ConnectedWallet = () => (
    <Dropdown
      menu={{ 
        items: userMenuItems,
        onClick: ({ key }) => {
          if (key === 'profile') {
            // 跳转到个人资料页
          } else if (key === 'settings') {
            // 跳转到设置页
          }
        }
      }}
      placement="bottomRight"
    >
      <Space style={{ cursor: 'pointer' }}>
        <Badge 
          dot 
          status={isCorrectNetwork() ? 'success' : 'error'}
          offset={[-2, 2]}
        >
          <Avatar icon={<UserOutlined />} />
        </Badge>
        <div style={{ textAlign: 'right' }}>
          <Text strong style={{ display: 'block', fontSize: '12px' }}>
            {formatAddress(account)}
          </Text>
          <Text type="secondary" style={{ fontSize: '10px' }}>
            {parseFloat(balance).toFixed(4)} ETH
          </Text>
        </div>
      </Space>
    </Dropdown>
  );

  return (
    <>
      <AntHeader
        style={{
          padding: '0 24px',
          background: isDarkMode ? '#001529' : '#fff',
          borderBottom: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Space>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={onToggleSidebar}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            DeVote
          </Title>
          
          <Text type="secondary" style={{ fontSize: '12px', marginLeft: 8 }}>
            去中心化投票平台
          </Text>
        </Space>

        <Space size="middle">
          <Button
            type="text"
            icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
            onClick={onToggleTheme}
            size="large"
          />

          {!isCorrectNetwork() && isConnected && (
            <Badge status="error" text="网络错误" />
          )}

          {isConnected ? (
            <ConnectedWallet />
          ) : (
            <Button
              type="primary"
              icon={<WalletOutlined />}
              loading={isConnecting}
              onClick={() => setWalletModalVisible(true)}
            >
              连接钱包
            </Button>
          )}
        </Space>
      </AntHeader>

      <WalletModal />
    </>
  );
};

export default Header; 