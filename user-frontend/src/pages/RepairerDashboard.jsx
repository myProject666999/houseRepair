import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Spin } from 'antd'
import { repairerApi } from '../utils/api'

function RepairerDashboard() {
  const [applications, setApplications] = useState([])
  const [stats, setStats] = useState({ assigned: 0, inProgress: 0, completed: 0 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const result = await repairerApi.getApplications({ page: 1, page_size: 5 })
    if (result.success) {
      const list = result.data.list || []
      setApplications(list)
      const assigned = list.filter(a => a.status === 'assigned').length
      const inProgress = list.filter(a => a.status === 'in_progress').length
      const completed = list.filter(a => a.status === 'completed').length
      setStats({ assigned, inProgress, completed })
    }
    setLoading(false)
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
      title: '申请时间',
      dataIndex: 'apply_time',
      key: 'apply_time',
      render: (time) => time ? new Date(time).toLocaleString() : '-',
    },
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>首页</h2>
      <Spin spinning={loading}>
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.assigned}</div>
            <div className="stat-label">已派单待处理</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.inProgress}</div>
            <div className="stat-label">维修中</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-label">已完成</div>
          </div>
        </div>

        <Card title="最近的维修申报单" style={{ marginTop: 24 }}>
          <Table
            columns={columns}
            dataSource={applications}
            rowKey="id"
            pagination={false}
          />
        </Card>
      </Spin>
    </div>
  )
}

export default RepairerDashboard
