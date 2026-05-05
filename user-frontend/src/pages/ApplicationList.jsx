import React, { useState, useEffect } from 'react'
import { Table, Button, Select, Space, Tag, Spin, Card, message } from 'antd'
import { PlusOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { applicationApi, repairerApi } from '../utils/api'

const { Option } = Select

function ApplicationList({ isRepairer }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [status, setStatus] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [currentPage, pageSize, status])

  const fetchData = async () => {
    setLoading(true)
    const params = {
      page: currentPage,
      page_size: pageSize
    }
    if (status) {
      params.status = status
    }
    const result = isRepairer
      ? await repairerApi.getApplications(params)
      : await applicationApi.getList(params)
    if (result.success) {
      setData(result.data.list || [])
      setTotal(result.data.total || 0)
    }
    setLoading(false)
  }

  const handleStartRepair = async (id) => {
    const result = await repairerApi.updateStatus(id, { status: 'in_progress' })
    if (result.success) {
      message.success('已开始维修')
      fetchData()
    }
  }

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { text: '待处理', color: 'orange' },
      assigned: { text: '已派单', color: 'blue' },
      in_progress: { text: '维修中', color: 'green' },
      completed: { text: '已完成', color: 'default' }
    }
    const info = statusMap[status] || { text: status, color: 'default' }
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const commonColumns = [
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '申请时间',
      dataIndex: 'apply_time',
      key: 'apply_time',
      render: (time) => time ? new Date(time).toLocaleString() : '-',
    },
  ]

  const userColumns = [
    ...commonColumns,
    {
      title: '维修单位',
      dataIndex: ['repairer', 'name'],
      key: 'repairer_name',
      render: (text, record) => record.repairer?.name || '未派单',
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
            onClick={() => navigate(`/applications/${record.id}`)}
          >
            查看
          </Button>
          {record.status === 'pending' && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => navigate(`/applications/edit/${record.id}`)}
            >
              编辑
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const repairerColumns = [
    ...commonColumns,
    {
      title: '申请人',
      dataIndex: ['user', 'name'],
      key: 'user_name',
      render: (text, record) => record.user?.name || '-',
    },
    {
      title: '联系电话',
      dataIndex: 'contact_phone',
      key: 'contact_phone',
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/applications/${record.id}`)}
          >
            查看
          </Button>
          {record.status === 'assigned' && (
            <Button
              type="link"
              onClick={() => handleStartRepair(record.id)}
            >
              开始维修
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button
              type="link"
              onClick={() => navigate(`/completes/create/${record.id}`)}
            >
              提交维修完成
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>维修申报单</h2>
        {!isRepairer && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/applications/create')}>
            申报维修
          </Button>
        )}
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Select
            placeholder="筛选状态"
            style={{ width: 150 }}
            allowClear
            value={status || undefined}
            onChange={(value) => {
              setStatus(value || '')
              setCurrentPage(1)
            }}
          >
            <Option value="pending">待处理</Option>
            <Option value="assigned">已派单</Option>
            <Option value="in_progress">维修中</Option>
            <Option value="completed">已完成</Option>
          </Select>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={isRepairer ? repairerColumns : userColumns}
            dataSource={data}
            rowKey="id"
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
        </Spin>
      </Card>
    </div>
  )
}

export default ApplicationList
