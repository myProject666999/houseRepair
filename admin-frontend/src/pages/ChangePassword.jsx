import React, { useState } from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { authApi } from '../utils/api'

function ChangePassword() {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const handleSubmit = async (values) => {
    if (values.new_password !== values.confirm_password) {
      message.error('两次输入的新密码不一致')
      return
    }

    setLoading(true)
    const result = await authApi.updatePassword({
      old_password: values.old_password,
      new_password: values.new_password
    })
    if (result.success) {
      message.success('密码修改成功')
      form.resetFields()
    }
    setLoading(false)
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>修改密码</h2>
      <Card style={{ maxWidth: 500 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="old_password"
            label="原密码"
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Input.Password
              placeholder="请输入原密码"
              prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            />
          </Form.Item>
          <Form.Item
            name="new_password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度不能少于6位' }
            ]}
          >
            <Input.Password
              placeholder="请输入新密码"
              prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            />
          </Form.Item>
          <Form.Item
            name="confirm_password"
            label="确认新密码"
            rules={[{ required: true, message: '请再次输入新密码' }]}
          >
            <Input.Password
              placeholder="请再次输入新密码"
              prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              确认修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default ChangePassword
