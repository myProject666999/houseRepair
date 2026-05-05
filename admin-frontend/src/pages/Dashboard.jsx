import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Spin } from 'antd'
import { dashboardApi, applicationApi } from '../utils/api'

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [statsResult, appsResult] = await Promise.all([
      dashboardApi.getStats(),
      applicationApi.getList({ page: 1, page_size: 5 })
    ])

    if (statsResult.success) {
      setStats(statsResult.data)
    }
    if (appsResult.success) {
      setApplications(appsResult.data.list || [])
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
            <div className="stat-number">{stats?.user_count || 0}</div>
            <div className="stat-label">业主总数</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats?.house_count || 0}</div>
            <div className="stat-label">房屋总数</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats?.pending_count || 0}</div>
            <div className="stat-label">待处理维修</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats?.completed_count || 0}</div>
            <div className="stat-label">已完成维修</div>
          </div>
        </div>

        <Card title="最新维修申报单" style={{ marginTop: 24 }}>
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

export default Dashboard
