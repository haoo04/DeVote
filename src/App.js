import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider, theme } from 'antd';
import './App.css';

// Components import
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import WalletProvider from './contexts/WalletContext';

// Pages import
import Dashboard from './pages/Dashboard';
import CreateVote from './pages/CreateVote';
import VoteList from './pages/VoteList';
import VoteDetail from './pages/VoteDetail';
import Admin from './pages/Admin';
import Profile from './pages/Profile';

// New pages import
import OngoingVotes from './pages/OngoingVotes';
import CompletedVotes from './pages/CompletedVotes';
import Analytics from './pages/Analytics';
import VoteHistory from './pages/VoteHistory';

// Help pages import
import Guide from './pages/Guide';
import FAQ from './pages/FAQ';
import About from './pages/About';

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
        setCollapsed(true); // Mobile default collapse
      } else if (width > 768 && width <= 1024) {
        // Tablet can choose to collapse
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initialize
    
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
              
              {/* Mobile overlay */}
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
                    
                    {/* Vote statistics module routes */}
                    <Route path="/results/ongoing" element={<OngoingVotes />} />
                    <Route path="/results/completed" element={<CompletedVotes />} />
                    <Route path="/results/analytics" element={<Analytics />} />
                    
                    {/* User center routes */}
                    <Route path="/history" element={<VoteHistory />} />
                    
                    {/* Help document routes */}
                    <Route path="/help/guide" element={<Guide />} />
                    <Route path="/help/faq" element={<FAQ />} />
                    <Route path="/help/about" element={<About />} />
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
