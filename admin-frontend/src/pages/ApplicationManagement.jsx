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
  Tag,
  Descriptions,
  Card
} from 'antd'
import { SearchOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons'
import { applicationApi, userApi } from '../utils/api'

const { Option } = Select
const { TextArea } = Input

function ApplicationManagement() {
  const [data, setData] = useState([])
  const [repairers, setRepairers] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchParams, setSearchParams] = useState({ keyword: '', status: '' })
  const [detailVisible, setDetailVisible] = useState(false)
  const [assignVisible, setAssignVisible] = useState(false)
  const [currentApplication, setCurrentApplication] = useState(null)
  const [assignForm] = Form.useForm()

  const fetchData = async () => {
    setLoading(true)
    const result = await applicationApi.getList({
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

  const fetchRepairers = async () => {
    const result = await userApi.getList({ role: 'repairer', page_size: 100 })
    if (result.success) {
      setRepairers(result.data.list || [])
    }
  }

  useEffect(() => {
    fetchData()
    fetchRepairers()
  }, [currentPage, pageSize, searchParams])

  const handleSearch = (values) => {
    setSearchParams(values)
    setCurrentPage(1)
  }

  const handleView = (record) => {
    setCurrentApplication(record)
    setDetailVisible(true)
  }

  const handleAssign = (record) => {
    setCurrentApplication(record)
    assignForm.setFieldsValue({ repairer_id: null })
    setAssignVisible(true)
  }

  const handleDelete = async (id) => {
    const result = await applicationApi.delete(id)
    if (result.success) {
      message.success('删除成功')
      fetchData()
    }
  }

  const handleAssignOk = async () => {
    try {
      const values = await assignForm.validateFields()
      const result = await applicationApi.assign(currentApplication.id, values)
      if (result.success) {
        message.success('派单成功')
        setAssignVisible(false)
        fetchData()
      }
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { text: '待处理', color: 'orange' },
      assigned: { text: '已派单', color: 'blue' },
      in_progress: { text: '维修中', color: 'green' },
      completed: { text: '已完成', color: 'default' },
      closed: { text: '已关闭', color: 'gray' }
    }
    const info = statusMap[status] || { text: status, color: 'default' }
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const columns = [
    {
      title: '申报单号',
      dataIndex: 'application_number',
      key: 'application_number',
    },
    {
      title: '维修类型',
      dataIndex: 'repair_type',
      key: 'repair_type',
    },
    {
      title: '申请人',
      dataIndex: ['user', 'name'],
      key: 'user_name',
      render: (text, record) => record.user?.name || '-',
    },
    {
      title: '房屋',
      dataIndex: ['house', 'house_number'],
      key: 'house_number',
      render: (text, record) => record.house?.house_number || '-',
    },
    {
      title: '联系电话',
      dataIndex: 'contact_phone',
      key: 'contact_phone',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '维修单位',
      dataIndex: ['repairer', 'name'],
      key: 'repairer_name',
      render: (text, record) => record.repairer?.name || '-',
    },
    {
      title: '申请时间',
      dataIndex: 'apply_time',
      key: 'apply_time',
      render: (time) => time ? new Date(time).toLocaleString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          {record.status === 'pending' && (
            <Button
              type="link"
              onClick={() => handleAssign(record)}
            >
              派单
            </Button>
          )}
          <Popconfirm
            title="确定要删除这个申报单吗？"
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
      <h2 style={{ marginBottom: 16 }}>维修申报单管理</h2>

      <Form layout="inline" onFinish={handleSearch} style={{ marginBottom: 16 }}>
        <Form.Item name="keyword">
          <Input
            placeholder="搜索申报单号/申请人"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
          />
        </Form.Item>
        <Form.Item name="status">
          <Select placeholder="选择状态" style={{ width: 150 }} allowClear>
            <Option value="pending">待处理</Option>
            <Option value="assigned">已派单</Option>
            <Option value="in_progress">维修中</Option>
            <Option value="completed">已完成</Option>
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
        title="申报单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        {currentApplication && (
          <Card size="small">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="申报单号">{currentApplication.application_number}</Descriptions.Item>
              <Descriptions.Item label="状态">{getStatusTag(currentApplication.status)}</Descriptions.Item>
              <Descriptions.Item label="维修类型">{currentApplication.repair_type}</Descriptions.Item>
              <Descriptions.Item label="申请人">{currentApplication.user?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="房屋">{currentApplication.house?.house_number || '-'}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{currentApplication.contact_phone}</Descriptions.Item>
              <Descriptions.Item label="维修单位">{currentApplication.repairer?.name || '未派单'}</Descriptions.Item>
              <Descriptions.Item label="申请时间">{currentApplication.apply_time ? new Date(currentApplication.apply_time).toLocaleString() : '-'}</Descriptions.Item>
              <Descriptions.Item label="问题描述" span={2}>
                {currentApplication.description}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </Modal>

      <Modal
        title="派单"
        open={assignVisible}
        onOk={handleAssignOk}
        onCancel={() => setAssignVisible(false)}
      >
        <Form form={assignForm} layout="vertical">
          <Form.Item
            name="repairer_id"
            label="选择维修单位"
            rules={[{ required: true, message: '请选择维修单位' }]}
          >
            <Select placeholder="请选择维修单位">
              {repairers.map(r => (
                <Option key={r.id} value={r.id}>{r.name} ({r.phone})</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ApplicationManagement
