import request from './request'

export const authApi = {
  login: (data) => request.post('/login', data),
  register: (data) => request.post('/register', data),
  getInfo: () => request.get('/user/info'),
  updatePassword: (data) => request.post('/user/password', data),
  updateProfile: (data) => request.put('/user/profile', data)
}

export const houseApi = {
  getList: (params) => request.get('/user/houses', { params }),
  getById: (id) => request.get(`/houses/${id}`)
}

export const applicationApi = {
  getList: (params) => request.get('/user/applications', { params }),
  getById: (id) => request.get(`/user/applications/${id}`),
  create: (data) => request.post('/user/applications', data),
  update: (id, data) => request.put(`/user/applications/${id}`, data)
}

export const repairerApi = {
  getApplications: (params) => request.get('/repairer/applications', { params }),
  updateStatus: (id, data) => request.put(`/repairer/applications/${id}/status`, data),
  getCompletes: (params) => request.get('/repairer/completes', { params }),
  getCompleteById: (id) => request.get(`/repairer/completes/${id}`),
  createComplete: (data) => request.post('/repairer/completes', data),
  updateComplete: (id, data) => request.put(`/repairer/completes/${id}`, data)
}

export const feedbackApi = {
  submit: (id, data) => request.post(`/completes/${id}/feedback`, data)
}
