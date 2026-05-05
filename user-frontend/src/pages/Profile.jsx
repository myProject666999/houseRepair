import React, { useState } from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { authApi } from '../utils/api'

function Profile({ user, onUpdate }) {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const initialValues = {
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || ''
  }

  const handleSubmit = async (values) => {
    setLoading(true)
    const result = await authApi.updateProfile(values)
    if (result.success) {
      message.success('个人信息更新成功')
      onUpdate({ ...user, ...values })
    }
    setLoading(false)
  }

  const getRoleText = (role) => {
    const roles = {
      user: '业主',
      repairer: '维修单位',
      admin: '管理员'
    }
    return roles[role] || role
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>个人信息</h2>
      <Card style={{ maxWidth: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 24 }}>
            <UserOutlined style={{ fontSize: 40, color: '#fff' }} />
          </div>
          <div>
            <h3 style={{ margin: 0 }}>{user?.name || user?.username}</h3>
            <p style={{ margin: '8px 0 0', color: '#999' }}>
              {getRoleText(user?.role)}
            </p>
            <p style={{ margin: '4px 0 0', color: '#999' }}>用户名: {user?.username}</p>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="联系电话"
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item
            name="email"
            label="电子邮箱"
          >
            <Input placeholder="请输入电子邮箱" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Profile
