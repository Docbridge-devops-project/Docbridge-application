import api from './axios';

export const consultationApi = {
  list: (params) => api.get('/consultations', { params }),
  getById: (id) => api.get(`/consultations/${id}`),
  create: (data) => api.post('/consultations', data),
  update: (id, data) => api.put(`/consultations/${id}`, data),
  delete: (id) => api.delete(`/consultations/${id}`),
  aiExplain: (id) => api.post(`/consultations/${id}/ai-explain`),
  getStats: () => api.get('/consultations/stats/summary'),
};
