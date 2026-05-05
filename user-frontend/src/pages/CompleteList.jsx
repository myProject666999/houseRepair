import React, { useState, useEffect } from 'react'
import { Table, Button, Select, Space, Tag, Spin, Card } from 'antd'
import { EyeOutlined, EditOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { repairerApi } from '../utils/api'

const { Option } = Select

function CompleteList() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [currentPage, pageSize])

  const fetchData = async () => {
    setLoading(true)
    const result = await repairerApi.getCompletes({
      page: currentPage,
      page_size: pageSize
    })
    if (result.success) {
      setData(result.data.list || [])
      setTotal(result.data.total || 0)
    }
    setLoading(false)
  }

  const columns = [
    {
      title: '申报单号',
      dataIndex: ['application', 'application_number'],
      key: 'application_number',
      render: (text, record) => record.application?.application_number || '-',
    },
    {
      title: '维修类型',
      dataIndex: ['application', 'repair_type'],
      key: 'repair_type',
      render: (text, record) => record.application?.repair_type || '-',
    },
    {
      title: '申请人',
      dataIndex: ['application', 'user', 'name'],
      key: 'user_name',
      render: (text, record) => record.application?.user?.name || '-',
    },
    {
      title: '维修费用',
      dataIndex: 'repair_cost',
      key: 'repair_cost',
      render: (cost) => `¥${cost || 0}`,
    },
    {
      title: '工时',
      dataIndex: 'work_hours',
      key: 'work_hours',
      render: (hours) => `${hours || 0} 小时`,
    },
    {
      title: '满意度',
      dataIndex: 'user_satisfaction',
      key: 'user_satisfaction',
      render: (s) => s ? (
        <Tag color="green">已评价</Tag>
      ) : (
        <Tag color="orange">未评价</Tag>
      ),
    },
    {
      title: '完成时间',
      dataIndex: 'complete_time',
      key: 'complete_time',
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
            icon={<EyeOutlined />}
            onClick={() => navigate(`/applications/${record.application_id}`)}
          >
            查看
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>维修完成记录</h2>

      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
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

export default CompleteList
