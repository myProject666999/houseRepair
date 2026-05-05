import React, { useState, useEffect } from 'react'
import { Descriptions, Card, Tag, Button, Spin, message, Modal, Form, Input, Select, Rate } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { applicationApi, repairerApi, feedbackApi } from '../utils/api'

const { Option } = Select
const { TextArea } = Input

function ApplicationDetail({ isRepairer }) {
  const [application, setApplication] = useState(null)
  const [complete, setComplete] = useState(null)
  const [loading, setLoading] = useState(false)
  const [feedbackVisible, setFeedbackVisible] = useState(false)
  const [feedbackForm] = Form.useForm()
  const navigate = useNavigate()
  const { id } = useParams()

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    setLoading(true)
    const result = await applicationApi.getById(id)
    if (result.success) {
      setApplication(result.data)
      if (result.data.status === 'completed') {
        const completeResult = await repairerApi.getCompletes({ application_id: id })
        if (completeResult.success && completeResult.data.list?.length > 0) {
          setComplete(completeResult.data.list[0])
        }
      }
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

  const handleFeedbackSubmit = async (values) => {
    if (!complete) return
    const result = await feedbackApi.submit(complete.id, {
      satisfaction: values.satisfaction,
      feedback: values.feedback
    })
    if (result.success) {
      message.success('评价提交成功')
      setFeedbackVisible(false)
      fetchData()
    }
  }

  if (loading) {
    return <Spin style={{ display: 'block', textAlign: 'center', padding: 50 }} />
  }

  if (!application) {
    return <div style={{ padding: 20 }}>未找到申报单</div>
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

      <h2 style={{ marginBottom: 24 }}>申报单详情</h2>

      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="申报单号">{application.application_number}</Descriptions.Item>
          <Descriptions.Item label="状态">{getStatusTag(application.status)}</Descriptions.Item>
          <Descriptions.Item label="维修类型">{application.repair_type}</Descriptions.Item>
          <Descriptions.Item label="房屋">{application.house?.house_number || '-'}</Descriptions.Item>
          <Descriptions.Item label="申请人">{application.user?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{application.contact_phone}</Descriptions.Item>
          <Descriptions.Item label="维修单位">{application.repairer?.name || '未派单'}</Descriptions.Item>
          <Descriptions.Item label="申请时间">{application.apply_time ? new Date(application.apply_time).toLocaleString() : '-'}</Descriptions.Item>
          <Descriptions.Item label="问题描述" span={2}>
            {application.description}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {complete && (
        <Card title="维修完成记录" style={{ marginBottom: 16 }}>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="维修内容" span={2}>{complete.repair_content}</Descriptions.Item>
            <Descriptions.Item label="维修费用">¥{complete.repair_cost || 0}</Descriptions.Item>
            <Descriptions.Item label="工时">{complete.work_hours || 0} 小时</Descriptions.Item>
            <Descriptions.Item label="使用材料">{complete.materials_used || '-'}</Descriptions.Item>
            <Descriptions.Item label="完成时间">{complete.complete_time ? new Date(complete.complete_time).toLocaleString() : '-'}</Descriptions.Item>
            <Descriptions.Item label="质量检查">{complete.quality_check || '-'}</Descriptions.Item>
            <Descriptions.Item label="用户满意度">
              {complete.user_satisfaction ? <Rate disabled value={complete.user_satisfaction} /> : '未评价'}
            </Descriptions.Item>
            {complete.user_feedback && (
              <Descriptions.Item label="用户反馈" span={2}>{complete.user_feedback}</Descriptions.Item>
            )}
          </Descriptions>
          {!isRepairer && !complete.user_satisfaction && (
            <div style={{ marginTop: 16 }}>
              <Button type="primary" onClick={() => setFeedbackVisible(true)}>
                进行评价
              </Button>
            </div>
          )}
        </Card>
      )}

      <Modal
        title="维修评价"
        open={feedbackVisible}
        onOk={feedbackForm.submit}
        onCancel={() => setFeedbackVisible(false)}
      >
        <Form form={feedbackForm} layout="vertical">
          <Form.Item
            name="satisfaction"
            label="满意度"
            rules={[{ required: true, message: '请选择满意度' }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item name="feedback" label="评价内容">
            <TextArea rows={4} placeholder="请输入评价内容" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ApplicationDetail
