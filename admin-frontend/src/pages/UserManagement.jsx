import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Modal,
  Form,
  message,
  Popconfirm,
  Tag
} from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { userApi } from '../utils/api'

const { Option } = Select

function UserManagement() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchParams, setSearchParams] = useState({ keyword: '', role: '' })
  const [modalVisible, setModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form] = Form.useForm()

  const fetchData = async () => {
    setLoading(true)
    const result = await userApi.getList({
      page: currentPage,
      page_size: pageSize,
      ...searchParams
    })
    if (result.success) {
      setData(result.data.list || [])
      setTotal(result.data.total || 0)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [currentPage, pageSize, searchParams])

  const handleSearch = (values) => {
    setSearchParams(values)
    setCurrentPage(1)
  }

  const handleAdd = () => {
    setEditingUser(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingUser(record)
    form.setFieldsValue({
      username: record.username,
      name: record.name,
      phone: record.phone,
      email: record.email,
      role: record.role,
      status: record.status
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    const result = await userApi.delete(id)
    if (result.success) {
      message.success('删除成功')
      fetchData()
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      let result
      if (editingUser) {
        result = await userApi.update(editingUser.id, values)
      } else {
        if (!values.password) {
          message.error('请输入密码')
          return
        }
        result = await userApi.create(values)
      }
      if (result.success) {
        message.success(editingUser ? '更新成功' : '创建成功')
        setModalVisible(false)
        fetchData()
      }
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const getRoleTag = (role) => {
    const roleMap = {
      admin: { text: '管理员', color: 'red' },
      user: { text: '业主', color: 'blue' },
      repairer: { text: '维修单位', color: 'green' }
    }
    const info = roleMap[role] || { text: role, color: 'default' }
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => getRoleTag(role),
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => time ? new Date(time).toLocaleString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>业主管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加用户
        </Button>
      </div>

      <Form layout="inline" onFinish={handleSearch} style={{ marginBottom: 16 }}>
        <Form.Item name="keyword">
          <Input
            placeholder="搜索用户名/姓名/电话"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
          />
        </Form.Item>
        <Form.Item name="role">
          <Select placeholder="选择角色" style={{ width: 150 }} allowClear>
            <Option value="user">业主</Option>
            <Option value="repairer">维修单位</Option>
            <Option value="admin">管理员</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">搜索</Button>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
          onChange: (page, size) => {
            setCurrentPage(page)
            setPageSize(size)
          },
        }}
      />

      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" disabled={!!editingUser} />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}
          <Form.Item name="name" label="姓名">
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item name="phone" label="电话">
            <Input placeholder="请输入电话" />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select placeholder="请选择角色">
              <Option value="user">业主</Option>
              <Option value="repairer">维修单位</Option>
              <Option value="admin">管理员</Option>
            </Select>
          </Form.Item>
          {editingUser && (
            <Form.Item name="status" label="状态">
              <Select>
                <Option value={1}>启用</Option>
                <Option value={0}>禁用</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  )
}

export default UserManagement
