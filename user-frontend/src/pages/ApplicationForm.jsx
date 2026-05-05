import React, { useState, useEffect } from 'react'
import { Form, Input, Select, Button, Card, message, Spin } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { applicationApi, houseApi } from '../utils/api'

const { Option } = Select
const { TextArea } = Input

function ApplicationForm() {
  const [form] = Form.useForm()
  const [houses, setHouses] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  useEffect(() => {
    fetchHouses()
    if (isEdit) {
      fetchApplication()
    }
  }, [id])

  const fetchHouses = async () => {
    const result = await houseApi.getList({ page_size: 100 })
    if (result.success) {
      setHouses(result.data.list || [])
    }
  }

  const fetchApplication = async () => {
    setLoading(true)
    const result = await applicationApi.getById(id)
    if (result.success) {
      form.setFieldsValue({
        house_id: result.data.house_id,
        repair_type: result.data.repair_type,
        description: result.data.description,
        contact_name: result.data.contact_name,
        contact_phone: result.data.contact_phone,
      })
    }
    setLoading(false)
  }

  const handleSubmit = async (values) => {
    setSubmitLoading(true)
    let result
    if (isEdit) {
      result = await applicationApi.update(id, values)
    } else {
      result = await applicationApi.create(values)
    }
    if (result.success) {
      message.success(isEdit ? '更新成功' : '申报成功')
      navigate('/applications')
    }
    setSubmitLoading(false)
  }

  if (loading) {
    return <Spin style={{ display: 'block', textAlign: 'center', padding: 50 }} />
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/applications')}
        >
          返回列表
        </Button>
      </div>

      <h2 style={{ marginBottom: 24 }}>{isEdit ? '编辑维修申报单' : '申报维修'}</h2>

      <Card style={{ maxWidth: 800 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="form-section"
        >
          <Form.Item
            name="house_id"
            label="选择房屋"
            rules={[{ required: true, message: '请选择房屋' }]}
          >
            <Select placeholder="请选择房屋">
              {houses.map(h => (
                <Option key={h.id} value={h.id}>
                  {h.house_number} - {h.owner_name || h.building}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="repair_type"
            label="维修类型"
            rules={[{ required: true, message: '请选择维修类型' }]}
          >
            <Select placeholder="请选择维修类型">
              <Option value="水电维修">水电维修</Option>
              <Option value="门窗维修">门窗维修</Option>
              <Option value="墙面地板">墙面地板</Option>
              <Option value="家电维修">家电维修</Option>
              <Option value="管道疏通">管道疏通</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="问题描述"
            rules={[{ required: true, message: '请描述问题' }]}
          >
            <TextArea
              rows={4}
              placeholder="请详细描述需要维修的问题"
            />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="contact_name"
              label="联系人姓名"
              rules={[{ required: true, message: '请输入联系人姓名' }]}
            >
              <Input placeholder="请输入联系人姓名" />
            </Form.Item>
            <Form.Item
              name="contact_phone"
              label="联系电话"
              rules={[{ required: true, message: '请输入联系电话' }]}
            >
              <Input placeholder="请输入联系电话" />
            </Form.Item>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitLoading} size="large">
              {isEdit ? '提交修改' : '提交申报'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default ApplicationForm
