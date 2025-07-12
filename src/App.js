import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider, theme } from 'antd';
import './App.css';

// 组件导入
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import WalletProvider from './contexts/WalletContext';

// 页面导入
import Dashboard from './pages/Dashboard';
import CreateVote from './pages/CreateVote';
import VoteList from './pages/VoteList';
import VoteDetail from './pages/VoteDetail';
import Admin from './pages/Admin';
import Profile from './pages/Profile';

const { Content } = Layout;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      
      if (width <= 768) {
        setCollapsed(true); // 移动端默认折叠
      } else if (width > 768 && width <= 1024) {
        // 平板端可以选择性折叠
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 初始化
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <WalletProvider>
        <Router>
          <Layout style={{ minHeight: '100vh' }}>
            <Header 
              collapsed={collapsed}
              onToggleSidebar={toggleSidebar}
              isDarkMode={isDarkMode}
              onToggleTheme={toggleTheme}
            />
            
            <Layout style={{ marginTop: '64px' }}>
              <Sidebar collapsed={collapsed} />
              
              {/* 移动端遮罩层 */}
              {isMobile && !collapsed && (
                <div 
                  className="mobile-overlay"
                  style={{
                    position: 'fixed',
                    top: 64,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.45)',
                    zIndex: 1000
                  }}
                  onClick={toggleSidebar}
                />
              )}
              
              <Layout style={{ 
                padding: '24px 24px 24px',
                marginLeft: isMobile ? '0' : (collapsed ? '80px' : '256px'),
                transition: 'margin-left 0.2s',
                minHeight: 'calc(100vh - 64px)'
              }}>
                <Content
                  style={{
                    padding: 24,
                    margin: 0,
                    minHeight: 280,
                    background: isDarkMode ? '#001529' : '#fff',
                    borderRadius: 8,
                  }}
                >
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/create" element={<CreateVote />} />
                    <Route path="/votes" element={<VoteList />} />
                    <Route path="/vote/:id" element={<VoteDetail />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </Content>
              </Layout>
            </Layout>
          </Layout>
        </Router>
      </WalletProvider>
    </ConfigProvider>
  );
}

export default App;
