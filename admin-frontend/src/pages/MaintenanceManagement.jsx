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
  DatePicker,
  InputNumber
} from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { maintenanceApi, houseApi } from '../utils/api'

const { Option } = Select
const { TextArea } = Input

function MaintenanceManagement() {
  const [data, setData] = useState([])
  const [houses, setHouses] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchParams, setSearchParams] = useState({ keyword: '', status: '' })
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [form] = Form.useForm()

  const fetchData = async () => {
    setLoading(true)
    const result = await maintenanceApi.getList({
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

  const fetchHouses = async () => {
    const result = await houseApi.getList({ page_size: 100 })
    if (result.success) {
      setHouses(result.data.list || [])
    }
  }

  useEffect(() => {
    fetchData()
    fetchHouses()
  }, [currentPage, pageSize, searchParams])

  const handleSearch = (values) => {
    setSearchParams(values)
    setCurrentPage(1)
  }

  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    form.setFieldsValue({
      maintenance_type: record.maintenance_type,
      house_id: record.house_id,
      description: record.description,
      plan_date: record.plan_date ? new Date(record.plan_date) : null,
      actual_date: record.actual_date ? new Date(record.actual_date) : null,
      cost: record.cost,
      status: record.status,
      remark: record.remark
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    const result = await maintenanceApi.delete(id)
    if (result.success) {
      message.success('删除成功')
      fetchData()
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      const submitData = {
        ...values,
        plan_date: values.plan_date ? values.plan_date.toISOString() : null,
        actual_date: values.actual_date ? values.actual_date.toISOString() : null
      }
      let result
      if (editingRecord) {
        result = await maintenanceApi.update(editingRecord.id, submitData)
      } else {
        result = await maintenanceApi.create(submitData)
      }
      if (result.success) {
        message.success(editingRecord ? '更新成功' : '创建成功')
        setModalVisible(false)
        fetchData()
      }
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const getStatusTag = (status) => {
    const statusMap = {
      planned: { text: '计划中', color: 'blue' },
      in_progress: { text: '进行中', color: 'orange' },
      completed: { text: '已完成', color: 'green' },
      cancelled: { text: '已取消', color: 'default' }
    }
    const info = statusMap[status] || { text: status, color: 'default' }
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const columns = [
    {
      title: '维护类型',
      dataIndex: 'maintenance_type',
      key: 'maintenance_type',
    },
    {
      title: '房屋',
      dataIndex: ['house', 'house_number'],
      key: 'house_number',
      render: (text, record) => record.house?.house_number || '-',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '计划日期',
      dataIndex: 'plan_date',
      key: 'plan_date',
      render: (time) => time ? new Date(time).toLocaleDateString() : '-',
    },
    {
      title: '实际日期',
      dataIndex: 'actual_date',
      key: 'actual_date',
      render: (time) => time ? new Date(time).toLocaleDateString() : '-',
    },
    {
      title: '费用',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost) => cost ? `¥${cost}` : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
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
            title="确定要删除这个维护记录吗？"
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
        <h2>房屋维护管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加维护
        </Button>
      </div>

      <Form layout="inline" onFinish={handleSearch} style={{ marginBottom: 16 }}>
        <Form.Item name="keyword">
          <Input
            placeholder="搜索维护类型/房号"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
          />
        </Form.Item>
        <Form.Item name="status">
          <Select placeholder="选择状态" style={{ width: 150 }} allowClear>
            <Option value="planned">计划中</Option>
            <Option value="in_progress">进行中</Option>
            <Option value="completed">已完成</Option>
            <Option value="cancelled">已取消</Option>
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
        title={editingRecord ? '编辑维护记录' : '添加维护记录'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="maintenance_type"
            label="维护类型"
            rules={[{ required: true, message: '请输入维护类型' }]}
          >
            <Select placeholder="请选择维护类型">
              <Option value="日常检查">日常检查</Option>
              <Option value="定期保养">定期保养</Option>
              <Option value="设备维护">设备维护</Option>
              <Option value="防水检查">防水检查</Option>
              <Option value="消防检查">消防检查</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="house_id"
            label="房屋"
            rules={[{ required: true, message: '请选择房屋' }]}
          >
            <Select placeholder="请选择房屋">
              {houses.map(h => (
                <Option key={h.id} value={h.id}>{h.house_number} ({h.owner_name || '无业主'})</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="维护描述">
            <TextArea rows={3} placeholder="请输入维护描述" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="plan_date" label="计划日期">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="actual_date" label="实际日期">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="cost" label="费用">
              <InputNumber
                placeholder="请输入费用"
                style={{ width: '100%' }}
                min={0}
                precision={2}
              />
            </Form.Item>
            <Form.Item name="status" label="状态">
              <Select placeholder="请选择状态">
                <Option value="planned">计划中</Option>
                <Option value="in_progress">进行中</Option>
                <Option value="completed">已完成</Option>
                <Option value="cancelled">已取消</Option>
              </Select>
            </Form.Item>
          </div>
          <Form.Item name="remark" label="备注">
            <TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MaintenanceManagement
