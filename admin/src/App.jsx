import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Typography,
  Space,
} from 'antd';
import {
  DashboardOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  TrophyOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  CompassOutlined,
  CodeOutlined,
} from '@ant-design/icons';

// Pages
import Dashboard from './pages/Dashboard';
import CareerQuestions from './pages/CareerQuestions';
import SkillTests from './pages/SkillTests';
import SkillQuestions from './pages/SkillQuestions';
import Users from './pages/Users';
import Badges from './pages/Badges';
import Settings from './pages/Settings';
import Login from './pages/Login';
import useAuthStore from './store/authStore';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/career-questions',
      icon: <CompassOutlined />,
      label: 'Career Questions',
    },
    {
      key: 'skill-tests',
      icon: <CodeOutlined />,
      label: 'Skill Tests',
      children: [
        { key: '/skill-tests', label: 'Test Management' },
        { key: '/skill-questions', label: 'Question Bank' },
      ],
    },
    {
      key: '/users',
      icon: <TeamOutlined />,
      label: 'Users',
    },
    {
      key: '/badges',
      icon: <TrophyOutlined />,
      label: 'Badges',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    }
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        width={240}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          borderRight: '1px solid #f0f0f0',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '0 20px',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text strong style={{ color: '#fff', fontSize: 18 }}>C</Text>
          </div>
          {!collapsed && (
            <Text strong style={{ marginLeft: 12, fontSize: 16 }}>
              Codebasics Admin
            </Text>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: 'none', padding: '8px 0' }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          />
          <Space>
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              trigger={['click']}
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ background: '#1E3A8A' }} />
                <Text>{user?.name || 'Admin'}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: 24,
            padding: 24,
            minHeight: 280,
            background: '#f5f7fa',
            borderRadius: 8,
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/career-questions" element={<CareerQuestions />} />
            <Route path="/skill-tests" element={<SkillTests />} />
            <Route path="/skill-questions" element={<SkillQuestions />} />
            <Route path="/users" element={<Users />} />
            <Route path="/badges" element={<Badges />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
