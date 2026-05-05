import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Dropdown, Avatar, Button, message } from 'antd'
import {
  HomeOutlined,
  UserOutlined,
  LockOutlined,
  HomeFilled,
  FileTextOutlined,
  CheckCircleOutlined,
  LogoutOutlined
} from '@ant-design/icons'
import Login from './pages/Login'
import UserDashboard from './pages/UserDashboard'
import RepairerDashboard from './pages/RepairerDashboard'
import HouseList from './pages/HouseList'
import ApplicationList from './pages/ApplicationList'
import ApplicationForm from './pages/ApplicationForm'
import ApplicationDetail from './pages/ApplicationDetail'
import CompleteList from './pages/CompleteList'
import CompleteForm from './pages/CompleteForm'
import Profile from './pages/Profile'
import ChangePassword from './pages/ChangePassword'
import { authApi } from './utils/api'

const { Header, Sider, Content } = Layout

const userMenuItems = [
  {
    key: '/dashboard',
    icon: <HomeOutlined />,
    label: '首页'
  },
  {
    key: '/houses',
    icon: <HomeFilled />,
    label: '房屋信息'
  },
  {
    key: '/applications',
    icon: <FileTextOutlined />,
    label: '维修申报单'
  }
]

const repairerMenuItems = [
  {
    key: '/dashboard',
    icon: <HomeOutlined />,
    label: '首页'
  },
  {
    key: '/applications',
    icon: <FileTextOutlined />,
    label: '维修申报单'
  },
  {
    key: '/completes',
    icon: <CheckCircleOutlined />,
    label: '维修完成记录'
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
      if (user.role === 'admin') {
        message.error('请使用管理后台登录')
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

  const userMenuItemsDropdown = [
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

  const menuItems = user?.role === 'repairer' ? repairerMenuItems : userMenuItems
  const isRepairer = user?.role === 'repairer'

  return (
    <Layout className="layout-container">
      <Sider className="sider" theme="dark" width={220}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.1)' }}>
          <span style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
            {isRepairer ? '维修单位' : '业主端'}
          </span>
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
            公廉租房维保系统
          </div>
          <div className="user-info">
            <Dropdown menu={{ items: userMenuItemsDropdown }}>
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar icon={<UserOutlined />} />
                <span>{user?.name || user?.username}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="content">
          <Routes>
            <Route path="/dashboard" element={isRepairer ? <RepairerDashboard /> : <UserDashboard />} />
            {!isRepairer && (
              <>
                <Route path="/houses" element={<HouseList />} />
              </>
            )}
            <Route path="/applications" element={<ApplicationList isRepairer={isRepairer} />} />
            {!isRepairer && (
              <>
                <Route path="/applications/create" element={<ApplicationForm />} />
                <Route path="/applications/edit/:id" element={<ApplicationForm />} />
              </>
            )}
            <Route path="/applications/:id" element={<ApplicationDetail isRepairer={isRepairer} />} />
            {isRepairer && (
              <>
                <Route path="/completes" element={<CompleteList />} />
                <Route path="/completes/create/:applicationId" element={<CompleteForm />} />
                <Route path="/completes/edit/:id" element={<CompleteForm />} />
              </>
            )}
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
