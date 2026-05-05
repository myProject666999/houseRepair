import axios from 'axios'
import { message } from 'antd'

const request = axios.create({
  baseURL: '/api',
  timeout: 30000
})

request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  response => {
    const { code, message: msg, data } = response.data
    if (code === 200) {
      return { success: true, data, message: msg }
    } else {
      message.error(msg || '请求失败')
      return { success: false, data: null, message: msg }
    }
  },
  error => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        message.error('登录已过期，请重新登录')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      } else if (status === 403) {
        message.error('无权限访问')
      } else {
        message.error(data?.message || '请求失败')
      }
    } else {
      message.error('网络错误，请检查网络连接')
    }
    return { success: false, data: null, message: error.message }
  }
)

export default request
