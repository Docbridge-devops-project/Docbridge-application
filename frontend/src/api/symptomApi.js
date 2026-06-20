import api from './axios';

export const symptomApi = {
  list: (params) => api.get('/symptoms', { params }),
  getById: (id) => api.get(`/symptoms/${id}`),
  create: (data) => api.post('/symptoms', data),
  update: (id, data) => api.put(`/symptoms/${id}`, data),
  delete: (id) => api.delete(`/symptoms/${id}`),
  getOngoing: () => api.get('/symptoms/ongoing'),
  getTrends: () => api.get('/symptoms/trends'),
  aiInsight: (id) => api.post(`/symptoms/${id}/ai-insight`),
};
