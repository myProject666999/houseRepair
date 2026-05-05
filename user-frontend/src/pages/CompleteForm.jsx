import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, message, Spin, Descriptions, Select, InputNumber } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { applicationApi, repairerApi } from '../utils/api'

const { TextArea } = Input
const { Option } = Select

function CompleteForm() {
  const [form] = Form.useForm()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const navigate = useNavigate()
  const { id, applicationId } = useParams()
  const isEdit = !!id

  useEffect(() => {
    if (applicationId) {
      fetchApplication()
    }
    if (id) {
      fetchComplete()
    }
  }, [id, applicationId])

  const fetchApplication = async () => {
    setLoading(true)
    const result = await applicationApi.getById(applicationId)
    if (result.success) {
      setApplication(result.data)
    }
    setLoading(false)
  }

  const fetchComplete = async () => {
    setLoading(true)
    const result = await repairerApi.getCompleteById(id)
    if (result.success) {
      const data = result.data
      form.setFieldsValue({
        repair_content: data.repair_content,
        repair_cost: data.repair_cost,
        materials_used: data.materials_used,
        work_hours: data.work_hours,
        quality_check: data.quality_check,
      })
      setApplication(data.application)
    }
    setLoading(false)
  }

  const handleSubmit = async (values) => {
    setSubmitLoading(true)
    let result
    const submitData = {
      ...values,
      application_id: isEdit ? application?.id : parseInt(applicationId)
    }
    if (isEdit) {
      result = await repairerApi.updateComplete(id, submitData)
    } else {
      result = await repairerApi.createComplete(submitData)
    }
    if (result.success) {
      message.success(isEdit ? '更新成功' : '提交成功')
      navigate('/completes')
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
          onClick={() => navigate(isEdit ? '/completes' : '/applications')}
        >
          返回列表
        </Button>
      </div>

      <h2 style={{ marginBottom: 24 }}>{isEdit ? '编辑维修完成记录' : '提交维修完成'}</h2>

      {application && (
        <Card title="申报单信息" style={{ marginBottom: 16, maxWidth: 800 }}>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="申报单号">{application.application_number}</Descriptions.Item>
            <Descriptions.Item label="维修类型">{application.repair_type}</Descriptions.Item>
            <Descriptions.Item label="申请人">{application.user?.name || '-'}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{application.contact_phone}</Descriptions.Item>
            <Descriptions.Item label="问题描述" span={2}>{application.description}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <Card style={{ maxWidth: 800 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="form-section"
        >
          <Form.Item
            name="repair_content"
            label="维修内容"
            rules={[{ required: true, message: '请输入维修内容' }]}
          >
            <TextArea rows={4} placeholder="请详细描述维修内容" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="repair_cost"
              label="维修费用"
              rules={[{ required: true, message: '请输入维修费用' }]}
            >
              <InputNumber
                placeholder="请输入维修费用"
                style={{ width: '100%' }}
                min={0}
                precision={2}
                prefix="¥"
              />
            </Form.Item>
            <Form.Item
              name="work_hours"
              label="工时(小时)"
              rules={[{ required: true, message: '请输入工时' }]}
            >
              <InputNumber
                placeholder="请输入工时"
                style={{ width: '100%' }}
                min={0}
                precision={1}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="materials_used"
            label="使用材料"
          >
            <TextArea rows={2} placeholder="请输入使用的材料" />
          </Form.Item>

          <Form.Item
            name="quality_check"
            label="质量检查结果"
            rules={[{ required: true, message: '请选择质量检查结果' }]}
          >
            <Select placeholder="请选择质量检查结果">
              <Option value="合格">合格</Option>
              <Option value="良好">良好</Option>
              <Option value="优秀">优秀</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitLoading} size="large">
              {isEdit ? '保存修改' : '提交完成'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default CompleteForm
