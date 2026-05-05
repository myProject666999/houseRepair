import request from './request'

export const authApi = {
  login: (data) => request.post('/login', data),
  register: (data) => request.post('/register', data),
  getInfo: () => request.get('/user/info'),
  updatePassword: (data) => request.post('/user/password', data),
  updateProfile: (data) => request.put('/user/profile', data)
}

export const userApi = {
  getList: (params) => request.get('/users', { params }),
  getById: (id) => request.get(`/users/${id}`),
  create: (data) => request.post('/users', data),
  update: (id, data) => request.put(`/users/${id}`, data),
  delete: (id) => request.delete(`/users/${id}`)
}

export const houseApi = {
  getList: (params) => request.get('/houses', { params }),
  getById: (id) => request.get(`/houses/${id}`),
  create: (data) => request.post('/houses', data),
  update: (id, data) => request.put(`/houses/${id}`, data),
  delete: (id) => request.delete(`/houses/${id}`)
}

export const applicationApi = {
  getList: (params) => request.get('/applications', { params }),
  getById: (id) => request.get(`/applications/${id}`),
  assign: (id, data) => request.post(`/applications/${id}/assign`, data),
  delete: (id) => request.delete(`/applications/${id}`)
}

export const maintenanceApi = {
  getList: (params) => request.get('/maintenances', { params }),
  getById: (id) => request.get(`/maintenances/${id}`),
  create: (data) => request.post('/maintenances', data),
  update: (id, data) => request.put(`/maintenances/${id}`, data),
  delete: (id) => request.delete(`/maintenances/${id}`)
}

export const dashboardApi = {
  getStats: () => request.get('/dashboard/stats')
}
