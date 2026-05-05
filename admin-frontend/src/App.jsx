import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Dropdown, Avatar, Button, message } from 'antd'
import {
  HomeOutlined,
  UserOutlined,
  LockOutlined,
  TeamOutlined,
  HomeFilled,
  FileTextOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  LogoutOutlined
} from '@ant-design/icons'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import UserManagement from './pages/UserManagement'
import HouseManagement from './pages/HouseManagement'
import ApplicationManagement from './pages/ApplicationManagement'
import MaintenanceManagement from './pages/MaintenanceManagement'
import Profile from './pages/Profile'
import ChangePassword from './pages/ChangePassword'
import { authApi } from './utils/api'

const { Header, Sider, Content } = Layout

const menuItems = [
  {
    key: '/dashboard',
    icon: <HomeOutlined />,
    label: '首页'
  },
  {
    key: '/users',
    icon: <TeamOutlined />,
    label: '业主管理'
  },
  {
    key: '/houses',
    icon: <HomeFilled />,
    label: '房屋信息管理'
  },
  {
    key: '/applications',
    icon: <FileTextOutlined />,
    label: '维修申报单管理'
  },
  {
    key: '/maintenances',
    icon: <ToolOutlined />,
    label: '房屋维护管理'
  }
]

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      checkAuth()
    } else {
      setLoading(false)
      setIsAuthenticated(false)
    }
  }, [])

  const checkAuth = async () => {
    const result = await authApi.getInfo()
    if (result.success) {
      setIsAuthenticated(true)
      setUser(result.data)
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setIsAuthenticated(false)
    }
    setLoading(false)
  }

  const handleLogin = async (username, password) => {
    const result = await authApi.login({ username, password })
    if (result.success) {
      const { token, user } = result.data
      if (user.role !== 'admin') {
        message.error('只有管理员可以登录管理后台')
        return false
      }
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setIsAuthenticated(true)
      setUser(user)
      message.success('登录成功')
      navigate('/dashboard')
      return true
    }
    return false
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
    message.success('已退出登录')
    navigate('/login')
  }

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
      onClick: () => navigate('/profile')
    },
    {
      key: 'password',
      icon: <LockOutlined />,
      label: '修改密码',
      onClick: () => navigate('/password')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ]

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>加载中...</div>
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Layout className="layout-container">
      <Sider className="sider" theme="dark" width={220}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.1)' }}>
          <span style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>维保管理系统</span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header className="header">
          <div className="logo">
            <HomeOutlined style={{ marginRight: 8 }} />
            公廉租房维保系统 - 管理后台
          </div>
          <div className="user-info">
            <Dropdown menu={{ items: userMenuItems }}>
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar icon={<UserOutlined />} />
                <span>{user?.name || user?.username}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/houses" element={<HouseManagement />} />
            <Route path="/applications" element={<ApplicationManagement />} />
            <Route path="/maintenances" element={<MaintenanceManagement />} />
            <Route path="/profile" element={<Profile user={user} onUpdate={setUser} />} />
            <Route path="/password" element={<ChangePassword />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
