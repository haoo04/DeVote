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
    message.success('Wallet disconnected');
  };

  const WalletModal = () => (
    <Modal
      title="Connect Wallet"  
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
              src="/MetaMask.png"
            />
            <div>
              <Text strong>MetaMask</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Connect with MetaMask wallet
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
                src="/Walletconnect.png"
            >
              WC
            </Avatar>
            <div>
              <Text strong>WalletConnect</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Connect with WalletConnect
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
        title="Logout"
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
              Decentralized voting platform
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
            <Badge status="error" text={isMobile ? "" : "Network error"} />
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
              {isMobile ? "Connect" : "Connect Wallet"}
            </Button>
          )}
        </Space>
      </AntHeader>

      <WalletModal />
    </>
  );
};

export default Header; 