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
  Popconfirm
} from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { houseApi, userApi } from '../utils/api'

const { Option } = Select

function HouseManagement() {
  const [data, setData] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchParams, setSearchParams] = useState({ keyword: '', building: '' })
  const [modalVisible, setModalVisible] = useState(false)
  const [editingHouse, setEditingHouse] = useState(null)
  const [form] = Form.useForm()

  const fetchData = async () => {
    setLoading(true)
    const result = await houseApi.getList({
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

  const fetchUsers = async () => {
    const result = await userApi.getList({ role: 'user', page_size: 100 })
    if (result.success) {
      setUsers(result.data.list || [])
    }
  }

  useEffect(() => {
    fetchData()
    fetchUsers()
  }, [currentPage, pageSize, searchParams])

  const handleSearch = (values) => {
    setSearchParams(values)
    setCurrentPage(1)
  }

  const handleAdd = () => {
    setEditingHouse(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingHouse(record)
    form.setFieldsValue({
      house_number: record.house_number,
      building: record.building,
      unit: record.unit,
      floor: record.floor,
      room_number: record.room_number,
      area: record.area,
      house_type: record.house_type,
      owner_name: record.owner_name,
      owner_phone: record.owner_phone,
      owner_id: record.owner_id
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    const result = await houseApi.delete(id)
    if (result.success) {
      message.success('删除成功')
      fetchData()
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      let result
      if (editingHouse) {
        result = await houseApi.update(editingHouse.id, values)
      } else {
        result = await houseApi.create(values)
      }
      if (result.success) {
        message.success(editingHouse ? '更新成功' : '创建成功')
        setModalVisible(false)
        fetchData()
      }
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const columns = [
    {
      title: '房号',
      dataIndex: 'house_number',
      key: 'house_number',
    },
    {
      title: '楼栋',
      dataIndex: 'building',
      key: 'building',
    },
    {
      title: '单元',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: '楼层',
      dataIndex: 'floor',
      key: 'floor',
    },
    {
      title: '房间号',
      dataIndex: 'room_number',
      key: 'room_number',
    },
    {
      title: '面积',
      dataIndex: 'area',
      key: 'area',
    },
    {
      title: '房屋类型',
      dataIndex: 'house_type',
      key: 'house_type',
    },
    {
      title: '业主姓名',
      dataIndex: 'owner_name',
      key: 'owner_name',
    },
    {
      title: '业主电话',
      dataIndex: 'owner_phone',
      key: 'owner_phone',
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
            title="确定要删除这个房屋信息吗？"
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
        <h2>房屋信息管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加房屋
        </Button>
      </div>

      <Form layout="inline" onFinish={handleSearch} style={{ marginBottom: 16 }}>
        <Form.Item name="keyword">
          <Input
            placeholder="搜索房号/楼栋/业主姓名"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
          />
        </Form.Item>
        <Form.Item name="building">
          <Input placeholder="楼栋" style={{ width: 120 }} />
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
        title={editingHouse ? '编辑房屋' : '添加房屋'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="house_number"
            label="房号"
            rules={[{ required: true, message: '请输入房号' }]}
          >
            <Input placeholder="请输入房号，如：A01-01" disabled={!!editingHouse} />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item name="building" label="楼栋">
              <Input placeholder="如：1栋" />
            </Form.Item>
            <Form.Item name="unit" label="单元">
              <Input placeholder="如：1单元" />
            </Form.Item>
            <Form.Item name="floor" label="楼层">
              <Input placeholder="如：5楼" />
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="room_number" label="房间号">
              <Input placeholder="如：501" />
            </Form.Item>
            <Form.Item name="area" label="面积">
              <Input placeholder="如：80㎡" />
            </Form.Item>
          </div>
          <Form.Item name="house_type" label="房屋类型">
            <Select placeholder="请选择房屋类型">
              <Option value="公租房">公租房</Option>
              <Option value="廉租房">廉租房</Option>
              <Option value="经济适用房">经济适用房</Option>
            </Select>
          </Form.Item>
          <Form.Item name="owner_id" label="关联业主">
            <Select placeholder="选择关联的业主账号" allowClear>
              {users.map(user => (
                <Option key={user.id} value={user.id}>{user.name || user.username} ({user.phone})</Option>
              ))}
            </Select>
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="owner_name" label="业主姓名">
              <Input placeholder="请输入业主姓名" />
            </Form.Item>
            <Form.Item name="owner_phone" label="业主电话">
              <Input placeholder="请输入业主电话" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default HouseManagement
