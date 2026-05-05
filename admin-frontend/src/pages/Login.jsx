import React, { useState } from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'

function Login({ onLogin }) {
  const [loading, setLoading] = useState(false)

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const success = await onLogin(values.username, values.password)
      if (!success) {
        setLoading(false)
      }
    } catch (error) {
      message.error('登录失败')
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <Card className="login-card">
        <h2 className="login-title">公廉租房维保系统</h2>
        <h3 style={{ textAlign: 'center', marginBottom: 24, color: '#666' }}>管理后台登录</h3>
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="请输入用户名"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="请输入密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              style={{ width: '100%' }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
          默认管理员账号: admin / admin123
        </div>
      </Card>
    </div>
  )
}

export default Login
