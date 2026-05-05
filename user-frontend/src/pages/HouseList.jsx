import React, { useState, useEffect } from 'react'
import { Table, Card, Tag, Spin } from 'antd'
import { houseApi } from '../utils/api'

function HouseList() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    fetchData()
  }, [currentPage, pageSize])

  const fetchData = async () => {
    setLoading(true)
    const result = await houseApi.getList({
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
      render: (type) => <Tag color="blue">{type}</Tag>,
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
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>我的房屋信息</h2>
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

export default HouseList
