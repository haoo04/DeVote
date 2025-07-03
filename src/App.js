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
            
            <Layout>
              <Sidebar collapsed={collapsed} />
              
              <Layout style={{ padding: '24px 24px 24px' }}>
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
