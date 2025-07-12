import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Button, 
  Space, 
  Typography, 
  Badge,
  Avatar,
  Modal,
  Card,
  message
} from 'antd';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  WalletOutlined,
  UserOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined
} from '@ant-design/icons';
import { useWallet } from '../contexts/WalletContext';
import { useNavigate } from 'react-router-dom';

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

  const navigate = useNavigate();
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleConnectWallet = (type) => {
    if (type === 'metamask') {
      connectMetaMask();
    } else if (type === 'walletconnect') {
      connectWalletConnect();
    }
    setWalletModalVisible(false);
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleDisconnect = () => {
    disconnect();
    message.success('已断开钱包连接');
  };

  const WalletModal = () => (
    <Modal
      title="连接钱包"
      open={walletModalVisible}
      onCancel={() => setWalletModalVisible(false)}
      footer={null}
      width={400}
      style={{ zIndex: 1003 }}
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
    <Space size="small">
      <div 
        style={{ 
          padding: '4px 8px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onClick={handleProfileClick}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = isDarkMode ? '#262626' : '#f5f5f5';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
        }}
      >
        <Avatar size={isMobile ? 28 : 32} icon={<UserOutlined />} />
        {!isMobile && (
          <div style={{ marginLeft: 8 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              lineHeight: '16px'
            }}>
              <Badge status={isCorrectNetwork() ? 'success' : 'error'} />
              <Text 
                strong 
                style={{ 
                  marginLeft: 8,
                  color: isDarkMode ? '#fff' : '#000',
                  maxWidth: '100px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {account && formatAddress ? formatAddress(account) : (account ? `${account.slice(0, 6)}...${account.slice(-4)}` : '')}
              </Text>
            </div>
            <div style={{ 
              fontSize: '10px',
              color: isDarkMode ? '#999' : '#666',
              lineHeight: '14px',
              paddingLeft: '18px'
            }}>
              {parseFloat(balance || 0).toFixed(4)} ETH
            </div>
          </div>
        )}
      </div>
      
      <Button
        type="text"
        icon={<LogoutOutlined />}
        onClick={handleDisconnect}
        size={isMobile ? "small" : "middle"}
        style={{
          color: isDarkMode ? '#ff7875' : '#ff4d4f',
          padding: '4px 8px'
        }}
        title="退出登录"
      />
    </Space>
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
          
          <Title level={isMobile ? 4 : 3} style={{ margin: 0, color: '#1890ff' }}>
            DeVote
          </Title>
          
          {!isMobile && (
            <Text type="secondary" style={{ fontSize: '12px', marginLeft: 8 }}>
              去中心化投票平台
            </Text>
          )}
        </Space>

        <Space size="middle">
          <Button
            type="text"
            icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
            onClick={onToggleTheme}
            size={isMobile ? "middle" : "large"}
          />

          {!isCorrectNetwork() && isConnected && (
            <Badge status="error" text={isMobile ? "" : "网络错误"} />
          )}

          {isConnected ? (
            <ConnectedWallet />
          ) : (
            <Button
              type="primary"
              icon={<WalletOutlined />}
              loading={isConnecting}
              onClick={() => setWalletModalVisible(true)}
              size={isMobile ? "middle" : "large"}
            >
              {isMobile ? "连接" : "连接钱包"}
            </Button>
          )}
        </Space>
      </AntHeader>

      <WalletModal />
    </>
  );
};

export default Header; 